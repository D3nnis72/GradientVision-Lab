'use client';

import { useAnalyzer, AnalyzedImage } from '@/app/analyzer/providers';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ImageWithSkeleton } from '@/components/common/ImageWithSkeleton';
import { AnalyzerScores } from './AnalyzerScores';
import { Card } from '@/components/ui/card';
import { getApiUrl } from '@/lib/utils';

function SingleImageAnalysis({
  image,
  label,
}: {
  image: AnalyzedImage | null;
  label: string;
}) {
  if (!image || !image.gradients || !image.analysis) {
    return (
      <div className='h-full min-h-[300px] flex items-center justify-center border-2 border-dashed rounded-lg text-muted-foreground bg-muted/10'>
        Waiting for {label}...
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      <div className='space-y-2'>
        <h3 className='font-semibold text-lg'>{label}</h3>
        <AnalyzerScores image={image} />
      </div>

      <Tabs defaultValue='heatmap' className='w-full'>
        <TabsList className='w-full grid grid-cols-4'>
          <TabsTrigger value='heatmap'>Heatmap</TabsTrigger>
          <TabsTrigger value='mag'>Magnitude</TabsTrigger>
          <TabsTrigger value='dx'>dx</TabsTrigger>
          <TabsTrigger value='dy'>dy</TabsTrigger>
        </TabsList>

        <div className='mt-4 aspect-square bg-muted rounded-md overflow-hidden border relative'>
          <TabsContent value='heatmap' className='m-0 w-full h-full'>
            <ImageWithSkeleton
              src={getApiUrl(image.analysis.heatmapUrl)}
              alt='Analysis Heatmap'
              className='w-full h-full object-contain'
            />
          </TabsContent>
          <TabsContent value='mag' className='m-0 w-full h-full'>
            <ImageWithSkeleton
              src={getApiUrl(image.gradients.magnitudeUrl)}
              alt='Gradient Magnitude'
              className='w-full h-full object-contain'
            />
          </TabsContent>
          <TabsContent value='dx' className='m-0 w-full h-full'>
            <ImageWithSkeleton
              src={getApiUrl(image.gradients.dxUrl)}
              alt='dx'
              className='w-full h-full object-contain'
            />
          </TabsContent>
          <TabsContent value='dy' className='m-0 w-full h-full'>
            <ImageWithSkeleton
              src={getApiUrl(image.gradients.dyUrl)}
              alt='dy'
              className='w-full h-full object-contain'
            />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}

export function AnalyzerComparisonPanel() {
  const { imageA, imageB } = useAnalyzer();

  return (
    <div className='grid md:grid-cols-2 gap-8'>
      <SingleImageAnalysis image={imageA} label='Image A' />
      <SingleImageAnalysis image={imageB} label='Image B' />
    </div>
  );
}
