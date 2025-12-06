import numpy as np
from scipy.fft import dst, idst

from backend.models import config


def _dst1(x: np.ndarray) -> np.ndarray:
    """DST-I (Type 1) Discrete Sine Transform."""
    # scipy.fft.dst with type=1
    return dst(dst(x, type=1, norm="ortho", axis=0), type=1, norm="ortho", axis=1)


def _idst1(x: np.ndarray) -> np.ndarray:
    """IDST-I (Type 1) Inverse Discrete Sine Transform."""
    # Inverse of DST-I is DST-I itself (with ortho normalization)
    return idst(idst(x, type=1, norm="ortho", axis=0), type=1, norm="ortho", axis=1)


def _solve_poisson_dst1(laplacian: np.ndarray) -> np.ndarray:
    """
    Solve Poisson equation laplacian(u) = f with zero boundary conditions using DST-I.
    The input `laplacian` is f.
    """
    h, w = laplacian.shape
    
    # Compute RHS in frequency domain using DST-I
    rhs = _dst1(laplacian)

    # Eigenvalues of the discrete Laplacian for DST-I
    # For DST-I (boundary 0 at -1 and N), eigenvalues are:
    # lambda_ij = 2*cos(pi*i/(N+1)) - 2  (simplification, standard form is -4*sin^2...)
    
    yy, xx = np.meshgrid(
        np.arange(1, h + 1, dtype=np.float32),
        np.arange(1, w + 1, dtype=np.float32),
        indexing="ij",
    )
    
    # Standard 5-point stencil eigenvalues for DST-I
    denom = (
        2 * np.cos(np.pi * xx / (w + 1))
        + 2 * np.cos(np.pi * yy / (h + 1))
        - 4
    )
    
    # Avoid division by zero (should not happen for Dirichlet unless constant 0 mode exists? No, DST-I has no DC mode)
    u_hat = rhs / (denom - 1e-10) # subtract small epsilon to avoid exact zero if any
    
    return _idst1(u_hat)


def reconstruct_image_from_gradients(
    dx: np.ndarray, dy: np.ndarray, boundary_image: np.ndarray | None = None
) -> np.ndarray:
    """
    Reconstruct grayscale image from gradient fields using Residual method + DST-I.
    
    We solve: Laplacian(U) = div(G)
    Let U = U_orig + R
    Laplacian(R) = div(G) - Laplacian(U_orig)
    R = 0 on boundary (enforced by DST-I)
    """
    h, w = dx.shape
    
    # 1. Compute divergence of the target gradient field G
    # Div(G) = dx/dx + dy/dy (forward/backward differences to match Laplacian stencil)
    # Use central differences for interior? Standard approach is consistent differences.
    # Let's use the standard discrete divergence matching the 5-point Laplacian.
    # div[y, x] = (dx[y, x] - dx[y, x-1]) + (dy[y, x] - dy[y-1, x])
    
    div = np.zeros((h, w), dtype=np.float32)
    div[:, 1:-1] += dx[:, 1:-1] - dx[:, :-2]
    div[1:-1, :] += dy[1:-1, :] - dy[:-2, :]
    
    # 2. Prepare boundary image
    boundary_gray = np.zeros((h, w), dtype=np.float32)
    if boundary_image is not None:
        if boundary_image.ndim == 3:
            boundary_gray = (
                0.299 * boundary_image[..., 0]
                + 0.587 * boundary_image[..., 1]
                + 0.114 * boundary_image[..., 2]
            )
        else:
            boundary_gray = boundary_image.astype(np.float32)
            
    # 3. Compute Laplacian of the original image (U_orig)
    # Lap(U) = U[y, x+1] + U[y, x-1] + U[y+1, x] + U[y-1, x] - 4*U[y, x]
    # We compute this only for the interior points
    lap_orig = np.zeros((h, w), dtype=np.float32)
    lap_orig[1:-1, 1:-1] = (
        boundary_gray[1:-1, 2:] + boundary_gray[1:-1, :-2] +
        boundary_gray[2:, 1:-1] + boundary_gray[:-2, 1:-1] -
        4 * boundary_gray[1:-1, 1:-1]
    )
    
    # 4. Compute Laplacian of the residual R
    # Lap(R) = Div(G) - Lap(U_orig)
    # Note: We only care about the interior for the solver.
    f = div - lap_orig
    
    # 5. Extract interior of f for DST-I
    # DST-I solves for interior points of a grid with zero boundary.
    # Grid size for DST-I should be (h-2) x (w-2)
    if h <= 2 or w <= 2:
        return boundary_gray # Too small to reconstruct interior
        
    f_interior = f[1:-1, 1:-1]
    
    # 6. Solve for R_interior
    r_interior = _solve_poisson_dst1(f_interior)
    
    # 7. Reconstruct U
    result = boundary_gray.copy()
    result[1:-1, 1:-1] += r_interior
    
    return np.clip(result, 0.0, 1.0)
