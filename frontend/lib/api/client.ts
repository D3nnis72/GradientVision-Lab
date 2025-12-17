import axios from 'axios';
import {
  UploadImageResponse,
  GradientsResponse,
  ReconstructionRequest,
  ReconstructionResponse,
  AnalysisResponse,
} from './types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const api = {
  uploadImage: async (file: File): Promise<UploadImageResponse> => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await apiClient.post<UploadImageResponse>(
      '/api/images',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  },

  getGradients: async (imageId: string): Promise<GradientsResponse> => {
    const response = await apiClient.get<GradientsResponse>('/api/gradients', {
      params: { imageId },
    });
    return response.data;
  },

  reconstructImage: async (
    payload: ReconstructionRequest
  ): Promise<ReconstructionResponse> => {
    const response = await apiClient.post<ReconstructionResponse>(
      '/api/reconstruct',
      payload
    );
    return response.data;
  },

  analyzeImage: async (imageId: string): Promise<AnalysisResponse> => {
    const response = await apiClient.post<AnalysisResponse>('/api/analyze', {
      imageId,
    });
    return response.data;
  },
};
