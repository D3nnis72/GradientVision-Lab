from fastapi import APIRouter, HTTPException, status

from backend.core import gradient_ops, image_store, synthetic_detector
from backend.models.dto import AnalysisRequest, AnalysisResponse, ErrorDetail, ErrorResponse

router = APIRouter(prefix="/api/analyze", tags=["analysis"])


@router.post(
    "",
    response_model=AnalysisResponse,
    responses={404: {"model": ErrorResponse}, 500: {"model": ErrorResponse}},
)
async def analyze(req: AnalysisRequest):
    try:
        image = image_store.load_image(req.imageId)
    except FileNotFoundError:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=ErrorDetail(code="IMAGE_NOT_FOUND", message=f"No image {req.imageId}").dict(),
        )
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=ErrorDetail(code="INTERNAL_SERVER_ERROR", message=str(exc)).dict(),
        )

    dx, dy = gradient_ops.compute_gradients(image)
    scores, heatmap = synthetic_detector.analyze_gradients(dx, dy)
    heatmap_url = synthetic_detector.save_heatmap(req.imageId, heatmap)

    return AnalysisResponse(imageId=req.imageId, scores=scores, heatmapUrl=heatmap_url)

