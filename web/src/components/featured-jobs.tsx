'use client';

import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { JobCard } from './job-card';
import { Loader2 } from 'lucide-react';

interface FeaturedJobsProps {
  limit?: number;
}

export function FeaturedJobs({ limit = 5 }: FeaturedJobsProps) {
  const jobs = useQuery(api.jobs.list, { limit });

  if (jobs === undefined) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-amber-500" />
      </div>
    );
  }

  if (jobs.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No jobs found. Check back soon!
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      {jobs.map(job => (
        <JobCard 
          key={job._id} 
          job={{
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
          }}
          featured 
        />
      ))}
    </div>
  );
}
