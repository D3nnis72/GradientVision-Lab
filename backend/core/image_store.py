import io
import uuid
from pathlib import Path
from typing import Tuple

import numpy as np
from PIL import Image, ImageOps

from backend.models import config


def _validate_dimensions(image: Image.Image) -> None:
    if image.width > config.MAX_IMAGE_DIMENSION or image.height > config.MAX_IMAGE_DIMENSION:
        raise ValueError(
            f"Image dimensions too large ({image.width}x{image.height}), "
            f"max {config.MAX_IMAGE_DIMENSION}px per side."
        )


def _validate_size(content: bytes) -> None:
    max_bytes = config.MAX_IMAGE_SIZE_MB * 1024 * 1024
    if len(content) > max_bytes:
        raise ValueError(f"File exceeds max size of {config.MAX_IMAGE_SIZE_MB} MB.")


def save_image(content: bytes) -> Tuple[str, int, int]:
    """Save image bytes to disk and return (image_id, width, height)."""
    _validate_size(content)
    image = Image.open(io.BytesIO(content)).convert("RGB")
    
    # Handle EXIF rotation
    image = ImageOps.exif_transpose(image)
    
    _validate_dimensions(image)

    image_id = uuid.uuid4().hex
    path = get_image_path(image_id)
    path.parent.mkdir(parents=True, exist_ok=True)
    image.save(path, format="PNG")
    return image_id, image.width, image.height


def get_image_path(image_id: str) -> Path:
    return config.IMAGE_DIR / f"{image_id}.png"


def load_image(image_id: str) -> np.ndarray:
    path = get_image_path(image_id)
    if not path.exists():
        raise FileNotFoundError(f"Image {image_id} not found.")
    image = Image.open(path).convert("RGB")
    return np.asarray(image).astype(np.float32) / 255.0


def load_image_pil(image_id: str) -> Image.Image:
    path = get_image_path(image_id)
    if not path.exists():
        raise FileNotFoundError(f"Image {image_id} not found.")
    return Image.open(path).convert("RGB")
