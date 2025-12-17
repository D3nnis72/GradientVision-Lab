'use client';

import { useState } from 'react';
import { useAnalyzer, AnalyzedImage } from '@/app/analyzer/providers';
import { api } from '@/lib/api/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, Loader2 } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

export function AnalyzerInputPanel() {
  const { setImageA, setImageB } = useAnalyzer();
  const [loadingA, setLoadingA] = useState(false);
  const [loadingB, setLoadingB] = useState(false);

  const processImage = async (file: File): Promise<AnalyzedImage> => {
    // 1. Upload
    const upload = await api.uploadImage(file);
    // 2. Get Gradients
    const gradients = await api.getGradients(upload.imageId);
    // 3. Analyze
    const analysis = await api.analyzeImage(upload.imageId);

    return {
      imageId: upload.imageId,
      gradients,
      analysis,
    };
  };

  const handleUploadA = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoadingA(true);
    try {
      const data = await processImage(file);
      setImageA(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingA(false);
    }
  };

  const handleUploadB = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoadingB(true);
    try {
      const data = await processImage(file);
      setImageB(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingB(false);
    }
  };

  const UploadBox = ({
    id,
    loading,
    onChange,
    label,
  }: {
    id: string;
    loading: boolean;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    label: string;
  }) => (
    <div className='flex-1'>
      <Label htmlFor={id} className='block mb-2 font-medium'>
        {label}
      </Label>
      <Label
        htmlFor={id}
        className={cn(
          'flex flex-col items-center justify-center h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50 transition-colors',
          loading && 'opacity-50 pointer-events-none'
        )}
      >
        {loading ? (
          <Loader2 className='h-8 w-8 animate-spin text-muted-foreground' />
        ) : (
          <div className='text-center'>
            <Upload className='h-8 w-8 mx-auto text-muted-foreground mb-2' />
            <span className='text-xs text-muted-foreground'>Upload Image</span>
          </div>
        )}
        <Input
          id={id}
          type='file'
          accept='image/*'
          className='hidden'
          onChange={onChange}
          disabled={loading}
        />
      </Label>
    </div>
  );

  return (
    <div className='grid grid-cols-2 gap-6 mb-8'>
      <UploadBox
        id='upload-a'
        label='Image A (e.g. Real)'
        loading={loadingA}
        onChange={handleUploadA}
      />
      <UploadBox
        id='upload-b'
        label='Image B (e.g. Synthetic)'
        loading={loadingB}
        onChange={handleUploadB}
      />
    </div>
  );
}
