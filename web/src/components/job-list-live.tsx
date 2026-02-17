'use client';

import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { JobList } from './job-list';
import { Loader2 } from 'lucide-react';

interface JobListLiveProps {
  tier?: string;
  level?: string;
  jobType?: string;
  limit?: number;
  showFilters?: boolean;
}

export function JobListLive({ 
  tier, 
  level, 
  jobType, 
  limit = 50,
  showFilters = true 
}: JobListLiveProps) {
  const jobs = useQuery(api.jobs.list, { tier, level, jobType, limit });

  if (jobs === undefined) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
      </div>
    );
  }

  // Transform Convex docs to match the Job type expected by JobList
  const transformedJobs = jobs.map(job => ({
    id: job._id,
    jobId: job.jobId,
    company: job.company,
    companySlug: job.companySlug,
    tier: job.tier as any,
    tierScore: job.tierScore,
    title: job.title,
    url: job.url,
    location: job.location,
    remote: job.remote,
    level: job.level,
    jobType: job.jobType,
    team: job.team,
    description: job.description,
    salaryMin: job.salaryMin,
    salaryMax: job.salaryMax,
    postedAt: job.postedAt,
    scrapedAt: job.scrapedAt,
    score: job.score,
  }));

  return <JobList jobs={transformedJobs} showFilters={showFilters} />;
}
