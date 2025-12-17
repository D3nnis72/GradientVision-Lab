'use client';

import { useLab } from '@/app/lab/providers';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { InfoTooltip } from '@/components/common/InfoTooltip';
import { GradientCanvas } from './GradientCanvas';
import { ImageWithSkeleton } from '@/components/common/ImageWithSkeleton';
import { getApiUrl } from '@/lib/utils';
import { Check } from 'lucide-react';

export function GradientViewPanel() {
  const { gradients, imageId, reconstructedUrl } = useLab();

  if (!gradients || !imageId) {
    return (
      <div className='flex items-center justify-center h-full min-h-[400px] border rounded-lg bg-muted/10 text-muted-foreground border-dashed'>
        Upload an image to view gradients
      </div>
    );
  }

  return (
    <Card className='h-full flex flex-col'>
      <CardContent className='p-0 flex-1 flex flex-col'>
        <Tabs defaultValue='dx' className='w-full h-full flex flex-col'>
          <div className='border-b px-4 py-2 flex items-center justify-between bg-muted/20'>
            <TabsList>
              <TabsTrigger value='dx' className='gap-2'>
                dx{' '}
                <InfoTooltip content='Horizontal derivative. Shows vertical edges.' />
              </TabsTrigger>
              <TabsTrigger value='dy' className='gap-2'>
                dy{' '}
                <InfoTooltip content='Vertical derivative. Shows horizontal edges.' />
              </TabsTrigger>
              <TabsTrigger value='mag' className='gap-2'>
                Magnitude{' '}
                <InfoTooltip content='Gradient magnitude. Shows overall edge strength.' />
              </TabsTrigger>
              {reconstructedUrl && (
                <TabsTrigger
                  value='recon'
                  className='gap-2 text-green-600 data-[state=active]:text-green-700'
                >
                  <Check className='h-3 w-3' /> Result
                </TabsTrigger>
              )}
            </TabsList>
            <span className='text-xs text-muted-foreground font-mono'>
              {gradients.width} x {gradients.height} px
            </span>
          </div>

          <div className='flex-1 bg-muted/10 relative overflow-hidden'>
            <TabsContent
              value='dx'
              className='h-full m-0 p-4 flex items-center justify-center'
            >
              <GradientCanvas imageUrl={gradients.dxUrl} mode='dx' />
            </TabsContent>
            <TabsContent
              value='dy'
              className='h-full m-0 p-4 flex items-center justify-center'
            >
              <GradientCanvas imageUrl={gradients.dyUrl} mode='dy' />
            </TabsContent>
            <TabsContent
              value='mag'
              className='h-full m-0 p-4 flex items-center justify-center'
            >
              <GradientCanvas
                imageUrl={gradients.magnitudeUrl}
                mode='view_only'
              />
            </TabsContent>
            {reconstructedUrl && (
              <TabsContent
                value='recon'
                className='h-full m-0 p-4 flex items-center justify-center'
              >
                <div className='w-full h-full flex items-center justify-center overflow-hidden bg-checkers shadow-lg'>
                  <ImageWithSkeleton
                    src={getApiUrl(reconstructedUrl)}
                    alt='Reconstructed Image'
                    className='max-w-full max-h-full object-contain'
                  />
                </div>
              </TabsContent>
            )}
          </div>
        </Tabs>
      </CardContent>
    </Card>
  );
}
