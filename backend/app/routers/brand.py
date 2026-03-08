from fastapi import APIRouter, HTTPException
from app.services.brand_profile import get_user_brand_profile

router = APIRouter()

@router.get("/{user_id}")
async def get_brand(user_id: str):
    """Return the brand profile for a user."""
    try:
        profile = get_user_brand_profile(user_id)
        return profile
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/{user_id}")
async def update_brand(user_id: str, body: dict):
    """
    Update the brand profile (stub). 
    In the present implementation, it doesn't persist, 
    but we return the updated data for frontend state.
    """
    profile = get_user_brand_profile(user_id)
    profile.update(body)
    return profile
