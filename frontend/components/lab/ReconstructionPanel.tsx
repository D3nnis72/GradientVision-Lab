'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useLab } from '@/app/lab/providers';
import { api } from '@/lib/api/client';
import { RefreshCw, Check } from 'lucide-react';

export function ReconstructionPanel() {
  const {
    imageId,
    setReconstructedUrl,
    gradients,
    dxEditDataUrl,
    dyEditDataUrl,
  } = useLab();
  const [isReconstructing, setIsReconstructing] = useState(false);

  const handleReconstruct = async () => {
    if (!imageId) return;

    setIsReconstructing(true);
    try {
      // Extract Base64 data from Data URLs (remove "data:image/png;base64," prefix)
      const cleanBase64 = (url: string | null) => {
        if (!url) return undefined;
        return url.split(',')[1];
      };

      const res = await api.reconstructImage({
        imageId,
        mode: 'full',
        editedDx: cleanBase64(dxEditDataUrl),
        editedDy: cleanBase64(dyEditDataUrl),
      });
      setReconstructedUrl(res.reconstructedUrl);
    } catch (e) {
      console.error('Reconstruction failed', e);
    } finally {
      setIsReconstructing(false);
    }
  };

  if (!gradients) return null;

  return (
    <Card className='mt-auto'>
      <CardHeader className='pb-2'>
        <CardTitle className='text-lg'>Reconstruction</CardTitle>
      </CardHeader>
      <CardContent className='space-y-4'>
        <Button
          className='w-full gap-2'
          onClick={handleReconstruct}
          disabled={isReconstructing || !imageId}
        >
          {isReconstructing ? (
            <RefreshCw className='h-4 w-4 animate-spin' />
          ) : (
            <RefreshCw className='h-4 w-4' />
          )}
          Reconstruct Image
        </Button>
        <p className='text-xs text-muted-foreground text-center'>
          Result will appear in the main view tab.
        </p>
      </CardContent>
    </Card>
  );
}
