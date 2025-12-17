'use client';

import { AnalyzedImage } from '@/app/analyzer/providers';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress'; // We might need to install progress if not present, or use simple div
import { InfoTooltip } from '@/components/common/InfoTooltip';

// Simple Score Bar Component
function ScoreBar({
  label,
  value,
  description,
}: {
  label: string;
  value: number;
  description: string;
}) {
  // Normalize value to 0-100 for display
  const percentage = Math.min(Math.max(value * 100, 0), 100);

  return (
    <div className='space-y-1'>
      <div className='flex justify-between text-sm'>
        <span className='font-medium flex items-center gap-1'>
          {label} <InfoTooltip content={description} />
        </span>
        <span className='text-muted-foreground'>{value.toFixed(2)}</span>
      </div>
      <div className='h-2 w-full bg-secondary rounded-full overflow-hidden'>
        <div
          className='h-full bg-primary transition-all duration-500'
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

export function AnalyzerScores({ image }: { image: AnalyzedImage }) {
  const { analysis } = image;
  if (!analysis) return null;

  const { scores } = analysis;

  return (
    <Card>
      <CardHeader className='pb-2'>
        <CardTitle className='text-base'>Analysis Scores</CardTitle>
      </CardHeader>
      <CardContent className='space-y-4'>
        <ScoreBar
          label='Edge Consistency'
          value={scores.edgeConsistency}
          description='Measures how consistent edges are across the image. Low values might indicate artifacts.'
        />
        <ScoreBar
          label='Smoothness'
          value={scores.smoothnessScore}
          description='Global smoothness measure. Synthetic images are often unnaturally smooth in certain frequency bands.'
        />
        <ScoreBar
          label='Texture Anomaly'
          value={scores.textureWeirdness}
          description='Detects irregular texture patterns often found in diffusion generated backgrounds.'
        />
      </CardContent>
    </Card>
  );
}
