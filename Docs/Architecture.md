## 1. High-Level Architecture

```text
[User Browser]
    │
    │  HTTP, WebSocket
    ▼
[Next.js Frontend]  ←→  [Python Backend API]
   (React UI,           (FastAPI)
    Canvas, State)       ├─ Gradient Engine (dx, dy)
                         ├─ Poisson Solver (reconstruction)
                         ├─ Synthetic Detector
                         └─ Storage Layer (optional cache, files)
```

Intent:

- **Frontend** handles interaction, visualization, gradient drawing, and triggering requests.
- **Backend** does the heavy numerical work: gradient computation, Poisson reconstruction, and analysis.

This keeps the UI evolving independently while the Python side stays flexible for algorithms.

---

## 2. Frontend Architecture (Next.js)

### 2.1 Suggested structure

- `app/` or `pages/`
  - `/` — short intro and gateway to the lab
  - `/lab` — Gradient Editing Lab (main page)
  - `/analyzer` — Synthetic Image Analyzer
- `components/gradient-lab/`
  - `ImageLoader`
  - `GradientViewSwitcher`
  - `GradientCanvas`
  - `ControlsPanel`
  - `ReconstructionComparison`
  - `ExplanationTooltip`
- `lib/api/`
  - `gradientApiClient.ts` wraps all backend calls:
    - `getGradients(imageId)`
    - `reconstructFromGradients(payload)`
    - `analyzeImage(imageId)`
  - `types.ts` holds shared request/response types

### 2.2 Frontend responsibilities

**a) ImageLoader**

- Uploads an image to the backend and receives an `imageId`.
- Rationale: keep frontend state light by referencing images via IDs.

**b) GradientViewSwitcher**

- Switches between `dx`, `dy`, magnitude, and vector field views.
- Renders backend-provided gradient images as canvas textures.

**c) GradientCanvas**

- Interactive gradient editing with modes such as `edit_dx`, `edit_dy`, `erase`, `sharpen`, `smooth`.
- Draws into a local gradient field that is later sent to the backend.
- Rationale: immediate feedback while drawing without round-trips for every stroke.

**d) ControlsPanel**

- Sliders and buttons:
  - Brush size, brush strength
  - Toggle: `edit dx`, `edit dy`
  - Action: `Reconstruct`

**e) ReconstructionComparison**

- Grid showing:
  - Original image
  - Edited gradient visualization
  - Reconstructed image
- Goal: show cause (gradients) and effect (reconstruction) side by side.

**f) Synthetic Analyzer Page**

- Upload box, real vs synthetic comparison
- Shows gradient maps plus simple scores or heatmaps from the backend.

---

## 3. Backend Architecture (Python)

A small, modular API service built with FastAPI.

### 3.1 Module layout

```text
backend/
  ├─ api/
  │   ├─ routes_images.py
  │   ├─ routes_gradients.py
  │   └─ routes_analysis.py
  ├─ core/
  │   ├─ image_store.py
  │   ├─ gradient_ops.py
  │   ├─ poisson_solver.py
  │   └─ synthetic_detector.py
  └─ models/
      ├─ dto.py
      └─ config.py
```

### 3.2 Responsibilities by module

**a) `image_store.py`**

- Saves uploaded images and returns an `imageId`.
- Start simple with filesystem storage, e.g., `data/images/{imageId}.png`.
- Can later move to Redis or a database.

**b) `gradient_ops.py`**

- Computes gradients of an image:
  - `compute_dx_dy(image)`
  - `visualize_gradient(gradient, mode)`
- Accepts edited gradient fields for reconstruction:
  - `apply_frontend_edits(original_dx, original_dy, edits)`

**c) `poisson_solver.py`**

- Core reconstruction logic:
  - `reconstruct_image_from_gradients(dx, dy, boundary_condition)`
- Uses NumPy, SciPy, or OpenCV internally.
- Separated so solvers can be swapped without changing the API.

**d) `synthetic_detector.py`**

- Functions like `analyze_gradients(dx, dy)` that yield:
  - Edge distributions
  - Gradient magnitude statistics
  - Smoothness/noise cues
- Returns metrics and optionally a heatmap.

**e) `dto.py`**

- Request/response structures:
  - `UploadImageResponse`
  - `GradientsResponse` (gradient images as PNG/Base64 or URLs, plus stats)
  - `ReconstructionRequest`, `ReconstructionResponse`
  - `AnalysisResponse`

---

## 4. API Endpoints and Flow

### 4.1 Upload image — `POST /api/images`

- Request: multipart form with an image
- Response:

  ```json
  {
    "imageId": "abc123",
    "width": 1024,
    "height": 768
  }
  ```

Rationale: the frontend works with `imageId` and needs dimensions.

### 4.2 Compute gradients — `GET /api/gradients?imageId=abc123`

- Backend: load image, compute dx/dy, create visualizations (e.g., grayscale)
- Response:

  ```json
  {
    "imageId": "abc123",
    "dxUrl": "/static/gradients/abc123_dx.png",
    "dyUrl": "/static/gradients/abc123_dy.png",
    "meta": { "width": 1024, "height": 768 }
  }
  ```

The frontend loads these URLs into canvas or `<img>` elements.

### 4.3 Send edited gradients and reconstruct — `POST /api/reconstruct`

- Request (simplified):

  ```json
  {
    "imageId": "abc123",
    "editedDx": "<binary or compressed field>",
    "editedDy": "<binary or compressed field>",
    "mode": "full"
  }
  ```

- Backend merges edits with originals, calls `poisson_solver.reconstruct_image_from_gradients(...)`, stores the result, and returns a URL.
- Response:

  ```json
  {
    "imageId": "abc123",
    "reconstructedUrl": "/static/recon/abc123_run5.png"
  }
  ```

### 4.4 Synthetic Analyzer — `POST /api/analyze`

- Request:

  ```json
  {
    "imageId": "abc123"
  }
  ```

- Backend computes dx/dy, runs `synthetic_detector.analyze_gradients(dx, dy)`, and can emit a heatmap.
- Response:

  ```json
  {
    "imageId": "abc123",
    "scores": {
      "edgeConsistency": 0.82,
      "textureWeirdness": 0.31
    },
    "heatmapUrl": "/static/analysis/abc123_heatmap.png"
  }
  ```

---

## 5. Why this separation fits the assignment

1. **Didactics in the frontend, math in the backend** — UI focuses on experience; Python handles math, Poisson, and analysis.
2. **Room for experiments** — Swap solvers or detectors in the backend without rebuilding the UI.
3. **Clear contracts** — JSON DTOs define what the frontend sends and what the backend returns.
4. **Scaling** — If reconstruction gets expensive, add workers, caching, or GPU in the backend without breaking the API.
