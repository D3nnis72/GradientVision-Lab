'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Button } from '@/components/ui/button';
import { useLab } from '@/app/lab/providers';
import { Edit2, Eraser, Zap, Activity, RotateCcw } from 'lucide-react';
import { SectionHeadline } from '@/components/common/SectionHeadline';

export function GradientEditControls() {
  const {
    editMode,
    setEditMode,
    brushSize,
    setBrushSize,
    brushStrength,
    setBrushStrength,
    resetEdits,
  } = useLab();

  return (
    <Card>
      <CardContent className='pt-6 space-y-6'>
        <SectionHeadline title='Tools' className='mb-4 pb-2' />

        <div className='space-y-3'>
          <Label>Edit Mode</Label>
          <ToggleGroup
            type='single'
            value={editMode}
            onValueChange={(val) => val && setEditMode(val as any)}
            className='justify-start flex-wrap gap-2'
          >
            <ToggleGroupItem
              value='dx'
              aria-label='Edit Horizontal'
              className='gap-2'
            >
              <Activity className='h-4 w-4 rotate-90' /> Edit dx
            </ToggleGroupItem>
            <ToggleGroupItem
              value='dy'
              aria-label='Edit Vertical'
              className='gap-2'
            >
              <Activity className='h-4 w-4' /> Edit dy
            </ToggleGroupItem>
            <ToggleGroupItem value='erase' aria-label='Erase' className='gap-2'>
              <Eraser className='h-4 w-4' /> Eraser
            </ToggleGroupItem>
            <ToggleGroupItem
              value='sharpen'
              aria-label='Sharpen'
              className='gap-2'
            >
              <Zap className='h-4 w-4' /> Sharpen
            </ToggleGroupItem>
          </ToggleGroup>
        </div>

        <div className='space-y-4'>
          <div className='space-y-2'>
            <div className='flex justify-between'>
              <Label>Brush Size</Label>
              <span className='text-xs text-muted-foreground'>
                {brushSize}px
              </span>
            </div>
            <Slider
              value={[brushSize]}
              onValueChange={(vals) => setBrushSize(vals[0])}
              min={1}
              max={100}
              step={1}
            />
          </div>

          <div className='space-y-2'>
            <div className='flex justify-between'>
              <Label>Strength</Label>
              <span className='text-xs text-muted-foreground'>
                {Math.round(brushStrength * 100)}%
              </span>
            </div>
            <Slider
              value={[brushStrength]}
              onValueChange={(vals) => setBrushStrength(vals[0])}
              min={0.1}
              max={1.0}
              step={0.1}
            />
          </div>
        </div>

        <div className='pt-2'>
          <Button
            variant='outline'
            onClick={resetEdits}
            className='w-full gap-2'
          >
            <RotateCcw className='h-4 w-4' /> Reset Edits
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
