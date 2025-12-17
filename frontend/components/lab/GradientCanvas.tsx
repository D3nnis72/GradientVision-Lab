'use client';

import React, { useRef, useEffect, useState } from 'react';
import { useLab } from '@/app/lab/providers';
import { getApiUrl } from '@/lib/utils';

interface GradientCanvasProps {
  imageUrl: string;
  mode: 'dx' | 'dy' | 'view_only';
}

export function GradientCanvas({ imageUrl, mode }: GradientCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const editLayerRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const {
    editMode,
    brushSize,
    brushStrength,
    dxEditDataUrl,
    dyEditDataUrl,
    setDxEditDataUrl,
    setDyEditDataUrl,
  } = useLab();

  const [isDrawing, setIsDrawing] = useState(false);
  const [scale, setScale] = useState(1);
  const [imageSize, setImageSize] = useState<{
    width: number;
    height: number;
  } | null>(null);

  // Determine which edit layer we are working on
  const currentEditUrl =
    mode === 'dx' ? dxEditDataUrl : mode === 'dy' ? dyEditDataUrl : null;
  const setCurrentEditUrl =
    mode === 'dx'
      ? setDxEditDataUrl
      : mode === 'dy'
      ? setDyEditDataUrl
      : () => {};

  // Helper to initialize edit layer
  const initEditLayer = (width: number, height: number) => {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = 'rgb(128, 128, 128)'; // Neutral gray
      ctx.fillRect(0, 0, width, height);
    }
    return canvas;
  };

  // Render composition: Background Image + Edit Layer (blended)
  const renderComposite = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    const editCanvas = editLayerRef.current;

    if (!canvas || !ctx || !imageSize) return;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = getApiUrl(imageUrl);

    img.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      // Draw background
      ctx.drawImage(img, 0, 0, imageSize.width, imageSize.height);

      // Draw edit layer with blending
      if (editCanvas) {
        // We want the edit layer to modify the background.
        // Ideally: value = background + (edit - 128)
        // Canvas 'overlay' or 'hard-light' might approximate this visually,
        // but for simple feedback let's use 'overlay' or just semi-transparent normal for now.
        // Since we want to see what we draw, let's just draw it with some opacity or blending mode.

        // For MVP visualization: Let's use 'hard-light' or 'overlay' to show changes.
        ctx.globalCompositeOperation = 'overlay';
        ctx.drawImage(editCanvas, 0, 0, imageSize.width, imageSize.height);
        ctx.globalCompositeOperation = 'source-over';
      }
    };
  };

  // Initialize or Load Edit Layer
  useEffect(() => {
    if (!imageSize) return;

    if (!editLayerRef.current) {
      editLayerRef.current = initEditLayer(imageSize.width, imageSize.height);
    }

    // If we have stored state, load it
    if (currentEditUrl) {
      const img = new Image();
      img.onload = () => {
        const ctx = editLayerRef.current?.getContext('2d');
        if (ctx && editLayerRef.current) {
          ctx.drawImage(img, 0, 0);
          renderComposite();
        }
      };
      img.src = currentEditUrl;
    } else {
      // Initialize to neutral if not exists
      const ctx = editLayerRef.current?.getContext('2d');
      if (ctx && editLayerRef.current) {
        ctx.fillStyle = 'rgb(128, 128, 128)';
        ctx.fillRect(0, 0, imageSize.width, imageSize.height);
        renderComposite();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentEditUrl, imageSize]);

  // Initial Load of Background Image
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = getApiUrl(imageUrl);

    img.onload = () => {
      if (canvas && ctx && containerRef.current) {
        const containerWidth = containerRef.current.clientWidth;
        const containerHeight = containerRef.current.clientHeight;

        const scaleW = containerWidth / img.width;
        const scaleH = containerHeight / img.height;
        const scaleFactor = Math.min(scaleW, scaleH, 1);

        setScale(scaleFactor);
        setImageSize({ width: img.width, height: img.height });

        canvas.width = img.width;
        canvas.height = img.height;

        // Initial draw
        renderComposite();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [imageUrl]);

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (mode === 'view_only') return;

    // Check if we are in a compatible edit mode
    if (
      mode === 'dx' &&
      editMode !== 'dx' &&
      editMode !== 'erase' &&
      editMode !== 'sharpen'
    )
      return;
    if (
      mode === 'dy' &&
      editMode !== 'dy' &&
      editMode !== 'erase' &&
      editMode !== 'sharpen'
    )
      return;

    setIsDrawing(true);
    draw(e);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    draw(e);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current || !editLayerRef.current || !imageSize) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (canvas.width / rect.width);
    const y = (e.clientY - rect.top) * (canvas.height / rect.height);

    const ctx = editLayerRef.current.getContext('2d');
    if (!ctx) return;

    ctx.beginPath();
    ctx.arc(x, y, brushSize, 0, 2 * Math.PI);

    // Logic for tools
    if (editMode === 'erase') {
      // Reset to neutral gray (128)
      // We use specific composite operation or just fill
      // Create a radial gradient for smoother brush?
      const g = ctx.createRadialGradient(x, y, 0, x, y, brushSize);
      g.addColorStop(0, 'rgba(128, 128, 128, 1)');
      g.addColorStop(1, 'rgba(128, 128, 128, 0)');
      // This simple gradient approach isn't perfect for "setting" value, but works for additive mixing
      // For erase, we want to force value to 128.
      // Let's just paint solid for MVP stability
      ctx.fillStyle = 'rgb(128, 128, 128)';
      ctx.fill();
    } else if (editMode === 'sharpen') {
      // Not trivial to implement "sharpen" on a delta layer without reading underlying pixels.
      // Let's treat 'sharpen' as "increase contrast" or just "make brighter/darker extreme".
      // Placeholder: paint white (increase gradient)
      ctx.fillStyle = `rgba(255, 255, 255, ${brushStrength * 0.1})`;
      ctx.fill();
    } else {
      // Normal Draw (dx or dy)
      // If we are in dx mode, we assume we want to ADD to the gradient (make it more positive -> lighter)
      // But maybe we want to subtract?
      // Let's say: Left click = Add (White), Right click (context menu blocked?) = Subtract (Black)?
      // Or just simplified: Draw = Add Intensity (White), Erase = Remove.
      // Let's make standard draw add white (increase value).

      // To support "negative" gradients, we might need a modifier key or a "Direction" toggle.
      // For now: White (255) = +1, Black (0) = -1, Gray (128) = 0.

      // Let's just paint white with low opacity to "add"
      // Or black to "subtract" if we hold Shift?

      if (e.shiftKey) {
        ctx.fillStyle = `rgba(0, 0, 0, ${brushStrength * 0.1})`;
      } else {
        ctx.fillStyle = `rgba(255, 255, 255, ${brushStrength * 0.1})`;
      }
      ctx.fill();
    }

    renderComposite();
  };

  const handleMouseUp = () => {
    if (isDrawing) {
      setIsDrawing(false);
      // Save state
      if (editLayerRef.current) {
        setCurrentEditUrl(editLayerRef.current.toDataURL());
      }
    }
  };

  return (
    <div
      ref={containerRef}
      className='w-full h-full flex items-center justify-center overflow-hidden bg-checkers'
    >
      <canvas
        ref={canvasRef}
        className='shadow-lg max-w-full max-h-full object-contain cursor-crosshair'
        style={{
          width: 'auto',
          height: 'auto',
          maxWidth: '100%',
          maxHeight: '100%',
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onContextMenu={(e) => e.preventDefault()}
      />
    </div>
  );
}
