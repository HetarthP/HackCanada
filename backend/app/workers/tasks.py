"""
Celery tasks — GPU worker pipeline.
Stages 2-5: Frame extraction → 3D intelligence → Temporal smoothing → VFX.
"""

import asyncio
import logging
import math

from app.workers.celery_app import celery_app
from app.services.cloudinary import extract_frame_url, build_vfx_url, build_sandwich_url
from app.services.gemini import detect_ad_slots
from app.services.vultr import provision_gpu_worker, terminate_worker
from app.services.mediapipe_mask import generate_hand_mask
from app.database import db

logger = logging.getLogger(__name__)

# Frame extraction interval in seconds
FRAME_INTERVAL = 2.0

# Anti-jitter threshold: ignore coordinate shifts smaller than 2%
JITTER_THRESHOLD = 0.02


def _stabilize(detections: list[dict]) -> list[dict]:
    """
    Stage 3: Temporal Resonance (anti-jitter).
    Compares each slot's position to the same slot in the previous frame.
    If the Euclidean shift is < 2%, pins to the previous coordinate.
    Pure Python — no external dependencies.
    """
    if len(detections) < 2:
        return detections

    for i in range(1, len(detections)):
        prev_slots = detections[i - 1]["slots"]
        curr_slots = detections[i]["slots"]

        for j in range(min(len(prev_slots), len(curr_slots))):
            prev = prev_slots[j]
            curr = curr_slots[j]

            # Euclidean distance in normalized [0-1] XYZ space
            dist = math.sqrt(
                (curr["x"] - prev["x"]) ** 2
                + (curr["y"] - prev["y"]) ** 2
                + (curr["z"] - prev["z"]) ** 2
            )

            if dist < JITTER_THRESHOLD:
                # Pin to previous position (anti-vibration)
                curr_slots[j] = prev.copy()

    return detections


async def _save_slots_to_db(video_id: str, detections: list[dict]):
    """Save each detected AdSlot into Prisma."""
    await db.connect()
    try:
        for det in detections:
            for slot in det["slots"]:
                await db.adslot.create(
                    data={
                        "videoId": video_id,
                        "timestamp": det["time"],
                        "coordinates": slot,         # stored as JSON
                        "lighting": str(det.get("kelvin", "")),
                    }
                )
    finally:
        await db.disconnect()


@celery_app.task(bind=True, name="vpp.process_video")
def process_video_task(self, video_id: str):
    """
    Full pipeline for a single video:
    1. Provision Vultr GPU worker
    2. Extract keyframes from Cloudinary (Stage 2)
    3. Run Gemini 3D grounding on each frame (Stage 2)
    4. Stabilize coordinates with anti-jitter math (Stage 3)
    5. Save AdSlots to Prisma (Stage 5)
    6. Tear down Vultr worker (always runs — even on crash)
    """
    logger.info(f"[Task {self.request.id}] Starting pipeline for video: {video_id}")

    # ── Provision GPU worker ───────────────────
    instance_id = asyncio.run(provision_gpu_worker(f"vpp-{video_id[:8]}"))
    logger.info(f"  Vultr worker provisioned: {instance_id}")

    try:
        # ── Stage 2a: Frame Extraction ─────────
        self.update_state(state="EXTRACTING_FRAMES", meta={"video_id": video_id})

        frame_times = [i * FRAME_INTERVAL for i in range(5)]
        frame_urls = [extract_frame_url(video_id, t) for t in frame_times]
        logger.info(f"  Extracted {len(frame_urls)} frame URLs")

        # ── Stage 2b: 3D Grounding (Gemini) ────
        self.update_state(state="DETECTING_SLOTS", meta={"video_id": video_id})

        detections = []
        for i, url in enumerate(frame_urls):
            try:
                detection = asyncio.run(detect_ad_slots(url))
                detections.append({
                    "frame": i,
                    "time": frame_times[i],
                    "slots": [s.model_dump() for s in detection.slots],
                    "kelvin": detection.kelvin,
                    "scene_intent": detection.scene_intent,
                })
            except Exception as e:
                logger.warning(f"  Frame {i} detection failed: {e}")

        logger.info(f"  Detected slots in {len(detections)} frames")

        # ── Stage 3: Anti-Jitter Stabilization ─
        self.update_state(state="SMOOTHING", meta={"video_id": video_id})
        smoothed = _stabilize(detections)

        # ── Stage 4: Occlusion Masking (MediaPipe) ─
        self.update_state(state="MASKING", meta={"video_id": video_id})

        for det in smoothed:
            has_occlusion = any(s.get("is_occluded", False) for s in det["slots"])
            if has_occlusion:
                frame_url = frame_urls[det["frame"]]
                mask_id = generate_hand_mask(frame_url, video_id, det["frame"])
                det["mask_public_id"] = mask_id
                logger.info(f"  Frame {det['frame']}: Occlusion detected, mask={mask_id}")
            else:
                det["mask_public_id"] = None

        # ── Stage 5: Save to Database ──────────
        self.update_state(state="SAVING", meta={"video_id": video_id})
        asyncio.run(_save_slots_to_db(video_id, smoothed))

        logger.info(f"[Task {self.request.id}] Pipeline complete for video: {video_id}")

        return {
            "video_id": video_id,
            "frames_processed": len(frame_urls),
            "slots_detected": sum(len(d["slots"]) for d in smoothed),
            "detections": smoothed,
        }

    finally:
        # ── ALWAYS tear down the GPU worker ────
        # This runs even if the pipeline crashes, so you never get surprise bills.
        asyncio.run(terminate_worker(instance_id))
        logger.info(f"  Vultr worker terminated: {instance_id}")

