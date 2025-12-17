'use client';

import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useRef,
  MutableRefObject,
} from 'react';
import { GradientsResponse, ImageMeta } from '@/lib/api/types';

interface LabState {
  imageId: string | null;
  imageMeta: ImageMeta | null;
  gradients: GradientsResponse | null;
  editMode: 'dx' | 'dy' | 'erase' | 'sharpen' | 'smooth';
  brushSize: number;
  brushStrength: number;
  reconstructedUrl: string | null;
  dxEditDataUrl: string | null;
  dyEditDataUrl: string | null;
}

interface LabContextType extends LabState {
  setImageId: (id: string) => void;
  setImageMeta: (meta: ImageMeta) => void;
  setGradients: (gradients: GradientsResponse) => void;
  setEditMode: (mode: LabState['editMode']) => void;
  setBrushSize: (size: number) => void;
  setBrushStrength: (strength: number) => void;
  setReconstructedUrl: (url: string | null) => void;
  setDxEditDataUrl: (url: string | null) => void;
  setDyEditDataUrl: (url: string | null) => void;
  resetEdits: () => void;
}

const LabContext = createContext<LabContextType | undefined>(undefined);

export function LabProvider({ children }: { children: ReactNode }) {
  const [imageId, setImageId] = useState<string | null>(null);
  const [imageMeta, setImageMeta] = useState<ImageMeta | null>(null);
  const [gradients, setGradients] = useState<GradientsResponse | null>(null);
  const [editMode, setEditMode] = useState<LabState['editMode']>('dx');
  const [brushSize, setBrushSize] = useState(20);
  const [brushStrength, setBrushStrength] = useState(0.5);
  const [reconstructedUrl, setReconstructedUrl] = useState<string | null>(null);

  // Edit layers state
  const [dxEditDataUrl, setDxEditDataUrl] = useState<string | null>(null);
  const [dyEditDataUrl, setDyEditDataUrl] = useState<string | null>(null);

  const resetEdits = () => {
    setDxEditDataUrl(null);
    setDyEditDataUrl(null);
  };

  return (
    <LabContext.Provider
      value={{
        imageId,
        imageMeta,
        gradients,
        editMode,
        brushSize,
        brushStrength,
        reconstructedUrl,
        dxEditDataUrl,
        dyEditDataUrl,
        setImageId,
        setImageMeta,
        setGradients,
        setEditMode,
        setBrushSize,
        setBrushStrength,
        setReconstructedUrl,
        setDxEditDataUrl,
        setDyEditDataUrl,
        resetEdits,
      }}
    >
      {children}
    </LabContext.Provider>
  );
}

export function useLab() {
  const context = useContext(LabContext);
  if (context === undefined) {
    throw new Error('useLab must be used within a LabProvider');
  }
  return context;
}
