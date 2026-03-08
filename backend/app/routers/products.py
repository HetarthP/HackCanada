"""
Products router — /api/products

CRUD for marketing products, stored as tagged Backboard memories.
Each product is a memory prefixed with [PRODUCT] followed by JSON.
"""

import json
import os
import cloudinary
import cloudinary.uploader
from fastapi import APIRouter, HTTPException, Depends, UploadFile, File
from fastapi.security import HTTPAuthorizationCredentials
from pydantic import BaseModel
from typing import Optional

from app.auth import get_current_user, bearer_scheme
from app.services import backboard

router = APIRouter()

# Configure Cloudinary from env
cloudinary.config(
    cloud_name=os.getenv("CLOUDINARY_CLOUD_NAME"),
    api_key=os.getenv("CLOUDINARY_API_KEY"),
    api_secret=os.getenv("CLOUDINARY_API_SECRET"),
)


# ── Models ─────────────────────────────────────

class ProductCreate(BaseModel):
    name: str
    cost: str
    plan: str
    status: str = "active"
    image_url: str = ""


class Product(BaseModel):
    memory_id: str
    name: str
    cost: str
    plan: str
    status: str
    image_url: str = ""


PRODUCT_TAG = "[PRODUCT] "


# ── Helpers ────────────────────────────────────

def _parse_product_memory(memory: dict) -> Product | None:
    """Parse a Backboard memory into a Product if it has the [PRODUCT] tag."""
    content = memory.get("content", "")
    if not content.startswith(PRODUCT_TAG):
        return None
    try:
        data = json.loads(content[len(PRODUCT_TAG):])
        return Product(
            memory_id=memory["id"],
            name=data.get("name", ""),
            cost=data.get("cost", ""),
            plan=data.get("plan", ""),
            status=data.get("status", "active"),
            image_url=data.get("image_url", ""),
        )
    except (json.JSONDecodeError, KeyError):
        return None


async def _get_user_id(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
) -> str:
    """Extract user_id from JWT or fall back to anonymous."""
    if credentials is None:
        return "auth0|default"
    try:
        user = await get_current_user(credentials)
        return user.get("sub", "auth0|default")
    except HTTPException:
        return "auth0|default"


async def _require_user_assistant(user_id: str) -> str:
    """Get the Backboard assistant for a user, or 400 if not created yet."""
    aid = backboard.get_assistant_id_for_user(user_id)
    if aid is None:
        # Auto-create the assistant so the products page works even
        # if the user hasn't chatted yet.
        from app.services.brand_profile import get_user_brand_profile
        from app.routers.chat import _build_system_prompt
        profile = get_user_brand_profile(user_id)
        prompt = _build_system_prompt(profile)
        aid = await backboard.ensure_assistant(prompt, user_id)
    return aid


# ── Endpoints ──────────────────────────────────


@router.get("/", response_model=list[Product])
async def list_products(user_id: str = Depends(_get_user_id)):
    """List all products for the authenticated user."""
    assistant_id = await _require_user_assistant(user_id)
    try:
        all_memories = await backboard.list_memories(assistant_id)
        products = []
        for mem in all_memories:
            p = _parse_product_memory(mem)
            if p:
                products.append(p)
        return products
    except Exception as e:
        raise HTTPException(status_code=502, detail=str(e))


@router.post("/", response_model=Product)
async def add_product(body: ProductCreate, user_id: str = Depends(_get_user_id)):
    """Add a new product (writes a tagged memory to Backboard)."""
    assistant_id = await _require_user_assistant(user_id)
    payload = json.dumps({
        "name": body.name,
        "cost": body.cost,
        "plan": body.plan,
        "status": body.status,
        "image_url": body.image_url,
    })
    content = f"{PRODUCT_TAG}{payload}"
    try:
        result = await backboard.add_memory(assistant_id, content)
        return Product(
            memory_id=result.get("id", result.get("memory_id", "")),
            name=body.name,
            cost=body.cost,
            plan=body.plan,
            status=body.status,
            image_url=body.image_url,
        )
    except Exception as e:
        raise HTTPException(status_code=502, detail=str(e))


@router.delete("/{memory_id}")
async def delete_product(memory_id: str, user_id: str = Depends(_get_user_id)):
    """Delete a product by its memory ID."""
    assistant_id = await _require_user_assistant(user_id)
    try:
        await backboard.delete_memory(assistant_id, memory_id)
        return {"success": True}
    except Exception as e:
        raise HTTPException(status_code=502, detail=str(e))


@router.post("/upload-image")
async def upload_image(file: UploadFile = File(...), user_id: str = Depends(_get_user_id)):
    """Upload an image to Cloudinary using backend credentials (bypasses preset constraints)."""
    try:
        contents = await file.read()
        
        # Uploading directly from bytes
        # Provide a folder to keep things organized if desired
        result = cloudinary.uploader.upload(
            contents,
            folder="vpp_products",
            resource_type="auto"
        )
        
        secure_url = result.get("secure_url")
        if not secure_url:
            raise HTTPException(status_code=500, detail="Cloudinary upload failed (no URL returned)")
            
        return {"url": secure_url}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Image upload failed: {str(e)}")
