import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Activity, BarChart2, ArrowRight } from 'lucide-react';
import { PageLayout } from '@/components/layout/PageLayout';

export default function Home() {
  return (
    <PageLayout className='flex flex-col items-center justify-center min-h-[80vh] gap-12'>
      <section className='text-center space-y-6 max-w-2xl animate-in slide-in-from-bottom-4 duration-700 fade-in'>
        <h1 className='text-4xl md:text-6xl font-extrabold tracking-tighter text-foreground'>
          Gradient Lab
        </h1>
        <p className='text-lg text-muted-foreground leading-relaxed'>
          Explore the hidden structure of images. Manipulate gradient fields,
          reconstruct images from derivatives, and detect synthetic artifacts
          through mathematical analysis.
        </p>
        <div className='flex gap-4 justify-center pt-4'>
          <Link href='/lab'>
            <Button
              size='lg'
              className='gap-2 shadow-lg hover:shadow-xl transition-all'
            >
              Enter Lab <ArrowRight className='h-4 w-4' />
            </Button>
          </Link>
          <Link href='/analyzer'>
            <Button variant='outline' size='lg' className='gap-2'>
              Open Analyzer <BarChart2 className='h-4 w-4' />
            </Button>
          </Link>
        </div>
      </section>

      <section className='grid md:grid-cols-2 gap-6 w-full max-w-4xl animate-in slide-in-from-bottom-8 duration-1000 delay-150 fade-in'>
        <Link href='/lab' className='group'>
          <Card className='h-full hover:border-primary/50 hover:bg-muted/50 transition-all cursor-pointer border shadow-sm hover:shadow-md'>
            <CardHeader>
              <CardTitle className='flex items-center gap-2 group-hover:text-primary transition-colors'>
                <Activity className='h-5 w-5' /> Gradient Editing Lab
              </CardTitle>
              <CardDescription>
                Interactive workspace to visualize and edit image gradients (dx,
                dy). Apply brushes, filters, and reconstruct the image using
                Poisson solvers.
              </CardDescription>
            </CardHeader>
          </Card>
        </Link>

        <Link href='/analyzer' className='group'>
          <Card className='h-full hover:border-primary/50 hover:bg-muted/50 transition-all cursor-pointer border shadow-sm hover:shadow-md'>
            <CardHeader>
              <CardTitle className='flex items-center gap-2 group-hover:text-primary transition-colors'>
                <BarChart2 className='h-5 w-5' /> Synthetic Analyzer
              </CardTitle>
              <CardDescription>
                Compare real and synthetic images based on their gradient
                statistics. Detect inconsistencies in edge distribution and
                texture patterns.
              </CardDescription>
            </CardHeader>
          </Card>
        </Link>
      </section>

      <div className='text-sm text-muted-foreground mt-12 animate-in fade-in delay-300'>
        Exercise 03 • Project 02 • Synthetic Image Detection
      </div>
    </PageLayout>
  );
}
