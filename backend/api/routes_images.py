from fastapi import APIRouter, File, HTTPException, UploadFile, status

from backend.core import image_store
from backend.models.dto import UploadImageResponse, ErrorResponse, ErrorDetail

router = APIRouter(prefix="/api/images", tags=["images"])


@router.post(
    "",
    response_model=UploadImageResponse,
    responses={400: {"model": ErrorResponse}},
)
async def upload_image(file: UploadFile = File(...)):
    try:
        content = await file.read()
        image_id, width, height = image_store.save_image(content)
        return UploadImageResponse(imageId=image_id, width=width, height=height)
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=ErrorDetail(code="INVALID_REQUEST", message=str(exc)).dict(),
        )
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=ErrorDetail(code="INTERNAL_SERVER_ERROR", message=str(exc)).dict(),
        )

