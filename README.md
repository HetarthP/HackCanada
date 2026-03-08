# VPP — Virtual Product Placement

AI-powered virtual product placement for video content. Detect 3D ad slots in video frames using Gemini 2.0 Flash, apply photorealistic brand overlays via Cloudinary transformations, and stream the result through an interactive player.

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 15 + TypeScript |
| Video Engine | Cloudinary (e_distort, e_multiply, e_mask) |
| 3D Vision | Gemini 2.0 Flash (Spatial Grounding) |
| Foreground Masking | Google MediaPipe (Tasks Vision API) |
| State Memory | Backboard.io (Temporal Stabilization) |
| Metadata | OMDb API |
| Backend | FastAPI + Celery |
| Database | PostgreSQL + Prisma (`prisma-client-py`) |
| Compute | Vultr GPU Nodes (Auto-provisioned) |
| Identity | Auth0 (RBAC) |

## Getting Started

### Prerequisites

- Node.js 20+
- Python 3.11+
- PostgreSQL 15+
- Redis (for Celery broker)

### Frontend

```bash
cd frontend
cp .env.example .env.local   # Fill in your API keys
npm install
npm run dev                   # → http://localhost:3000
```

### Backend

```bash
cd backend
cp .env.example .env          # Fill in your API keys
python -m venv .venv
source ./venv/bin/activate     # Windows: .venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload # → http://localhost:8000
```

### Celery Worker

```bash
cd backend
celery -A app.workers.celery_app worker --loglevel=info
```

### Database (Prisma on Windows)

```bash
cd backend
# Note: On Windows, use the shim to generate the Python client:
prisma-client-py.cmd generate
# For frontend schema:
cd ../frontend
npx prisma generate
```

## Backend API Endpoints

| Method | Route | Description | Auth |
|---|---|---|---|
| `POST` | `/api/videos/ingest` | Idempotent upsert of OMDb movie + Cloudinary ID | Creator |
| `POST` | `/api/videos/process` | Triggers Celery pipeline (Gemini + MediaPipe) | Creator |
| `GET` | `/api/placements/slots/{id}` | Returns stabilized 3D AdSlots with JSON coordinates | Brand/Viewer |
| `POST` | `/api/placements/events` | (v1 Stub) Logs viewer hover/clicks | Viewer |
| `GET` | `/api/placements/analytics`| (v1 Stub) Aggregated placement metrics | Brand |

## Architecture

See [architecture.md](./architecture.md) for the full system design.
