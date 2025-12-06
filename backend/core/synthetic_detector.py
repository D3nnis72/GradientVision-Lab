from pathlib import Path
from typing import Dict, Tuple

import cv2
import numpy as np
from PIL import Image

from backend.models import config
from backend.core.gradient_ops import gradient_magnitude


def _normalize_heatmap(data: np.ndarray) -> np.ndarray:
    max_val = np.max(data) + 1e-6
    norm = np.clip(data / max_val, 0, 1)
    return (norm * 255).astype(np.uint8)


def analyze_gradients(dx: np.ndarray, dy: np.ndarray) -> Tuple[Dict[str, float], np.ndarray]:
    mag = gradient_magnitude(dx, dy)
    lap = cv2.Laplacian(mag, cv2.CV_32F)

    std_mag = float(np.std(mag))
    edge_consistency = float(np.clip(1.0 - np.tanh(std_mag * 0.5), 0.0, 1.0))

    var_lap = float(np.var(lap))
    smoothness_score = float(np.clip(1.0 / (1.0 + var_lap), 0.0, 1.0))

    texture_raw = float(np.mean(np.abs(lap)))
    texture_weirdness = float(np.clip(texture_raw / (np.max(mag) + 1e-6), 0.0, 1.0))

    scores = {
        "edgeConsistency": edge_consistency,
        "smoothnessScore": smoothness_score,
        "textureWeirdness": texture_weirdness,
    }
    heatmap = _normalize_heatmap(mag)
    return scores, heatmap


def save_heatmap(image_id: str, heatmap: np.ndarray) -> str:
    """Save heatmap as colorized PNG and return URL path."""
    colored = cv2.applyColorMap(heatmap, cv2.COLORMAP_INFERNO)
    path = config.ANALYSIS_DIR / f"{image_id}_heatmap.png"
    path.parent.mkdir(parents=True, exist_ok=True)
    Image.fromarray(colored[..., ::-1]).save(path, format="PNG")  # convert BGR to RGB
    relative = path.relative_to(config.BASE_DIR)
    return f"/{relative.as_posix()}"

