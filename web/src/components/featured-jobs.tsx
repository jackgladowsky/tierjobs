'use client';

import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { JobCard, JobRow } from './job-card';
import { Skeleton } from './ui/skeleton';
import { TierBadge } from './tier-badge';
import Link from 'next/link';
import { ArrowRight, Flame, Crown, Sparkles } from 'lucide-react';

interface FeaturedJobsProps {
  limit?: number;
  showViewAll?: boolean;
  variant?: 'cards' | 'rows' | 'spotlight';
}

export function FeaturedJobs({ limit = 5, showViewAll = true, variant = 'cards' }: FeaturedJobsProps) {
  const jobs = useQuery(api.jobs.featured, { limit });

  if (!jobs) {
    return (
      <div className="space-y-4">
        {Array.from({ length: limit }).map((_, i) => (
          <Skeleton key={i} className="h-32 w-full rounded-xl bg-white/5" />
        ))}
      </div>
    );
  }

  if (jobs.length === 0) {
    return (
      <div className="text-center py-12 text-white/50">
        No jobs found yet. Check back soon!
      </div>
    );
  }

  if (variant === 'spotlight' && jobs.length > 0) {
    const topJob = jobs[0];
    const rest = jobs.slice(1);
    
    return (
      <div className="space-y-6">
        {/* Spotlight job */}
        <div className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-amber-500/20 to-purple-500/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all opacity-75" />
          <div className="relative p-6 rounded-xl bg-[#12121a] border border-amber-500/20">
            <div className="flex items-center gap-2 mb-4">
              <Crown className="h-5 w-5 text-amber-400" />
              <span className="text-sm font-medium text-amber-400">Top Pick</span>
            </div>
            <JobCard
              job={{
                id: topJob._id,
                title: topJob.title,
                company: topJob.company,
                tier: topJob.tier as any,
                level: topJob.level,
                jobType: topJob.jobType,
                location: topJob.location,
                remote: topJob.remote,
                salaryMin: topJob.salaryMin,
                salaryMax: topJob.salaryMax,
                scrapedAt: topJob.scrapedAt,
                score: topJob.score,
              }}
              featured
            />
          </div>
        </div>
        
        {/* Rest in rows */}
        <div className="space-y-2">
          {rest.map((job) => (
            <JobRow
              key={job._id}
              job={{
                id: job._id,
                title: job.title,
                company: job.company,
                tier: job.tier as any,
                level: job.level,
                jobType: job.jobType,
                location: job.location,
                remote: job.remote,
                salaryMin: job.salaryMin,
                salaryMax: job.salaryMax,
                scrapedAt: job.scrapedAt,
                score: job.score,
              }}
            />
          ))}
        </div>
      </div>
    );
  }

  if (variant === 'rows') {
    return (
      <div className="space-y-2">
        {jobs.map((job) => (
          <JobRow
            key={job._id}
            job={{
              id: job._id,
              title: job.title,
              company: job.company,
              tier: job.tier as any,
              level: job.level,
              jobType: job.jobType,
              location: job.location,
              remote: job.remote,
              salaryMin: job.salaryMin,
              salaryMax: job.salaryMax,
              scrapedAt: job.scrapedAt,
              score: job.score,
            }}
          />
        ))}
        {showViewAll && (
          <Link
            href="/jobs"
            className="flex items-center justify-center gap-2 p-3 rounded-lg text-indigo-400 hover:bg-white/[0.03] transition-colors"
          >
            View all jobs
            <ArrowRight className="h-4 w-4" />
          </Link>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {jobs.map((job, i) => (
        <JobCard
          key={job._id}
          job={{
            id: job._id,
            title: job.title,
            company: job.company,
            tier: job.tier as any,
            level: job.level,
            jobType: job.jobType,
            location: job.location,
            remote: job.remote,
            salaryMin: job.salaryMin,
            salaryMax: job.salaryMax,
            scrapedAt: job.scrapedAt,
            score: job.score,
          }}
          featured={i === 0}
        />
      ))}
      {showViewAll && (
        <Link
          href="/jobs"
          className="flex items-center justify-center gap-2 p-4 rounded-xl border border-white/[0.06] text-indigo-400 hover:bg-white/[0.03] hover:border-indigo-500/30 transition-all"
        >
          View all jobs
          <ArrowRight className="h-4 w-4" />
        </Link>
      )}
    </div>
  );
}

// Top companies widget
export function TopCompanies({ limit = 8 }: { limit?: number }) {
  const companies = useQuery(api.jobs.topCompanies, { limit });
  
  if (!companies) {
    return (
      <div className="flex gap-3 overflow-x-auto pb-2">
        {Array.from({ length: limit }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-32 rounded-lg bg-white/5 flex-shrink-0" />
        ))}
      </div>
    );
  }
  
  return (
    <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
      {companies.map((company) => (
        <Link
          key={company.slug}
          href={`/companies/${company.slug}`}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#12121a] border border-white/[0.06] hover:border-indigo-500/30 transition-all flex-shrink-0"
        >
          <div className="w-8 h-8 rounded-md bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center text-sm font-bold text-indigo-400">
            {company.company.charAt(0)}
          </div>
          <div>
            <div className="text-sm font-medium text-white">{company.company}</div>
            <div className="text-xs text-white/40">{company.count} roles</div>
          </div>
          <TierBadge tier={company.tier as any} size="sm" />
        </Link>
      ))}
    </div>
  );
}
