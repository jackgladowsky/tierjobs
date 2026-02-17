import { Suspense } from 'react';
import { JobsPageClient } from '@/components/jobs-page-client';
import { Briefcase, Loader2 } from 'lucide-react';

export const metadata = {
  title: 'Jobs - TierJobs',
  description: 'Browse open positions at top-tier tech companies.',
};

function JobsLoading() {
  return (
    <div className="flex items-center justify-center py-12">
      <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
    </div>
  );
}

export default function JobsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
          <Briefcase className="h-8 w-8 text-amber-500" />
          All Jobs
        </h1>
        <p className="text-muted-foreground">
          Browse open positions at top-tier companies
        </p>
      </div>
      <Suspense fallback={<JobsLoading />}>
        <JobsPageClient />
      </Suspense>
    </div>
  );
}
