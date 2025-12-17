'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Activity, BarChart2, Info } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

export function AppHeader() {
  const pathname = usePathname();

  return (
    <header className='border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50'>
      <div className='container flex h-14 items-center max-w-screen-xl mx-auto px-4'>
        <Link href='/' className='mr-8 flex items-center space-x-2'>
          <Activity className='h-6 w-6 text-primary' />
          <span className='font-bold text-lg tracking-tight'>Gradient Lab</span>
        </Link>
        <nav className='flex items-center space-x-2 text-sm font-medium'>
          <Link href='/lab'>
            <Button
              variant={pathname === '/lab' ? 'secondary' : 'ghost'}
              size='sm'
              className='gap-2'
            >
              <Activity className='h-4 w-4' /> Lab
            </Button>
          </Link>
          <Link href='/analyzer'>
            <Button
              variant={pathname === '/analyzer' ? 'secondary' : 'ghost'}
              size='sm'
              className='gap-2'
            >
              <BarChart2 className='h-4 w-4' /> Analyzer
            </Button>
          </Link>
          <Link href='/about'>
            <Button
              variant={pathname === '/about' ? 'secondary' : 'ghost'}
              size='sm'
              className='gap-2'
            >
              <Info className='h-4 w-4' /> About
            </Button>
          </Link>
        </nav>
      </div>
    </header>
  );
}
