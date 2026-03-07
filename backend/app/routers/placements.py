"""
Placements router — ad placement CRUD & conversion analytics.
Stage 5: Interactive Display & Analytics.
"""

from fastapi import APIRouter, Depends
from pydantic import BaseModel
from typing import Optional

from app.database import db
from app.auth import get_current_user, require_role

router = APIRouter()


class PlacementEvent(BaseModel):
    """Logged when a viewer interacts with a placed ad."""
    video_id: str
    brand_asset_id: str
    event_type: str  # "hover" | "click" | "impression"
    timestamp_ms: int
    viewer_id: Optional[str] = None


@router.post("/events")
async def log_event(event: PlacementEvent):
    """
    Record a viewer interaction event.
    These feed the Brand Dashboard analytics.
    NOTE: Intentional stub — no analytics table in Ghost-Merchant v1 schema.
    Minimizes attack surface while the schema is lean.
    """
    return {"status": "logged", "event_type": event.event_type}


@router.get("/analytics/{video_id}")
async def get_analytics(
    video_id: str,
    user: dict = Depends(require_role("brand")),
):
    """
    Return aggregated placement metrics for a video.
    Auth0 RBAC: brand role required.
    NOTE: Intentional stub — analytics aggregation deferred to v2.
    """
    return {
        "video_id": video_id,
        "impressions": 0,
        "hovers": 0,
        "clicks": 0,
        "ctr": 0.0,
    }


@router.get("/slots/{video_id}")
async def get_ad_slots(
    video_id: str,
    user: dict = Depends(get_current_user),
):
    """
    Return detected 3D ad slots for a video.
    Each slot has 9-point bounding box coordinates stored as JSON.
    """
    slots = await db.adslot.find_many(
        where={"videoId": video_id},
    )
    return {
        "video_id": video_id,
        "slots": [{
            "id": s.id,
            "timestamp": s.timestamp,
            "coordinates": s.coordinates,
            "lighting": s.lighting,
            "is_filled": s.isFilled,
        } for s in slots],
    }
