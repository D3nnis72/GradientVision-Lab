import { PageLayout } from '@/components/layout/PageLayout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

export default function AboutPage() {
  return (
    <PageLayout className='space-y-8'>
      <div className='space-y-4'>
        <h1 className='text-3xl font-bold tracking-tight'>
          About Gradient Lab
        </h1>
        <p className='text-muted-foreground text-lg max-w-3xl'>
          This project explores the concept of Gradient Domain Image Processing
          and its application in detecting synthetic images.
        </p>
      </div>

      <div className='grid gap-6 md:grid-cols-2 lg:grid-cols-3'>
        <Card>
          <CardHeader>
            <CardTitle>Why Gradient Domain?</CardTitle>
          </CardHeader>
          <CardContent className='text-muted-foreground text-sm leading-relaxed'>
            Human vision is more sensitive to contrast (gradients) than absolute
            intensity. Working in the gradient domain allows us to manipulate
            edges and texture structure directly, which is crucial for tasks
            like seamless cloning or detecting artifacts in AI-generated images.
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>How it Works</CardTitle>
          </CardHeader>
          <CardContent className='text-muted-foreground text-sm leading-relaxed'>
            The backend computes horizontal (dx) and vertical (dy) derivatives
            of the image. After editing these gradients, we solve the Poisson
            Equation:
            <div className='bg-muted px-2 py-2 rounded text-xs font-mono mt-2 mb-2 text-center'>
              ΔI = div(G)
            </div>
            to reconstruct the image I that best matches the modified gradient
            field G.
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Synthetic Detection</CardTitle>
          </CardHeader>
          <CardContent className='text-muted-foreground text-sm leading-relaxed'>
            AI generators often struggle to maintain consistent global gradient
            statistics. The Analyzer compares these statistics between real and
            synthetic images to identify unnatural smoothness or irregular edge
            distributions.
          </CardContent>
        </Card>
      </div>

      <div className='bg-muted/30 p-6 rounded-lg border'>
        <h3 className='font-semibold mb-4 text-lg'>
          Experiments to try in the Lab
        </h3>
        <ul className='list-disc list-inside space-y-2 text-muted-foreground'>
          <li>
            Set <strong>dx</strong> or <strong>dy</strong> to zero completely
            and reconstruct to see the effect of directional edges.
          </li>
          <li>
            Use the brush to locally erase edges in the gradient view and see
            how the reconstruction "fills in" the flat area.
          </li>
          <li>
            Boost the gradient magnitude to sharpen the image without increasing
            noise in flat areas.
          </li>
        </ul>
      </div>
    </PageLayout>
  );
}
