'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { AnalysisResponse, GradientsResponse } from '@/lib/api/types';

export interface AnalyzedImage {
  imageId: string;
  gradients: GradientsResponse | null;
  analysis: AnalysisResponse | null;
}

interface AnalyzerContextType {
  imageA: AnalyzedImage | null;
  imageB: AnalyzedImage | null;
  setImageA: (data: AnalyzedImage | null) => void;
  setImageB: (data: AnalyzedImage | null) => void;
}

const AnalyzerContext = createContext<AnalyzerContextType | undefined>(
  undefined
);

export function AnalyzerProvider({ children }: { children: ReactNode }) {
  const [imageA, setImageA] = useState<AnalyzedImage | null>(null);
  const [imageB, setImageB] = useState<AnalyzedImage | null>(null);

  return (
    <AnalyzerContext.Provider value={{ imageA, imageB, setImageA, setImageB }}>
      {children}
    </AnalyzerContext.Provider>
  );
}

export function useAnalyzer() {
  const context = useContext(AnalyzerContext);
  if (context === undefined) {
    throw new Error('useAnalyzer must be used within an AnalyzerProvider');
  }
  return context;
}
