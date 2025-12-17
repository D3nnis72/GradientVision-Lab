'use client';

import { ImageLoaderPanel } from './ImageLoaderPanel';
import { GradientViewPanel } from './GradientViewPanel';
import { GradientEditControls } from './GradientEditControls';
import { ReconstructionPanel } from './ReconstructionPanel';

export function LabContent() {
  return (
    <div className='grid grid-cols-1 lg:grid-cols-12 gap-6 h-full min-h-0'>
      {/* Left Sidebar: Controls */}
      <div className='lg:col-span-3 flex flex-col gap-6 h-full overflow-y-auto pr-2'>
        <ImageLoaderPanel />
        <GradientEditControls />
        <ReconstructionPanel />
      </div>

      {/* Right Main Area: Visualization */}
      <div className='lg:col-span-9 flex flex-col h-full min-h-[500px]'>
        <GradientViewPanel />
      </div>
    </div>
  );
}
