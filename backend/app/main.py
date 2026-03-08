"""
VPP Backend — FastAPI entry point.
Run: uvicorn app.main:app --reload
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.database import db

from app.config import settings
from app.routers import movies, videos, placements, chat, memory, products

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Connect to the database on startup
    await db.connect()
    yield
    # Disconnect from the database on shutdown
    await db.disconnect()

app = FastAPI(
    title="VPP API",
    description="Virtual Product Placement — API for AI-powered ad slot detection and VFX composition.",
    version="0.1.0",
    lifespan=lifespan,
)

# ── CORS ──────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins.split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Routers ───────────────────────────────────
app.include_router(movies.router, prefix="/api/movies", tags=["Movies"])
app.include_router(videos.router, prefix="/api/videos", tags=["Videos"])
app.include_router(placements.router, prefix="/api/placements", tags=["Placements"])
app.include_router(chat.router, prefix="/api/chat", tags=["Chat"])
app.include_router(memory.router, prefix="/api/memory", tags=["Memory"])
app.include_router(products.router, prefix="/api/products", tags=["Products"])


@app.get("/")
async def root():
    return {
        "service": "VPP API",
        "version": "0.1.0",
        "docs": "/docs",
    }


@app.get("/health")
async def health():
    return {"status": "ok"}


@app.get("/video/{imdb_id}")
async def get_video_slots(imdb_id: str):
    # Fetch movie placements from OMDb linked data
    video = await db.video.find_unique(
        where={'imdbId': imdb_id},
        include={'slots': True}
    )
    return video
