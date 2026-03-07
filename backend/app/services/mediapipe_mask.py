"""
MediaPipe Hand Mask Service — The "Matte Creator" (Stage 4).
Generates a B&W alpha matte of hands/fingers for occlusion compositing.
"""

import io
import logging
import os

import cv2
import numpy as np
import mediapipe as mp
import cloudinary.uploader
import httpx

from mediapipe.tasks import python
from mediapipe.tasks.python import vision

logger = logging.getLogger(__name__)

# Path to the downloaded model (.task file)
MODEL_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "hand_landmarker.task")


def _get_landmarker():
    """Initialize the modern MediaPipe Tasks HandLandmarker."""
    base_options = python.BaseOptions(model_asset_path=MODEL_PATH)
    options = vision.HandLandmarkerOptions(
        base_options=base_options,
        num_hands=2,
        min_hand_detection_confidence=0.5,
        min_hand_presence_confidence=0.5,
    )
    return vision.HandLandmarker.create_from_options(options)


def generate_hand_mask(frame_url: str, video_id: str, frame_idx: int) -> str | None:
    """
    Download a frame, detect hands via MediaPipe Tasks Vision, and create a B&W alpha mask.

    How it works:
    1. Downloads the Cloudinary JPEG frame
    2. Runs MediaPipe Hands to get 21-point hand skeletons
    3. Fills the hand convex hull on a black canvas → white hand, black background
    4. Uploads the mask PNG to Cloudinary under masks/ folder
    5. Returns the Cloudinary public_id of the uploaded mask
    """
    if not os.path.exists(MODEL_PATH):
        logger.error(f"MediaPipe model not found at {MODEL_PATH}")
        return None

    # ── Step 1: Download the frame ─────────────
    try:
        response = httpx.get(frame_url, timeout=30)
        response.raise_for_status()
    except Exception as e:
        logger.error(f"Failed to download frame: {e}")
        return None

    img_array = np.frombuffer(response.content, dtype=np.uint8)
    frame_bgr = cv2.imdecode(img_array, cv2.IMREAD_COLOR)
    if frame_bgr is None:
        logger.error("Failed to decode frame image")
        return None

    h, w = frame_bgr.shape[:2]

    # ── Step 2: Run MediaPipe Hand detection ───
    frame_rgb = cv2.cvtColor(frame_bgr, cv2.COLOR_BGR2RGB)
    
    # Convert numpy array to MediaPipe Image object
    mp_image = mp.Image(image_format=mp.ImageFormat.SRGB, data=frame_rgb)

    with _get_landmarker() as landmarker:
        result = landmarker.detect(mp_image)

    if not result.hand_landmarks:
        logger.info(f"  Frame {frame_idx}: No hands detected, skipping mask")
        return None

    # ── Step 3: Draw hand polygons on black canvas ─
    mask = np.zeros((h, w), dtype=np.uint8)

    for hand_landmarks in result.hand_landmarks:
        points = []
        for lm in hand_landmarks:
            px = int(lm.x * w)
            py = int(lm.y * h)
            points.append([px, py])

        points_np = np.array(points, dtype=np.int32)
        hull = cv2.convexHull(points_np)
        cv2.fillConvexPoly(mask, hull, 255)

    # ── Step 4: Upload mask PNG to Cloudinary ──
    _, mask_png = cv2.imencode(".png", mask)
    mask_bytes = io.BytesIO(mask_png.tobytes())

    public_id = f"masks/{video_id}_frame{frame_idx}"

    try:
        upload_result = cloudinary.uploader.upload(
            mask_bytes,
            public_id=public_id,
            resource_type="image",
            overwrite=True,
        )
        logger.info(f"  Uploaded hand mask: {upload_result['public_id']}")
        return upload_result["public_id"]
    except Exception as e:
        logger.error(f"Failed to upload hand mask: {e}")
        return None
