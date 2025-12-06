import base64
import io
from pathlib import Path
from typing import Tuple

import cv2
import numpy as np
from PIL import Image

from backend.models import config


def compute_gradients(image: np.ndarray) -> Tuple[np.ndarray, np.ndarray]:
    """Compute dx and dy using Sobel on a grayscale version of the image."""
    if image.ndim == 3:
        gray = cv2.cvtColor((image * 255).astype(np.uint8), cv2.COLOR_RGB2GRAY)
    else:
        gray = (image * 255).astype(np.uint8)

    dx = cv2.Sobel(gray, cv2.CV_32F, 1, 0, ksize=3) / 255.0
    dy = cv2.Sobel(gray, cv2.CV_32F, 0, 1, ksize=3) / 255.0
    return dx.astype(np.float32), dy.astype(np.float32)


def compute_forward_gradients(image: np.ndarray) -> Tuple[np.ndarray, np.ndarray]:
    """
    Compute gradients using simple forward differences.
    dx[x] = img[x+1] - img[x]
    Matches the discrete Laplacian stencil used in Poisson solver.
    Input image is assumed to be single channel (2D).
    """
    if image.ndim == 3:
        # If 3 channel (e.g. RGB), convert to gray first if strictly needed,
        # but this function is mostly called with Y channel.
        # For robustness, check if we need to convert.
        # Assuming input is float 0..1
        # Simple average if no explicit conversion needed, or just take it as is if 2D.
        # But callers usually pass Y channel.
        pass

    # Ensure 2D
    if image.ndim > 2:
        # Flatten or error? Let's assume caller passes 2D.
        # If RGB, take simplified luminance.
        image = np.mean(image, axis=2)

    h, w = image.shape
    dx = np.zeros_like(image, dtype=np.float32)
    dy = np.zeros_like(image, dtype=np.float32)

    # Forward difference x: im[:, 1:] - im[:, :-1]
    # To keep shape, we assume 0 gradient at right/bottom boundary or replicate?
    # Solver expects div calculation to match.
    # Standard: dx[x] = u[x+1] - u[x]. At x=N-1, we don't have u[N].
    # But our solver uses interior points.
    # Let's assume boundary padding.
    
    # Calculate simple differences
    dx[:, :-1] = image[:, 1:] - image[:, :-1]
    dy[:-1, :] = image[1:, :] - image[:-1, :]
    
    # Boundary: assume 0 or copy previous? 
    # 0 implies U[N] = U[N-1].
    
    return dx, dy


def gradient_magnitude(dx: np.ndarray, dy: np.ndarray) -> np.ndarray:
    return np.sqrt(dx ** 2 + dy ** 2)


def _normalize_signed_field(field: np.ndarray) -> np.ndarray:
    """Map signed field to 0..255 for visualization."""
    max_abs = np.max(np.abs(field)) + 1e-6
    normalized = (field / (2 * max_abs) + 0.5) * 255.0
    return np.clip(normalized, 0, 255).astype(np.uint8)


def _normalize_magnitude_field(field: np.ndarray) -> np.ndarray:
    max_val = np.max(field) + 1e-6
    normalized = (field / max_val) * 255.0
    return np.clip(normalized, 0, 255).astype(np.uint8)


def create_gradient_visual(dx: np.ndarray, dy: np.ndarray, mode: str) -> Image.Image:
    if mode == "dx":
        data = _normalize_signed_field(dx)
    elif mode == "dy":
        data = _normalize_signed_field(dy)
    elif mode == "mag":
        data = _normalize_magnitude_field(gradient_magnitude(dx, dy))
    else:
        raise ValueError(f"Unknown gradient visual mode: {mode}")
    return Image.fromarray(data, mode="L")


def save_gradient_visual(dx: np.ndarray, dy: np.ndarray, mode: str, path: Path) -> str:
    path.parent.mkdir(parents=True, exist_ok=True)
    image = create_gradient_visual(dx, dy, mode)
    image.save(path, format="PNG")
    # Return url path component
    relative = path.relative_to(config.BASE_DIR)
    return f"/{relative.as_posix()}"


def decode_base64_gradient_png(data: str) -> np.ndarray:
    """Decode base64 PNG (grayscale) to float field in [-1, 1]."""
    raw = base64.b64decode(data)
    image = Image.open(io.BytesIO(raw)).convert("L")
    arr = np.asarray(image).astype(np.float32) / 255.0
    return (arr - 0.5) * 2.0


def encode_gradient_to_base64_png(field: np.ndarray) -> str:
    """Encode float field in [-1, 1] to base64 PNG (grayscale)."""
    visual = _normalize_signed_field(field)
    buffer = io.BytesIO()
    Image.fromarray(visual, mode="L").save(buffer, format="PNG")
    return base64.b64encode(buffer.getvalue()).decode("ascii")
