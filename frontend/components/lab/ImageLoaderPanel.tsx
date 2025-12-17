'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useLab } from '@/app/lab/providers';
import { api } from '@/lib/api/client';
import { Upload, Loader2, Image as ImageIcon } from 'lucide-react';
import { SectionHeadline } from '@/components/common/SectionHeadline';

export function ImageLoaderPanel() {
  const { setImageId, setImageMeta, setGradients } = useLab();
  const [isUploading, setIsUploading] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      // 1. Upload Image
      const uploadRes = await api.uploadImage(file);
      setImageId(uploadRes.imageId);
      setImageMeta({ width: uploadRes.width, height: uploadRes.height });

      // 2. Fetch Gradients immediately
      const gradientsRes = await api.getGradients(uploadRes.imageId);
      setGradients(gradientsRes);
    } catch (error) {
      console.error('Failed to upload or process image', error);
      // In a real app, show a toast here
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Card>
      <CardContent className='pt-6'>
        <SectionHeadline
          title='Image Loader'
          description='Start by uploading an image to analyze.'
        />

        <div className='grid gap-4 w-full max-w-sm items-center'>
          <Label htmlFor='image-upload' className='cursor-pointer'>
            <div className='flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg hover:bg-muted/50 transition-colors'>
              {isUploading ? (
                <Loader2 className='h-8 w-8 animate-spin text-muted-foreground' />
              ) : (
                <>
                  <Upload className='h-8 w-8 text-muted-foreground mb-2' />
                  <span className='text-sm text-muted-foreground'>
                    Click to upload image
                  </span>
                </>
              )}
            </div>
            <Input
              id='image-upload'
              type='file'
              accept='image/*'
              className='hidden'
              onChange={handleFileUpload}
              disabled={isUploading}
            />
          </Label>

          <div className='relative'>
            <div className='absolute inset-0 flex items-center'>
              <span className='w-full border-t' />
            </div>
            <div className='relative flex justify-center text-xs uppercase'>
              <span className='bg-background px-2 text-muted-foreground'>
                Or try a sample
              </span>
            </div>
          </div>

          <Button variant='outline' disabled className='w-full gap-2'>
            <ImageIcon className='h-4 w-4' /> Load Sample (Coming Soon)
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
