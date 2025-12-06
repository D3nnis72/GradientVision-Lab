from pathlib import Path

# Base directories
BASE_DIR = Path(__file__).resolve().parent.parent
STATIC_DIR = BASE_DIR / "static"
IMAGE_DIR = STATIC_DIR / "images"
GRADIENT_DIR = STATIC_DIR / "gradients"
RECON_DIR = STATIC_DIR / "reconstructions"
ANALYSIS_DIR = STATIC_DIR / "analysis"

# Limits
MAX_IMAGE_SIZE_MB = 10
MAX_IMAGE_DIMENSION = 4096  # max width or height

# Solver params
POISSON_EPS = 1e-3


def ensure_directories() -> None:
    """Create required directories if they do not yet exist."""
    for path in [STATIC_DIR, IMAGE_DIR, GRADIENT_DIR, RECON_DIR, ANALYSIS_DIR]:
        path.mkdir(parents=True, exist_ok=True)

