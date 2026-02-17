import { JobList } from '@/components/job-list';
import { jobs } from '@/lib/mock-data';
import { Briefcase } from 'lucide-react';

export const metadata = {
  title: 'Jobs - TierJobs',
  description: 'Browse open positions at top-tier tech companies.',
};

export default function JobsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
          <Briefcase className="h-8 w-8 text-amber-500" />
          All Jobs
        </h1>
        <p className="text-muted-foreground">
          Browse {jobs.length} open positions at top-tier companies
        </p>
      </div>
      <JobList jobs={jobs} />
    </div>
  );
}
