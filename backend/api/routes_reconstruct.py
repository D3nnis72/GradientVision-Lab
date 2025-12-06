import numpy as np
from fastapi import APIRouter, HTTPException, status
import cv2

from backend.core import gradient_ops, image_store, poisson_solver
from backend.models import config
from backend.models.dto import (
    ErrorDetail,
    ErrorResponse,
    ReconstructionRequest,
    ReconstructionResponse,
)

router = APIRouter(prefix="/api/reconstruct", tags=["reconstruction"])

# Factor to scale user edits down. 
# 0.1 means a "full white" stroke adds 0.1 to the gradient derivative.
# This prevents small edits from blowing out the image dynamic range.
DELTA_SCALE = 0.1

@router.post(
    "",
    response_model=ReconstructionResponse,
    responses={400: {"model": ErrorResponse}, 404: {"model": ErrorResponse}},
)
async def reconstruct(req: ReconstructionRequest):
    try:
        # Load image as RGB (0..1)
        original = image_store.load_image(req.imageId)
    except FileNotFoundError:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=ErrorDetail(
                code="IMAGE_NOT_FOUND", message=f"No image {req.imageId}"
            ).dict(),
        )
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=ErrorDetail(
                code="INTERNAL_SERVER_ERROR", message=str(exc)
            ).dict(),
        )

    # 1. Extract YCbCr channels
    src_ycrcb = cv2.cvtColor(original, cv2.COLOR_RGB2YCrCb)
    y_channel = src_ycrcb[:, :, 0]
    cr_channel = src_ycrcb[:, :, 1]
    cb_channel = src_ycrcb[:, :, 2]

    # 2. Compute gradients for reconstruction using Forward Differences
    # This matches the discrete Laplacian used in the solver, ensuring identity when no edits are made.
    # Note: gradient_ops.compute_gradients (Sobel) is used for frontend visual, 
    # but for mathematical reconstruction we need consistent derivatives.
    orig_dx, orig_dy = gradient_ops.compute_forward_gradients(y_channel)

    try:
        # 3. Decode edits as deltas
        final_dx = orig_dx
        final_dy = orig_dy

        if req.editedDx:
            # Note: The frontend draws on the "Sobel" view. 
            # Adding "Sobel delta" to "Forward gradient" is a slight mismatch visually 
            # but mathematically robust for the solver to apply the "change".
            delta_dx = gradient_ops.decode_base64_gradient_png(req.editedDx)
            if delta_dx.shape != original.shape[:2]:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=ErrorDetail(
                        code="INVALID_REQUEST",
                        message="Edited dx does not match image dimensions",
                    ).dict(),
                )
            final_dx = orig_dx + (delta_dx * DELTA_SCALE)

        if req.editedDy:
            delta_dy = gradient_ops.decode_base64_gradient_png(req.editedDy)
            if delta_dy.shape != original.shape[:2]:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=ErrorDetail(
                        code="INVALID_REQUEST",
                        message="Edited dy does not match image dimensions",
                    ).dict(),
                )
            final_dy = orig_dy + (delta_dy * DELTA_SCALE)

    except Exception as exc:
        if isinstance(exc, HTTPException):
            raise exc
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=ErrorDetail(
                code="INVALID_REQUEST", message=f"Cannot decode edits: {exc}"
            ).dict(),
        )

    # 4. Reconstruct Y channel
    reconstructed_y = poisson_solver.reconstruct_image_from_gradients(
        final_dx.astype(np.float32),
        final_dy.astype(np.float32),
        boundary_image=y_channel,
    )
    
    # 5. Merge back with original CbCr
    merged_ycrcb = np.zeros_like(src_ycrcb)
    merged_ycrcb[:, :, 0] = reconstructed_y
    merged_ycrcb[:, :, 1] = cr_channel
    merged_ycrcb[:, :, 2] = cb_channel
    
    # 6. Convert back to RGB
    recon_rgb = cv2.cvtColor(merged_ycrcb, cv2.COLOR_YCrCb2RGB)
    recon_rgb = np.clip(recon_rgb, 0.0, 1.0)

    path = config.RECON_DIR / f"{req.imageId}_recon.png"
    path.parent.mkdir(parents=True, exist_ok=True)
    from PIL import Image

    Image.fromarray((recon_rgb * 255).astype(np.uint8)).save(path, format="PNG")
    url = f"/{path.relative_to(config.BASE_DIR).as_posix()}"
    return ReconstructionResponse(imageId=req.imageId, reconstructedUrl=url)
