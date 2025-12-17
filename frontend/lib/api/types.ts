export interface ImageMeta {
  width: number;
  height: number;
}

export interface UploadImageResponse {
  imageId: string;
  width: number;
  height: number;
}

export interface GradientsResponse {
  imageId: string;
  width: number;
  height: number;
  dxUrl: string;
  dyUrl: string;
  magnitudeUrl: string;
}

// Simplified edit structure for now
export interface ReconstructionRequest {
  imageId: string;
  editedDx?: string; // Base64 or other format, to be defined
  editedDy?: string;
  mode: 'full' | 'patch'; // just an example
}

export interface ReconstructionResponse {
  imageId: string;
  reconstructedUrl: string;
}

export interface AnalysisScores {
  edgeConsistency: number;
  smoothnessScore: number;
  textureWeirdness: number;
}

export interface AnalysisResponse {
  imageId: string;
  scores: AnalysisScores;
  heatmapUrl: string;
}

export interface ApiError {
  error: {
    code: string;
    message: string;
  };
}
