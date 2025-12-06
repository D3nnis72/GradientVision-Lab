from fastapi import APIRouter, HTTPException, Query, status

from backend.core import gradient_ops, image_store
from backend.models import config
from backend.models.dto import ErrorDetail, ErrorResponse, GradientsResponse

router = APIRouter(prefix="/api/gradients", tags=["gradients"])


@router.get(
    "",
    response_model=GradientsResponse,
    responses={404: {"model": ErrorResponse}, 500: {"model": ErrorResponse}},
)
async def get_gradients(imageId: str = Query(..., alias="imageId")):
    try:
        image = image_store.load_image(imageId)
    except FileNotFoundError:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=ErrorDetail(code="IMAGE_NOT_FOUND", message=f"No image {imageId}").dict(),
        )
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=ErrorDetail(code="INTERNAL_SERVER_ERROR", message=str(exc)).dict(),
        )

    dx, dy = gradient_ops.compute_gradients(image)

    dx_url = gradient_ops.save_gradient_visual(
        dx, dy, "dx", config.GRADIENT_DIR / f"{imageId}_dx.png"
    )
    dy_url = gradient_ops.save_gradient_visual(
        dx, dy, "dy", config.GRADIENT_DIR / f"{imageId}_dy.png"
    )
    mag_url = gradient_ops.save_gradient_visual(
        dx, dy, "mag", config.GRADIENT_DIR / f"{imageId}_mag.png"
    )

    return GradientsResponse(
        imageId=imageId,
        width=image.shape[1],
        height=image.shape[0],
        dxUrl=dx_url,
        dyUrl=dy_url,
        magnitudeUrl=mag_url,
    )

