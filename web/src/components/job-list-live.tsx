'use client';

import { usePaginatedQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { JobCard } from './job-card';
import { Button } from './ui/button';
import { Skeleton } from './ui/skeleton';
import { Loader2, Search, Briefcase } from 'lucide-react';
import { Job, Tier, JobLevel, JobType } from '@/lib/types';

interface JobListLiveProps {
  tier?: string;
  level?: string;
  jobType?: string;
  pageSize?: number;
}

export function JobListLive({ 
  tier, 
  level, 
  jobType, 
  pageSize = 25,
}: JobListLiveProps) {
  const { results, status, loadMore } = usePaginatedQuery(
    api.jobs.listPaginated,
    { 
      tier: tier || undefined, 
      level: level as JobLevel | undefined, 
      jobType: jobType as JobType | undefined
    },
    { initialNumItems: pageSize }
  );

  if (status === "LoadingFirstPage") {
    return (
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-32 w-full rounded-xl bg-white/5" />
        ))}
      </div>
    );
  }

  // Transform Convex docs to match the Job type
  const jobs: Job[] = results.map(job => ({
    id: job._id,
    jobId: job.jobId,
    company: job.company,
    companySlug: job.companySlug,
    tier: job.tier as Tier,
    tierScore: job.tierScore,
    title: job.title,
    url: job.url,
    location: job.location,
    remote: job.remote,
    level: job.level as any,
    jobType: job.jobType as any,
    team: job.team,
    description: job.description,
    salaryMin: job.salaryMin,
    salaryMax: job.salaryMax,
    postedAt: job.postedAt,
    scrapedAt: job.scrapedAt,
    score: job.score,
  }));

  if (jobs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="p-4 rounded-full bg-white/5 mb-4">
          <Search className="h-8 w-8 text-white/30" />
        </div>
        <h3 className="text-lg font-medium text-white mb-2">No jobs found</h3>
        <p className="text-white/50 max-w-sm">
          Try adjusting your filters or check back later for new opportunities.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Results header */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-white/50">
          Showing <span className="text-white font-medium">{jobs.length}</span> jobs
          {tier && <span className="text-indigo-400"> in {tier}</span>}
        </p>
        <div className="flex items-center gap-2 text-sm text-white/40">
          <Briefcase className="h-4 w-4" />
          <span>Sorted by tier</span>
        </div>
      </div>

      {/* Job cards */}
      <div className="grid gap-3">
        {jobs.map((job, i) => (
          <JobCard key={job.id} job={job} featured={i < 3} />
        ))}
      </div>

      {/* Load more */}
      {status === "CanLoadMore" && (
        <div className="flex justify-center pt-6">
          <Button 
            onClick={() => loadMore(pageSize)}
            className="w-full max-w-md bg-white/5 text-white hover:bg-white/10 border border-white/[0.06]"
          >
            Load More Jobs
          </Button>
        </div>
      )}

      {status === "LoadingMore" && (
        <div className="flex items-center justify-center gap-2 py-6 text-white/50">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>Loading more...</span>
        </div>
      )}

      {status === "Exhausted" && jobs.length > 0 && (
        <p className="text-center text-sm text-white/40 pt-6">
          You've seen all {jobs.length} jobs matching your filters
        </p>
      )}
    </div>
  );
}
