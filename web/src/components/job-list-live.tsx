'use client';

import { usePaginatedQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { JobCard } from './job-card';
import { Button } from './ui/button';
import { Loader2 } from 'lucide-react';
import { Job, Tier } from '@/lib/types';

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
    { tier, level, jobType },
    { initialNumItems: pageSize }
  );

  if (status === "LoadingFirstPage") {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
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

  return (
    <div className="space-y-4">
      {/* Job count */}
      <p className="text-sm text-muted-foreground">
        Showing {jobs.length} jobs
      </p>

      {/* Job cards */}
      <div className="grid gap-4">
        {jobs.map(job => (
          <JobCard key={job.id} job={job} />
        ))}
      </div>

      {/* Load more */}
      {status === "CanLoadMore" && (
        <div className="flex justify-center pt-6">
          <Button 
            variant="outline" 
            size="lg"
            onClick={() => loadMore(pageSize)}
            className="w-full max-w-md"
          >
            Load More Jobs
          </Button>
        </div>
      )}

      {status === "LoadingMore" && (
        <div className="flex justify-center pt-6">
          <Loader2 className="h-6 w-6 animate-spin text-amber-500" />
        </div>
      )}

      {status === "Exhausted" && jobs.length > 0 && (
        <p className="text-center text-sm text-muted-foreground pt-6">
          You've seen all {jobs.length} jobs
        </p>
      )}
    </div>
  );
}
