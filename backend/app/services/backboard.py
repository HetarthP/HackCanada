"""
Backboard.io service — persistent memory chatbot.

Wraps the Backboard REST API to manage:
  • A single Ghost-Merchant marketing assistant
  • Per-user conversation threads with shared memory
  • Message sending with memory="Auto" for cross-session recall

Docs: https://docs.backboard.io/
"""

import httpx
from functools import lru_cache

from app.config import settings

BASE_URL = "https://app.backboard.io/api"

# In-memory cache of user_id → thread_id.
# FUTURE: persist in Redis or the database so threads survive restarts.
_user_threads: dict[str, str] = {}

# Cached assistant ID (created once per process lifetime)
_assistant_id: str | None = None


def _headers() -> dict[str, str]:
    return {"X-API-Key": settings.backboard_api_key}


async def ensure_assistant(system_prompt: str) -> str:
    """
    Create the Ghost-Merchant marketing assistant on Backboard
    (or return the cached ID if already created this session).
    """
    global _assistant_id
    if _assistant_id is not None:
        return _assistant_id

    async with httpx.AsyncClient() as client:
        resp = await client.post(
            f"{BASE_URL}/assistants",
            json={
                "name": "Ghost-Merchant Marketing Advisor",
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
        _assistant_id = resp.json()["assistant_id"]
        return _assistant_id


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
