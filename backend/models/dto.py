from typing import Dict, Optional

from pydantic import BaseModel, Field


class UploadImageResponse(BaseModel):
    imageId: str
    width: int
    height: int


class GradientsResponse(BaseModel):
    imageId: str
    width: int
    height: int
    dxUrl: str
    dyUrl: str
    magnitudeUrl: str


class ReconstructionRequest(BaseModel):
    imageId: str
    editedDx: Optional[str] = Field(
        default=None,
        description="Base64 PNG of edited dx in [-1,1] encoded to grayscale",
    )
    editedDy: Optional[str] = Field(
        default=None,
        description="Base64 PNG of edited dy in [-1,1] encoded to grayscale",
    )
    mode: Optional[str] = "full"


class ReconstructionResponse(BaseModel):
    imageId: str
    reconstructedUrl: str


class AnalysisRequest(BaseModel):
    imageId: str


class AnalysisResponse(BaseModel):
    imageId: str
    scores: Dict[str, float]
    heatmapUrl: str


class ErrorDetail(BaseModel):
    code: str
    message: str


class ErrorResponse(BaseModel):
    error: ErrorDetail
