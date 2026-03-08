"""
Memory & Documents router — /api/memory

Exposes Backboard's smart-memory and document-upload features so the
frontend (or judges) can seed knowledge, inspect memories, and upload
reference documents to the assistant.
"""

from fastapi import APIRouter, HTTPException, UploadFile, File, Query
from pydantic import BaseModel
from typing import Optional

from app.services import backboard

router = APIRouter()


# ── Pydantic models ───────────────────────────────


class AddMemoryRequest(BaseModel):
    content: str


class AddMemoryResponse(BaseModel):
    success: bool
    data: dict


class MemoryListResponse(BaseModel):
    memories: list[dict]


class MemoryStatsResponse(BaseModel):
    stats: dict


class DocumentUploadResponse(BaseModel):
    document_id: str
    status: str
    detail: dict


class DocumentStatusResponse(BaseModel):
    status: str
    detail: dict


# ── Helpers ────────────────────────────────────────


async def _require_assistant() -> str:
    """Return the cached assistant ID, or raise 400 if not yet created."""
    if backboard._assistant_id is None:
        raise HTTPException(
            status_code=400,
            detail="Assistant not created yet — send a chat message first.",
        )
    return backboard._assistant_id


# ── Memory endpoints ──────────────────────────────


@router.get("/", response_model=MemoryListResponse)
async def list_memories():
    """Return all memories stored in the assistant's knowledge base."""
    assistant_id = await _require_assistant()
    try:
        memories = await backboard.list_memories(assistant_id)
        return MemoryListResponse(memories=memories)
    except Exception as e:
        raise HTTPException(status_code=502, detail=str(e))


@router.post("/", response_model=AddMemoryResponse)
async def add_memory(body: AddMemoryRequest):
    """Manually seed a fact or preference into memory."""
    assistant_id = await _require_assistant()
    try:
        result = await backboard.add_memory(assistant_id, body.content)
        return AddMemoryResponse(success=True, data=result)
    except Exception as e:
        raise HTTPException(status_code=502, detail=str(e))


@router.post("/seed", response_model=dict)
async def seed_memories(memories: list[AddMemoryRequest]):
    """Bulk-seed multiple memories at once (great for initial setup)."""
    assistant_id = await _require_assistant()
    results = []
    errors = []
    for mem in memories:
        try:
            result = await backboard.add_memory(assistant_id, mem.content)
            results.append({"content": mem.content, "result": result})
        except Exception as e:
            errors.append({"content": mem.content, "error": str(e)})
    return {"seeded": len(results), "errors": errors, "results": results}


@router.delete("/{memory_id}")
async def delete_memory(memory_id: str):
    """Delete a specific memory."""
    assistant_id = await _require_assistant()
    try:
        result = await backboard.delete_memory(assistant_id, memory_id)
        return {"success": True, "data": result}
    except Exception as e:
        raise HTTPException(status_code=502, detail=str(e))


@router.get("/stats", response_model=MemoryStatsResponse)
async def get_memory_stats():
    """Return memory usage statistics."""
    assistant_id = await _require_assistant()
    try:
        stats = await backboard.memory_stats(assistant_id)
        return MemoryStatsResponse(stats=stats)
    except Exception as e:
        raise HTTPException(status_code=502, detail=str(e))


# ── Document endpoints ────────────────────────────


@router.post("/documents", response_model=DocumentUploadResponse)
async def upload_document(
    file: UploadFile = File(...),
    thread_id: Optional[str] = Query(
        None, description="If provided, uploads to this thread only; otherwise shared across all threads."
    ),
):
    """
    Upload a document for the assistant to learn from.
    - Without thread_id → assistant-level (shared knowledge base)
    - With thread_id → thread-scoped (only that conversation)
    """
    assistant_id = await _require_assistant()
    file_bytes = await file.read()
    content_type = file.content_type or "application/octet-stream"

    try:
        if thread_id:
            result = await backboard.upload_document_to_thread(
                thread_id, file.filename, file_bytes, content_type
            )
        else:
            result = await backboard.upload_document_to_assistant(
                assistant_id, file.filename, file_bytes, content_type
            )
        return DocumentUploadResponse(
            document_id=result.get("document_id", ""),
            status=result.get("status", "pending"),
            detail=result,
        )
    except Exception as e:
        raise HTTPException(status_code=502, detail=str(e))


@router.get("/documents/{document_id}/status", response_model=DocumentStatusResponse)
async def document_status(document_id: str):
    """Check the processing status of an uploaded document."""
    try:
        result = await backboard.get_document_status(document_id)
        return DocumentStatusResponse(
            status=result.get("status", "unknown"),
            detail=result,
        )
    except Exception as e:
        raise HTTPException(status_code=502, detail=str(e))
