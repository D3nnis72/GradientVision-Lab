import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface SectionHeadlineProps {
  title: string;
  description?: string;
  children?: ReactNode;
  className?: string;
}

export function SectionHeadline({
  title,
  description,
  children,
  className,
}: SectionHeadlineProps) {
  return (
    <div className={cn('flex flex-col gap-1 pb-4 border-b mb-6', className)}>
      <div className='flex items-center justify-between'>
        <h2 className='text-2xl font-semibold tracking-tight'>{title}</h2>
        {children}
      </div>
      {description && (
        <p className='text-sm text-muted-foreground'>{description}</p>
      )}
    </div>
  );
}
