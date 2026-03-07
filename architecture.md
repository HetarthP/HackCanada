# System Architecture Documentation: Ghost-Merchant

**Project:** AI-Native Virtual Product Placement (VPP) Marketplace
**Goal:** Automate 3D product insertion into video using spatial grounding, Google MediaPipe pixel segmentation, and edge-side Cloudinary VFX rendering.

---

## 🏗️ Architecture Overview
Ghost-Merchant uses a Temporal-Spatial Pipeline managed by FastAPI and Celery. It solves the hardest problem in Virtual Product Placement—**Occlusion**—by combining 3D AI vision with pixel-level hand tracking to create an alpha-composited "Sandwich" render at the edge.

## 🏗️ 1. Infrastructure & Deployment Layer

Before any code runs, the environment is architected for high-performance media compute.

| Component | Technology | Purpose |
|---|---|---|
| **Frontend Hosting** | Vercel | Hosts the Next.js 15 app. Optimized for edge-rendering OMDb search results and streaming the Cloudinary Video Player. |
| **API Orchestration** | AWS ECS Fargate | A containerized FastAPI cluster handling request routing, OMDb metadata fetching, and database transactions. |
| **Heavy Compute** | Vultr GPU Nodes | Dedicated Ubuntu instances with NVIDIA GPUs running Celery Workers for Gemini routing, and Google MediaPipe Tasks Vision API pixel segmentation. Integrates with Vultr Python SDK for auto-provisioning with cost-safe `try...finally` tear-down. |
| **Database** | Postgres + Prisma | Ghost-Merchant schema: Stores the `imdbId` movie index (`Video`) and 3D Ad Slots (`AdSlot` with JSON 9-point BBox coordinates). Typed Python client for FastAPI (`prisma-client-py`) using a dedicated `db` singleton. |
| **Identity** | Auth0 | Manages Role-Based Access Control (RBAC) separating the Creator Dashboard (uploading) from the Brand Dashboard (bidding/placement). |

```mermaid
graph TD
    subgraph "Client Layer"
        A["Next.js 15 (Vercel)"]
    end

    subgraph "API Layer"
        B["FastAPI (AWS ECS Fargate)"]
    end

    subgraph "Compute Layer"
        C["Celery Workers (Vultr GPU)"]
    end

    subgraph "Data & Services"
        D["Postgres (RDS)"]
        E["Cloudinary"]
        F["Auth0"]
        G["OMDb API"]
        H["Backboard.io"]
        I["Gemini 2.0 Flash"]
        J["Google MediaPipe"]
    end

    A -->|API Requests| B
    A -->|Upload Widget| E
    A -->|Auth| F
    B -->|Task Queue| C
    B -->|Read/Write| D
    B -->|Metadata| G
    C -->|Frame Extraction| E
    C -->|3D Grounding & Occlusion Check| I
    C -->|Hand Segmentation (If Occluded)| J
    C -->|Temporal Smoothing| H
    E -->|Transformed Video| A
```

## 🚀 2. The Five-Stage Processing Pipeline

### Stage 1: Discovery & Media Ingestion
**Goal:** Ingest video assets and catalog metadata securely.
1. **Netflix-Style Discovery:** Frontend (Next.js) queries OMDb API for movie metadata (`imdbID`, Posters).
2. **Cloudinary Ingestion:** Creators upload original footage via the Cloudinary `<UploadWidget />`.
3. **Primary Store:** Cloudinary stores the master video and returns a `public_id`. Metadata is mirrored in Postgres (`Video` model).
4. **Security:** Auth0 secures the APIs, separating Creator upload routes from Brand bidding routes.

### Stage 2: Spatial Intelligence (The "3D Eye" & Occlusion Detector)
**Goal:** Extract the geometry, physics, and conflicts of the scene.
1. **Frame Extraction:** FastAPI triggers a Celery worker on Vultr GPU. It fetches keyframes via Cloudinary URL transformations (e.g., `so_10,f_jpg`).
2. **Vision Node (Gemini 2.0 Flash):** 
   - **3D Grounding:** Detects surfaces and returns 9-point 3D Bounding Boxes: `[x, y, z, w, h, d, roll, pitch, yaw]`.
   - **Environmental Sensing:** Extracts Kelvin color temperature and shadow vectors.
   - **Conflict Detection:** Identifies if foreground objects overlap the ad slot and returns a boolean `is_occluded: true`.

> [!TIP]
> **Long-Form Video Optimization (45m+)**
> Gemini 2.0 Flash has a 1-million-token context window, fitting ~45-55 mins of video. For feature films (2h+), FastAPI/Celery chunks the video into 30-min segments via FFmpeg and processes them in parallel.
> To stretch the token limit (up to 2.7 hours per request), we pass `mediaResolution: 'low'` to the Gemini API, preserving enough bounding box fidelity while saving tokens.

### Stage 3: Temporal Orchestration (The "Memory")
**Goal:** Eliminate jitter and handle object movement.
1. **Temporal Resonance (Backboard.io):** Raw 3D coordinates are sent to Backboard.io.
2. **Stateful Buffer:** Backboard compares coordinates across frames N and N+1. It returns a Stable Coordinate Path, locking the product to the scene geometry regardless of camera noise.

### Stage 4: Foreground Extraction (The "Matte Creator")
**Goal:** Isolate foreground elements (hands/fingers) when occlusion is detected.
1. **Trigger:** If Gemini flags `is_occluded: true`, the FastAPI backend triggers the Segmentation Task on the Vultr GPU.
2. **MediaPipe Tasks Vision Node:** Runs Google's modern `HandLandmarker` API (`mediapipe.tasks.vision`) on the specific frames. Instead of a rough bounding box, it detects the 21-point hand skeleton.
3. **Output:** Generates a black-and-white "Alpha Matte" image where the hand's convex hull is filled white (visible) and the background is black (transparent). Uploads to Cloudinary `masks/` folder.

### Stage 5: VFX Composition (The "Sandwich Method")
**Goal:** Photorealistic alpha blending at the CDN edge.
1. **Homography Calculation:** Backend projects the stable 3D box into 8 specific 2D coordinates (4 corner pairs).
2. **Cloudinary VFX Engine:** Generates a dynamic, multi-layered transformation URL:
   - **Layer 1 (Bottom Bread):** The original base video.
   - **Layer 2 (The Meat):** The brand product (`l_product_png`), warped via `e_distort:x1:y1...`, and color-matched via `e_colorize` and `e_multiply`.
   - **Layer 3 (Top Bread):** The MediaPipe hand mask (`l_hand_mask`), applied using `e_mask` or `e_cutout` so the actor's fingers perfectly overlap the digital product.

---

## 🎨 Flow Diagram (System Pipeline)

```text
┌────────────────────────────────────────────────────────────────────────────┐
│ 🎬 GHOST-MERCHANT PIPELINE (WITH OCCLUSION HANDLING)                       │
├────────────────────────────────────────────────────────────────────────────┤
│                                                                            │
│ 1. USER ACTION: Search OMDb or Upload Video (Cloudinary Widget)            │
│                                                                            │
│ 2. ANALYSIS NODE (FastAPI + Vultr GPU)                                     │
│ ┌──────────────────────────────────────────────────────────────────┐       │
│ │ Cloudinary Extract → Gemini 2.0 Flash → 3D Box + is_occluded     │       │
│ └──────────────────────────────────────────────────────────────────┘       │
│           │                                       │                        │
│           ▼ (if is_occluded: false)               ▼ (if is_occluded: true) │
│ 3. ORCHESTRATION NODE                  3.5 SEGMENTATION NODE (Vultr GPU)   │
│ ┌───────────────────────────┐          ┌───────────────────────────┐       │
│ │ Backboard.io Path Locking │          │ Google MediaPipe Hand Mask│       │
│ └───────────────────────────┘          └───────────────────────────┘       │
│           │                                       │                        │
│           └───────────────────┬───────────────────┘                        │
│                               ▼                                            │
│ 4. VFX RENDERING NODE (The Sandwich Method)                                │
│ ┌──────────────────────────────────────────────────────────────────┐       │
│ │ Layer 1: Base Video                                              │       │
│ │ Layer 2: Product Warp (e_distort + e_multiply)                   │       │
│ │ Layer 3: Hand Alpha Mask (e_mask)                                │       │
│ └──────────────────────────────────────────────────────────────────┘       │
│                                                                            │
│ 5. FRONTEND: CldVideoPlayer (CDN) + Tailwind Interactive Overlay           │
│                                                                            │
└────────────────────────────────────────────────────────────────────────────┘
```

---

## 🧩 Deep Dive: Agent & Compute Nodes

| Node | Model / Tech | Input | Responsibilities | Output |
|---|---|---|---|---|
| **Vision** | Gemini 2.0 Flash | Cloudinary JPEGs | Detects "Semantic Ad Slots" and flags `is_occluded`. | 3D BBox, Kelvin, Occlusion flag |
| **Matte Creator** | Google MediaPipe | Occluded Frames | High-speed pixel-perfect hand tracking for alphamask. | Alpha mask video/image to Cloudinary |
| **Smoother** | Backboard.io | Raw 3D JSON | Prevents products from shaking (Temporal Consistency). | Stable Coordinate Path |
| **Strategist** | Backboard Agent | OMDb + Brand DB | Suggests the most "contextually seamless" brand asset. | Selected Asset |
| **VFX Artist** | Cloudinary Engine | Base + Meat + Mask | 4-point perspective warping, blending, alpha compositing. | Photorealistic Video URL |

---

## 🛠️ Tech Stack & Deployment Summary

| Layer | Technology | Implementation |
|---|---|---|
| **Frontend** | Next.js 15 + TS | Bootstrapped via `create-cloudinary-react`. |
| **Video Platform** | Cloudinary | `<UploadWidget>`, `<CldVideoPlayer>`, `e_distort`, `e_mask`. |
| **3D Engine** | Gemini 2.0 Flash | Native 3D Spatial Grounding for ad-slot detection. |
| **Segmentation** | Google MediaPipe | Modern `Tasks Vision API` for pixel-perfect hand tracking running on Celery workers. |
| **Memory** | Backboard.io | Temporal Resonance for anti-jitter Euclidean stabilization and AI Ad-Planner. |
| **Auth** | Auth0 | Enterprise RBAC for Brand vs. Creator marketplace. |
| **Backend** | FastAPI / Celery / Vultr | Async Vultr GPU tasks matching MediaPipe workloads with guaranteed teardown. |
| **Database** | Postgres + Prisma | `prisma-client-py` Ghost-Merchant schema for fast lookups. |
| **Deployment** | AWS (ECS/RDS) | Production-grade API and Database hosting. |

---

## ✅ 5. Cloudinary Challenge Compliance Check

| Requirement | Status | Detail |
|---|---|---|
| Framework | ✔️ | Bootstrapped via the React AI Starter Kit |
| Ingestion | ✔️ | Uses the mandatory Upload Widget for all creator uploads |
| Transformation | ✔️ | Features `e_distort` (Warping) and `e_multiply` (Blending) |
| Display | ✔️ | Streams results through the `<CldVideoPlayer />` component |
| Innovation | ✔️ | First-of-its-kind 3D-to-2D Perspective Mapping via Cloudinary |
