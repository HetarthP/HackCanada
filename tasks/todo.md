# VPP Backend Integration — Execution Plan

## Security Checklist
- [x] No API keys or secrets in source code (only read from `.env`)
- [x] RBAC intact on all protected routes (Auth0 `require_role`)
- [x] Input validated via Pydantic models (no raw SQL, no string interpolation)
- [x] `.env` is in `.gitignore`
- [x] Syntax check passes on all modified files

---

## Task 1: Database Integration (FastAPI Routers)

### 1.1 Create `backend/app/database.py`
- [x] Move the `db = Prisma()` singleton out of `main.py` into its own file
- [x] Import `db` from `database.py` in `main.py` (lifespan stays the same)

### 1.2 Wire up `/ingest` endpoint
- [x] Import `db` from `app.database` in `videos.py`
- [x] Replace the TODO stub with `db.video.upsert()`
- [x] Add a `title` field to `VideoIngestRequest`

### 1.3 Wire up `/slots/{video_id}` endpoint
- [x] Import `db` from `app.database` in `placements.py`
- [x] Replace the TODO stub with `db.adslot.find_many(where={"videoId": video_id})`

### 1.4 Keep `/events` and `/analytics` as safe stubs
- [x] Documented as intentional v1 stubs (no analytics table yet)

---

## Task 2: Celery GPU Pipeline (`tasks.py`)

### 2.1 Vultr Provisioning with cost-safe `try…finally`
- [x] Import Vultr service functions
- [x] Wrap entire pipeline in `try…finally` guaranteeing `terminate_worker()`

### 2.2 Anti-Jitter Stabilization (Stage 3)
- [x] `_stabilize()` function: Euclidean distance in XYZ, pins if < 2%

### 2.3 Save detected AdSlots to Prisma
- [x] `_save_slots_to_db()` async function saves each slot via `db.adslot.create()`

---

## Task 3: MediaPipe & Occlusion VFX (The Sandwich Method)

### 3.1 Gemini Occlusion Flag
- [x] Add `is_occluded: bool` to `BoundingBox3D` Pydantic model in `gemini.py`
- [x] Update the Gemini prompt to ask: "Is any foreground object occluding this slot?"
- [x] Update the JSON schema example in the prompt to include `is_occluded`

### 3.2 MediaPipe Dependencies
- [x] Add `mediapipe>=0.10.0` and `opencv-python-headless>=4.10.0` to `requirements.txt`
- [x] `pip install` them locally

### 3.3 MediaPipe Segmentation Service
- [x] Create `backend/app/services/mediapipe_mask.py`
- [x] `generate_hand_mask()`: Download → MediaPipe Hands → Convex hull fill → Upload B&W PNG to Cloudinary

### 3.4 Sandwich VFX URL Builder
- [x] `build_sandwich_url()` in `cloudinary.py`: Base + Product warp + Hand mask

### 3.5 Wire into Pipeline
- [x] `tasks.py`: After Gemini, check `is_occluded` per slot
- [x] If occluded → call `generate_hand_mask()`, store `mask_public_id`

### 3.6 Syntax Check & Security Audit
- [x] `py_compile` passed on all 4 modified files
- [x] `grep` for hardcoded secrets — zero matches
- [x] No sensitive data exposed

---

## End of Execution Review

### Files Modified (Tasks 1-3)
| File | Change |
|---|---|
| `backend/app/database.py` | **NEW** — Prisma singleton to prevent circular imports |
| `backend/app/main.py` | Import `db` from `database.py` instead of inline |
| `backend/app/routers/videos.py` | `/ingest` → `db.video.upsert()`, added `title` field |
| `backend/app/routers/placements.py` | `/slots` → `db.adslot.find_many()`, documented stubs |
| `backend/app/workers/tasks.py` | Vultr try/finally, `_stabilize()`, `_save_slots_to_db()`, Stage 4 occlusion masking |
| `backend/app/services/gemini.py` | Added `is_occluded: bool` to BoundingBox3D + updated prompt |
| `backend/app/services/cloudinary.py` | Added `build_sandwich_url()` — 3-layer Sandwich VFX |
| `backend/app/services/mediapipe_mask.py` | **NEW** — MediaPipe Hand mask generation + Cloudinary upload |
| `backend/requirements.txt` | Added `mediapipe` + `opencv-python-headless` |

### Security Audit
- ✅ `grep` for API keys, passwords, secrets in `backend/app/` — **zero matches**
- ✅ All secrets read from `.env` via `pydantic-settings`
- ✅ `.env` blocked by `.gitignore`
- ✅ RBAC enforced: `/ingest` and `/process` require `creator`, `/analytics` requires `brand`
- ✅ No raw SQL — all queries go through Prisma's typed client
- ✅ MediaPipe mask uploads go to Cloudinary `masks/` folder (no local file exposure)

### Syntax Check
- ✅ `py_compile` passed on all modified files (Tasks 1-3)
