import React, { useState } from 'react';
import { cn } from '@/lib/utils';

interface ImageWithSkeletonProps
  extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  className?: string;
}

export function ImageWithSkeleton({
  src,
  alt,
  className,
  ...props
}: ImageWithSkeletonProps) {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <div
      className={cn('relative overflow-hidden bg-muted rounded-md', className)}
    >
      {!isLoaded && (
        <div className='absolute inset-0 flex items-center justify-center bg-muted animate-pulse'>
          <span className='sr-only'>Loading...</span>
        </div>
      )}
      <img
        src={src}
        alt={alt}
        className={cn(
          'w-full h-full object-contain transition-opacity duration-500',
          isLoaded ? 'opacity-100' : 'opacity-0'
        )}
        onLoad={() => setIsLoaded(true)}
        {...props}
      />
    </div>
  );
}
