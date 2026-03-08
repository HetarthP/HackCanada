"""
Data Abstraction Layer — Brand Profile Retrieval.

Currently returns an empty / "new-user" profile.
The system prompt tells the AI to learn about the user's brand
through conversation and Backboard's persistent memory.
"""

from typing import Optional


# ┌──────────────────────────────────────────────────────────────────┐
# │  MOCK DATA — Kept as reference, uncomment to restore defaults   │
# │                                                                 │
# │  _MOCK_BRAND_PROFILES: dict[str, dict] = {                     │
# │      "auth0|default": {                                         │
# │          "brand_name": "Liquid Death",                          │
# │          "industry": "Beverage",                                │
# │          "budget": "$50,000",                                   │
# │          "target_demo": "Gen Z",                                │
# │          "tone": "Edgy, irreverent humor",                     │
# │          "goals": "Increase brand awareness via viral video",   │
# │      },                                                         │
# │      "auth0|brand_user_1": {                                    │
# │          "brand_name": "Fenty Beauty",                          │
# │          "industry": "Cosmetics",                               │
# │          "budget": "$120,000",                                  │
# │          "target_demo": "Millennials & Gen Z women",            │
# │          "tone": "Inclusive, premium, bold",                    │
# │          "goals": "Drive product discovery via beauty content", │
# │      },                                                         │
# │      "auth0|brand_user_2": {                                    │
# │          "brand_name": "Ridge Wallet",                          │
# │          "industry": "Accessories / DTC",                       │
# │          "budget": "$30,000",                                   │
# │          "target_demo": "Men 25-40",                            │
# │          "tone": "Minimalist, functional",                      │
# │          "goals": "Performance-driven placements with CTR",     │
# │      },                                                         │
# │  }                                                              │
# └──────────────────────────────────────────────────────────────────┘


# Empty profile returned for every new user
_NEW_USER_PROFILE = {
    "brand_name": "Unknown",
    "industry": "Unknown",
    "budget": "Not specified",
    "target_demo": "Not specified",
    "tone": "Professional",
    "goals": "Not specified",
}


def get_user_brand_profile(user_id: str) -> dict:
    """
    Retrieve the brand profile for a given user.

    Currently returns a blank "new user" profile for everyone.
    The AI assistant will learn the user's brand details through
    conversation and persist them via Backboard memory.

    Args:
        user_id: The Auth0 `sub` claim (e.g. "auth0|abc123").

    Returns:
        A dict with brand_name, industry, budget, target_demo, tone, goals.
    """
    # FUTURE: Query from database
    # profile = await db.brand_profile.find_unique(where={"auth0_sub": user_id})
    # if profile: return profile.__dict__
    return _NEW_USER_PROFILE.copy()
