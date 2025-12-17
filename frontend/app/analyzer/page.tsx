import { AnalyzerProvider } from './providers';
import { AnalyzerContent } from '@/components/analyzer/AnalyzerContent';
import { PageLayout } from '@/components/layout/PageLayout';

export default function AnalyzerPage() {
  return (
    <AnalyzerProvider>
      <PageLayout>
        <AnalyzerContent />
      </PageLayout>
    </AnalyzerProvider>
  );
}
