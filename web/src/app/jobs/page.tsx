import { Suspense } from 'react';
import { JobsPageClient } from '@/components/jobs-page-client';
import { Briefcase, Loader2 } from 'lucide-react';

export const metadata = {
  title: 'Jobs - TierJobs',
  description: 'Browse open positions at top-tier tech companies.',
};

function JobsLoading() {
  return (
    <div className="flex flex-col items-center justify-center py-20">
      <div className="relative">
        <div className="absolute inset-0 bg-indigo-500/20 blur-xl rounded-full" />
        <Loader2 className="relative h-10 w-10 animate-spin text-indigo-400" />
      </div>
      <p className="mt-4 text-white/50">Loading jobs...</p>
    </div>
  );
}

export default function JobsPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2.5 rounded-xl bg-indigo-500/10">
              <Briefcase className="h-6 w-6 text-indigo-400" />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-white">
              Browse Jobs
            </h1>
          </div>
          <p className="text-white/50">
            Find your next role at elite tech companies
          </p>
        </div>

        {/* Jobs content */}
        <Suspense fallback={<JobsLoading />}>
          <JobsPageClient />
        </Suspense>
      </div>
    </div>
  );
}
