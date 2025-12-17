'use client';

import { SectionHeadline } from '@/components/common/SectionHeadline';
import { AnalyzerInputPanel } from './AnalyzerInputPanel';
import { AnalyzerComparisonPanel } from './AnalyzerComparisonPanel';

export function AnalyzerContent() {
  return (
    <div className='space-y-8'>
      <div className='max-w-2xl'>
        <h1 className='text-3xl font-bold tracking-tight mb-2'>
          Synthetic Image Analyzer
        </h1>
        <p className='text-muted-foreground'>
          Upload two images to compare their gradient statistics. This tool
          helps identify subtle artifacts in synthetic images by analyzing edge
          consistency and texture patterns.
        </p>
      </div>

      <AnalyzerInputPanel />

      <SectionHeadline
        title='Analysis Results'
        description='Compare the gradient signatures side by side.'
      />

      <AnalyzerComparisonPanel />
    </div>
  );
}
