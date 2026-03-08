"""
Backboard.io service — persistent memory chatbot.

Wraps the Backboard REST API to manage:
  • Per-user assistants (each user gets their own memory store)
  • Per-user conversation threads with isolated memory
  • Message sending with memory="Auto" for cross-session recall
  • Memory management (list, add, delete, stats)
  • Document uploads (assistant-level and thread-level)

Docs: https://docs.backboard.io/
"""

import httpx
from functools import lru_cache

from app.config import settings

BASE_URL = "https://app.backboard.io/api"

# In-memory cache of user_id → assistant_id.
# Each user gets their own assistant so memories are isolated per user.
# FUTURE: persist in Redis or the database so mappings survive restarts.
_user_assistants: dict[str, str] = {}

# In-memory cache of user_id → thread_id.
_user_threads: dict[str, str] = {}


def _headers() -> dict[str, str]:
    return {"X-API-Key": settings.backboard_api_key}


async def ensure_assistant(system_prompt: str, user_id: str = "default") -> str:
    """
    Create a per-user Backboard assistant (or return the cached ID).

    Each user gets their own assistant so that Backboard's memory
    system is completely isolated per user — memories saved from
    one user's conversations will never leak to another user.
    """
    if user_id in _user_assistants:
        return _user_assistants[user_id]

    async with httpx.AsyncClient() as client:
        resp = await client.post(
            f"{BASE_URL}/assistants",
            json={
                "name": f"Spotlight AI – {user_id[:20]}",
                "system_prompt": system_prompt,
                "description": "Marketing strategist for Virtual Product Placement",
                "embedding_provider": "openai",
                "embedding_model_name": "text-embedding-3-small",
                "embedding_dims": 1536
            },
            headers=_headers(),
            timeout=15,
        )
        resp.raise_for_status()
        assistant_id = resp.json()["assistant_id"]
        _user_assistants[user_id] = assistant_id
        return assistant_id


async def get_or_create_thread(assistant_id: str, user_id: str) -> str:
    """
    Return an existing thread for this user, or create a new one.
    """
    if user_id in _user_threads:
        return _user_threads[user_id]

    async with httpx.AsyncClient() as client:
        resp = await client.post(
            f"{BASE_URL}/assistants/{assistant_id}/threads",
            json={},
            headers=_headers(),
            timeout=15,
        )
        resp.raise_for_status()
        thread_id = resp.json()["thread_id"]
        _user_threads[user_id] = thread_id
        return thread_id


async def send_message(thread_id: str, content: str, memory: str = "Auto") -> str:
    """
    Send a user message to Backboard.
    *memory* can be "Auto", "On", "Off", or "Readonly".
    Returns the assistant's reply text.
    """
    async with httpx.AsyncClient() as client:
        resp = await client.post(
            f"{BASE_URL}/threads/{thread_id}/messages",
            headers=_headers(),
            data={
                "content": content,
                "stream": "false",
                "memory": memory,
            },
            timeout=60,  # LLM generation can be slow
        )
        resp.raise_for_status()
        return resp.json().get("content", "")


# ── Memory management ──────────────────────────


async def list_memories(assistant_id: str) -> list[dict]:
    """Return every memory stored for the assistant."""
    async with httpx.AsyncClient() as client:
        resp = await client.get(
            f"{BASE_URL}/assistants/{assistant_id}/memories",
            headers=_headers(),
            timeout=15,
        )
        resp.raise_for_status()
        return resp.json().get("memories", [])


async def add_memory(assistant_id: str, content: str) -> dict:
    """Manually seed a memory into the assistant's knowledge base."""
    async with httpx.AsyncClient() as client:
        resp = await client.post(
            f"{BASE_URL}/assistants/{assistant_id}/memories",
            headers=_headers(),
            json={"content": content},
            timeout=15,
        )
        resp.raise_for_status()
        return resp.json()


async def delete_memory(assistant_id: str, memory_id: str) -> dict:
    """Delete a specific memory by ID."""
    async with httpx.AsyncClient() as client:
        resp = await client.delete(
            f"{BASE_URL}/assistants/{assistant_id}/memories/{memory_id}",
            headers=_headers(),
            timeout=15,
        )
        resp.raise_for_status()
        return resp.json()


async def memory_stats(assistant_id: str) -> dict:
    """Return memory usage stats (total count, etc.)."""
    async with httpx.AsyncClient() as client:
        resp = await client.get(
            f"{BASE_URL}/assistants/{assistant_id}/memories/stats",
            headers=_headers(),
            timeout=15,
        )
        resp.raise_for_status()
        return resp.json()


def get_assistant_id_for_user(user_id: str) -> str | None:
    """Return the cached assistant ID for a user, or None."""
    return _user_assistants.get(user_id)


# ── Document uploads ───────────────────────────


async def upload_document_to_assistant(
    assistant_id: str, filename: str, file_bytes: bytes, content_type: str
) -> dict:
    """
    Upload a document to the assistant (shared across all threads).
    The file is chunked, embedded, and made available for RAG.
    """
    async with httpx.AsyncClient() as client:
        resp = await client.post(
            f"{BASE_URL}/assistants/{assistant_id}/documents",
            headers=_headers(),
            files={"file": (filename, file_bytes, content_type)},
            timeout=60,
        )
        resp.raise_for_status()
        return resp.json()


async def upload_document_to_thread(
    thread_id: str, filename: str, file_bytes: bytes, content_type: str
) -> dict:
    """
    Upload a document scoped to a single thread.
    """
    async with httpx.AsyncClient() as client:
        resp = await client.post(
            f"{BASE_URL}/threads/{thread_id}/documents",
            headers=_headers(),
            files={"file": (filename, file_bytes, content_type)},
            timeout=60,
        )
        resp.raise_for_status()
        return resp.json()


async def get_document_status(document_id: str) -> dict:
    """Poll the processing status of a previously uploaded document."""
    async with httpx.AsyncClient() as client:
        resp = await client.get(
            f"{BASE_URL}/documents/{document_id}/status",
            headers=_headers(),
            timeout=15,
        )
        resp.raise_for_status()
        return resp.json()
