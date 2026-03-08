"""
Chat router — POST /api/chat

Authenticates via Auth0 JWT (optional fallback to anonymous),
fetches the user's brand profile, builds a dynamic system prompt,
then routes through Backboard (persistent memory + LLM generation).
"""

from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from typing import Optional

from app.auth import get_current_user, bearer_scheme
from app.services.brand_profile import get_user_brand_profile
from app.services import backboard


router = APIRouter()


class ChatRequest(BaseModel):
    message: str


class ChatResponse(BaseModel):
    reply: str
    thread_id: str


def _build_system_prompt(profile: dict) -> str:
    """Construct a brand-aware system prompt for Spotlight AI."""
    brand_known = profile.get("brand_name", "Unknown") != "Unknown"

    if brand_known:
        brand_ctx = (
            f"User's brand: {profile['brand_name']} ({profile['industry']}). "
            f"Budget: {profile['budget']}. Demo: {profile['target_demo']}. "
            f"Tone: {profile.get('tone', 'Professional')}. "
            f"Goals: {profile.get('goals', 'Brand awareness')}."
        )
    else:
        brand_ctx = (
            "New user — no brand info yet. Greet them and naturally learn "
            "their brand name, industry, budget, target demo, and goals."
        )

    return (
        "You are Spotlight AI, a VPP (Virtual Product Placement) marketing strategist. "
        f"{brand_ctx}\n\n"
        "You have persistent memory across sessions. Facts you learn are saved automatically. "
        "Give concise, actionable VPP advice: content targeting, placement strategy, "
        "budget allocation, and expected metrics. Use markdown."
    )


async def get_optional_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
) -> Optional[dict]:
    """
    Try to authenticate, but fall back to None if no token is provided.
    This allows the chat to work both authenticated and anonymously.
    """
    if credentials is None:
        return None
    try:
        return await get_current_user(credentials)
    except HTTPException:
        return None


@router.post("/", response_model=ChatResponse)
async def chat(
    body: ChatRequest,
    user: Optional[dict] = Depends(get_optional_user),
):
    """
    Send a message to the Ghost-Merchant marketing advisor.

    Flow:
      1. If authenticated, extract Auth0 sub for per-user memory
      2. Fetch brand profile (keyed by user ID)
      3. Ensure Backboard assistant exists with brand-aware system prompt
      4. Get or create thread for this user (persistent across sessions)
      5. Send message via Backboard (memory="Auto")
      6. Return the assistant's reply
    """
    # Use authenticated user ID or fallback to anonymous
    is_authenticated = user is not None
    user_id = user.get("sub", "auth0|default") if user else "auth0|default"

    # 1) Fetch brand context
    profile = get_user_brand_profile(user_id)

    # 2) Build dynamic system prompt
    system_prompt = _build_system_prompt(profile)

    # 3) Ensure assistant + thread exist
    try:
        assistant_id = await backboard.ensure_assistant(system_prompt, user_id)
        thread_id = await backboard.get_or_create_thread(assistant_id, user_id)

        # 4) Send message — only authenticated users get persistent memory
        memory_mode = "Auto" if is_authenticated else "Off"
        reply = await backboard.send_message(thread_id, body.message, memory=memory_mode)
    except Exception as e:
        raise HTTPException(
            status_code=502,
            detail=f"Chat service error: {e}",
        )

    return ChatResponse(reply=reply, thread_id=thread_id)
