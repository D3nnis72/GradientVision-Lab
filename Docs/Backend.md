# Backend

Python backend for the project **“Synthetic Image Detection using Gradient Fields.”** It exposes a minimal HTTP API and encapsulates all numerical logic for image processing, gradient-domain editing, reconstruction, and basic gradient-based analysis.

---

## 1. Backend goals

1. Accept and manage uploaded images
2. Compute and visualize gradient fields
3. Reconstruct images from edited gradients (Poisson reconstruction)
4. Provide simple gradient-based analysis to support synthetic image detection

The backend handles math and image processing; the frontend handles interaction and learning.

---

## 2. Technology and constraints

- Language: Python 3.x
- Web framework: FastAPI (recommended)
- Numerics and imaging: NumPy; SciPy or OpenCV for gradients and Poisson solving; Pillow or OpenCV for image I/O
- Storage: filesystem for images and generated assets (PNG, NPY, etc.); optional cache later (e.g., Redis)

---

## 3. Directory layout (proposal)

```text
backend/
  ├─ api/
  │   ├─ routes_images.py        # upload, image info
  │   ├─ routes_gradients.py     # compute gradients, reconstruction
  │   └─ routes_analysis.py      # synthetic image analyzer
  │
  ├─ core/
  │   ├─ image_store.py          # loading, saving, paths, IDs
  │   ├─ gradient_ops.py         # dx, dy, visualization, editing
  │   ├─ poisson_solver.py       # reconstruction from gradients
  │   └─ synthetic_detector.py   # analysis scores, heatmaps
  │
  ├─ models/
  │   ├─ dto.py                  # request/response dataclasses or Pydantic models
  │   └─ config.py               # configuration (paths, limits, etc.)
  │
  ├─ static/
  │   ├─ images/                 # original images
  │   ├─ gradients/              # dx/dy visualizations
  │   ├─ reconstructions/        # reconstructed images
  │   └─ analysis/               # heatmaps, analysis visuals
  │
  └─ main.py                     # FastAPI app, router registration
```

---

## 4. Core modules

### 4.1 `core/image_store.py`

- Accepts, validates, and persists image data
- Generates an `imageId` (e.g., UUID)
- Key helpers:
  - `save_image(file) -> image_id`
  - `load_image(image_id) -> np.ndarray`
  - `get_image_path(image_id) -> str`
- Goal: other modules only deal with `imageId`; file handling stays here.

### 4.2 `core/gradient_ops.py`

- Derivative computation:
  - `compute_gradients(image) -> (dx, dy)` (arrays aligned with the image)
- Visualization helpers:
  - `create_gradient_visual(dx, mode="dx" | "dy" | "mag" | "dir") -> image`
- Apply frontend edits:
  - `apply_edits_to_gradients(original_dx, original_dy, edits) -> (edited_dx, edited_dy)`
- Edits may be full dx/dy maps or sparse masks.

### 4.3 `core/poisson_solver.py`

- Reconstruct image from gradient fields:
  - `reconstruct_image(dx, dy, boundary_image=None) -> image`
- Solves the Poisson equation with gradients as constraints; optional boundary image as Dirichlet condition.
- Internally can swap between direct or iterative solvers, or OpenCV helpers, while keeping the API stable.

### 4.4 `core/synthetic_detector.py`

- Gradient-field analysis to support synthetic image detection:
  - `analyze_gradients(dx, dy) -> AnalysisResult`
- Example metrics (kept simple):
  - Edge distribution (magnitude histogram)
  - Smoothness vs noise (local variance of gradients)
  - Consistency between dx and dy
- Produces numeric scores for the UI and optionally a heatmap.

### 4.5 `models/dto.py`

- Request/response models (ideally Pydantic):
  - `UploadImageResponse`
  - `GradientsResponse`
  - `ReconstructionRequest`, `ReconstructionResponse`
  - `AnalysisResponse`
  - `ErrorResponse`
- Central place for API contracts so frontend and backend share types.

---

## 5. API endpoints

All paths are examples and can be adjusted.

### 5.1 `POST /api/images`

Upload an image.

**Request**

- Content-Type: `multipart/form-data`
- Fields: `file` (png, jpg, etc.)

**Response (200)**

```json
{
  "imageId": "abc123",
  "width": 1024,
  "height": 768
}
```

Errors: 400 (invalid/missing file), 500 (storage failure).

### 5.2 `GET /api/gradients?imageId=abc123`

Compute and serve gradients plus visualizations.

**Query params**: `imageId` (required)

**Response (200)**

```json
{
  "imageId": "abc123",
  "width": 1024,
  "height": 768,
  "dxUrl": "/static/gradients/abc123_dx.png",
  "dyUrl": "/static/gradients/abc123_dy.png",
  "magnitudeUrl": "/static/gradients/abc123_mag.png"
}
```

Errors: 404 (unknown `imageId`), 500 (computation error).

### 5.3 `POST /api/reconstruct`

Reconstruct an image from edited gradients.

**Request body (JSON)**

```json
{
  "imageId": "abc123",
  "editedDx": "<representation of dx edits>",
  "editedDy": "<representation of dy edits>",
  "mode": "full"
}
```

Payload options: full dx/dy map (compressed PNG/NPY) or sparse edits with an encoding strategy.

**Response (200)**

```json
{
  "imageId": "abc123",
  "reconstructedUrl": "/static/reconstructions/abc123_run1.png"
}
```

Errors: 400 (invalid edit format), 404 (unknown `imageId`), 500 (solver issues).

### 5.4 `POST /api/analyze`

Analyze gradient structure for synthetic-image cues.

**Request body (JSON)**

```json
{
  "imageId": "abc123"
}
```

**Response (200)**

```json
{
  "imageId": "abc123",
  "scores": {
    "edgeConsistency": 0.82,
    "smoothnessScore": 0.41,
    "textureWeirdness": 0.33
  },
  "heatmapUrl": "/static/analysis/abc123_heatmap.png"
}
```

Scores are intentionally simple and meant for visual interpretation rather than a final detector.

---

## 6. Error handling

Unified error format, e.g.:

```json
{
  "error": {
    "code": "IMAGE_NOT_FOUND",
    "message": "No image with id abc123 found"
  }
}
```

Possible error codes:

- `INVALID_REQUEST`
- `IMAGE_NOT_FOUND`
- `GRADIENT_COMPUTATION_FAILED`
- `RECONSTRUCTION_FAILED`
- `ANALYSIS_FAILED`
- `INTERNAL_SERVER_ERROR`

The frontend can react cleanly to codes and show user-friendly messages.

---

## 7. Configuration

`models/config.py` centralizes settings:

- `IMAGE_DIR`, `GRADIENT_DIR`, `RECON_DIR`, `ANALYSIS_DIR`
- Max image size (pixels/MB)
- Supported formats
- Numerical parameters (e.g., tolerances for solvers)

---

## 8. Data flow summary

1. Frontend uploads an image → `POST /api/images` → backend stores and returns `imageId`.
2. Frontend requests gradients → `GET /api/gradients?imageId=...` → backend computes dx/dy and visualizations.
3. User edits gradients in the frontend → edits sent to `POST /api/reconstruct` → backend merges edits with originals, runs Poisson reconstruction, stores output, returns URL.
4. For synthetic detection → `POST /api/analyze` with `imageId` → backend analyzes gradient fields, produces scores and a heatmap; frontend visualizes and explains the result.
