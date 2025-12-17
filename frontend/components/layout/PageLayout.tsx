import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface PageLayoutProps {
  children: ReactNode;
  className?: string;
}

export function PageLayout({ children, className }: PageLayoutProps) {
  return (
    <div
      className={cn(
        'container max-w-screen-xl mx-auto px-4 py-8 animate-in fade-in duration-500',
        className
      )}
    >
      {children}
    </div>
  );
}
