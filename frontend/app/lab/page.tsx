import { LabProvider } from './providers';
import { LabContent } from '@/components/lab/LabContent';
import { PageLayout } from '@/components/layout/PageLayout';

export default function LabPage() {
  return (
    <LabProvider>
      <PageLayout className='h-[calc(100vh-4rem)] flex flex-col'>
        <LabContent />
      </PageLayout>
    </LabProvider>
  );
}
