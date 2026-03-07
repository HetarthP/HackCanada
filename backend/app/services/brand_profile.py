"""
Data Abstraction Layer — Brand Profile Retrieval.

Currently backed by a mock dictionary. Structured so the data source
can be swapped to Prisma / Backboard vector store / external API
without changing the function signature or the calling code.
"""

from typing import Optional


# ┌──────────────────────────────────────────────────────────────────┐
# │  MOCK DATA — Replace with a real database query in the future   │
# │                                                                 │
# │  FUTURE SWAP POINT:                                             │
# │    • Prisma:   await db.brand_profile.find_unique(              │
# │                    where={"auth0_sub": user_id})                │
# │    • Backboard vector store:                                    │
# │        client.search_documents(assistant_id, query=user_id)     │
# │    • Any external CRM / API call                                │
# └──────────────────────────────────────────────────────────────────┘

_MOCK_BRAND_PROFILES: dict[str, dict] = {
    # Test user — map your Auth0 sub to this key after first login
    "auth0|default": {
        "brand_name": "Liquid Death",
        "industry": "Beverage",
        "budget": "$50,000",
        "target_demo": "Gen Z",
        "tone": "Edgy, irreverent humor",
        "goals": "Increase brand awareness through viral video placements",
    },
    "auth0|brand_user_1": {
        "brand_name": "Fenty Beauty",
        "industry": "Cosmetics",
        "budget": "$120,000",
        "target_demo": "Millennials & Gen Z women",
        "tone": "Inclusive, premium, bold",
        "goals": "Drive product discovery via beauty & lifestyle content",
    },
    "auth0|brand_user_2": {
        "brand_name": "Ridge Wallet",
        "industry": "Accessories / DTC",
        "budget": "$30,000",
        "target_demo": "Men 25-40",
        "tone": "Minimalist, functional",
        "goals": "Performance-driven placements with measurable CTR",
    },
}

# Fallback profile for unknown users
_DEFAULT_PROFILE = _MOCK_BRAND_PROFILES["auth0|default"]


def get_user_brand_profile(user_id: str) -> dict:
    """
    Retrieve the brand profile for a given Auth0 user ID.

    Args:
        user_id: The Auth0 `sub` claim (e.g. "auth0|abc123").

    Returns:
        A dict with brand_name, industry, budget, target_demo, tone, goals.
        Falls back to a default test profile if the user is unknown.
    """
    # ── FUTURE: Replace the line below with a database query ──
    return _MOCK_BRAND_PROFILES.get(user_id, _DEFAULT_PROFILE)
