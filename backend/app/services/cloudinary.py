"""
Cloudinary service.
Stage 2: Frame extraction via dynamic URL.
Stage 4: VFX composition via e_distort + e_multiply.
"""

import cloudinary
import cloudinary.uploader
import cloudinary.api

from app.config import settings

# Initialize Cloudinary SDK
cloudinary.config(
    cloud_name=settings.cloudinary_cloud_name,
    api_key=settings.cloudinary_api_key,
    api_secret=settings.cloudinary_api_secret,
    secure=True,
)


def extract_frame_url(public_id: str, time_seconds: float) -> str:
    """
    Build a Cloudinary URL that extracts a JPEG frame at a given timestamp.
    Uses dynamic URL extraction (f_jpg, so_<seconds>) to pull keyframes
    WITHOUT downloading the full video file.
    """
    return (
        f"https://res.cloudinary.com/{settings.cloudinary_cloud_name}"
        f"/video/upload/f_jpg,so_{time_seconds}/{public_id}.jpg"
    )


def build_vfx_url(
    base_public_id: str,
    overlay_public_id: str,
    distort_coords: list[int],
    kelvin: int | None = None,
) -> str:
    """
    Build the full VFX composition URL per Stage 4.

    Transformations:
      l_<brand_asset_id>     — product overlay
      e_distort:x1:y1:…:x4:y4 — warp into 3D perspective
      e_colorize             — tint to match scene lighting
      e_multiply             — blend grain & shadows
    """
    overlay = overlay_public_id.replace("/", ":")
    distort = ":".join(str(c) for c in distort_coords)

    parts = [
        f"l_{overlay}",
        f"e_distort:{distort}",
    ]

    if kelvin:
        hex_tint = _kelvin_to_hex(kelvin)
        parts.append(f"e_colorize,co_rgb:{hex_tint}")

    parts.append("e_multiply")
    parts.append("fl_layer_apply")

    transformation = "/".join(parts)
    return (
        f"https://res.cloudinary.com/{settings.cloudinary_cloud_name}"
        f"/video/upload/{transformation}/{base_public_id}"
    )


def _kelvin_to_hex(k: int) -> str:
    """Approximate Kelvin to hex tint for e_colorize."""
    if k < 4000:
        return "ffcc88"  # warm tungsten
    if k < 5500:
        return "ffeedd"  # neutral daylight
    return "cce0ff"      # cool blue


def build_sandwich_url(
    base_public_id: str,
    overlay_public_id: str,
    distort_coords: list[int],
    mask_public_id: str | None = None,
    kelvin: int | None = None,
) -> str:
    """
    Build the Sandwich Method VFX URL (Stage 5).

    Three layers composited at the CDN edge:
      Layer 1 (Bottom Bread): Original base video
      Layer 2 (The Meat):     Brand product warped into 3D perspective
      Layer 3 (Top Bread):    Hand alpha mask so fingers overlap the product

    If no mask_public_id is provided, falls back to the standard 2-layer VFX.
    """
    overlay = overlay_public_id.replace("/", ":")
    distort = ":".join(str(c) for c in distort_coords)

    # ── Layer 2: Product overlay with perspective warp ──
    parts = [
        f"l_{overlay}",
        f"e_distort:{distort}",
    ]

    if kelvin:
        hex_tint = _kelvin_to_hex(kelvin)
        parts.append(f"e_colorize,co_rgb:{hex_tint}")

    parts.append("e_multiply")
    parts.append("fl_layer_apply")

    # ── Layer 3: Hand mask overlay (if occluded) ────────
    if mask_public_id:
        mask_ref = mask_public_id.replace("/", ":")
        parts.append(f"l_{mask_ref}")
        parts.append("e_mask")
        parts.append("fl_layer_apply")

    transformation = "/".join(parts)
    return (
        f"https://res.cloudinary.com/{settings.cloudinary_cloud_name}"
        f"/video/upload/{transformation}/{base_public_id}"
    )
