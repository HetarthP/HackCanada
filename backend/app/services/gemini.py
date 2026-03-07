"""
Gemini 2.0 Flash service — 3D Spatial Intelligence.
Stage 2: The "Spatial Eye" — detect ad slots and environmental context.
"""

from google import genai
from google.genai import types
from pydantic import BaseModel

from app.config import settings


# Initialize Gemini client
client = genai.Client(api_key=settings.gemini_api_key)
MODEL = "gemini-2.0-flash"


class BoundingBox3D(BaseModel):
    """9-point 3D bounding box for a detected ad slot."""
    x: float
    y: float
    z: float
    w: float   # width
    h: float   # height
    d: float   # depth
    roll: float
    pitch: float
    yaw: float
    is_occluded: bool = False  # True if a foreground object (hand/body) overlaps this slot


class AdSlotDetection(BaseModel):
    """Output from a single frame analysis."""
    slots: list[BoundingBox3D]
    kelvin: int          # scene colour temperature
    shadow_direction: str  # e.g. "top-left", "bottom-right"
    scene_intent: str    # e.g. "Luxury Interior", "Urban Street"


async def detect_ad_slots(frame_url: str) -> AdSlotDetection:
    """
    Analyze a single video frame using Gemini 2.0 Flash.

    3D Grounding: Detects flat surfaces, hands, and other suitable ad slots.
    Environmental Logic: Detects Kelvin temperature and shadow direction.

    Args:
        frame_url: Public URL of a Cloudinary-extracted JPEG frame.

    Returns:
        AdSlotDetection with 3D bounding boxes and scene metadata.
    """
    prompt = """Analyze this video frame for virtual product placement opportunities.

For each suitable flat surface or placement area, return:
1. A 3D bounding box with 9 values: [x, y, z, width, height, depth, roll, pitch, yaw]
   - Coordinates are normalized 0-1 relative to the frame dimensions
   - Roll/pitch/yaw in degrees

2. Occlusion detection:
   - is_occluded: true if any foreground object (hands, fingers, body parts) overlaps this ad slot area
   - is_occluded: false if the slot surface is fully unobstructed

3. Scene environment data:
   - Color temperature in Kelvin (e.g. 4500)
   - Shadow direction (e.g. "top-left")
   - Scene intent / mood (e.g. "Luxury Interior")

Return the result as JSON with this structure:
{
  "slots": [{"x": ..., "y": ..., "z": ..., "w": ..., "h": ..., "d": ..., "roll": ..., "pitch": ..., "yaw": ..., "is_occluded": false}],
  "kelvin": 4500,
  "shadow_direction": "top-left",
  "scene_intent": "Luxury Interior"
}"""

    response = client.models.generate_content(
        model=MODEL,
        contents=[
            {"text": prompt},
            {"image_url": frame_url},
        ],
        config=types.GenerateContentConfig(
            system_instruction="You are a 3D spatial grounding expert. Always return valid JSON.",
            # Low resolution stretches the 1-million-token window up to 2.7 hours of video
            # while maintaining enough bounding box fidelity for ad slots.
            # See Architecture Stage 2 for details.
        )
    )

    # Parse the structured output
    # TODO: Add robust JSON extraction from response text
    import json
    raw = response.text.strip()

    # Strip markdown code fences if present
    if raw.startswith("```"):
        raw = raw.split("\n", 1)[1].rsplit("```", 1)[0]

    data = json.loads(raw)
    return AdSlotDetection(**data)
