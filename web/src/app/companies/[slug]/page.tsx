"use client";

import Link from 'next/link';
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { TierBadge } from '@/components/tier-badge';
import { JobCard } from '@/components/job-card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Tier } from '@/lib/types';
import { 
  Globe, 
  Briefcase,
  ArrowLeft,
  ExternalLink,
  Building2,
  MapPin,
  Users
} from 'lucide-react';
import { use } from 'react';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default function CompanyDetailPage({ params }: PageProps) {
  const { slug } = use(params);
  
  const company = useQuery(api.companies.get, { slug });
  const jobs = useQuery(api.jobs.byCompany, { companySlug: slug });

  if (company === undefined) {
    return (
      <div className="min-h-screen bg-[#0a0a0f]">
        <div className="container mx-auto px-4 py-8">
          <Skeleton className="h-6 w-32 bg-white/5 mb-6" />
          <Skeleton className="h-48 bg-white/5 rounded-xl mb-8" />
          <Skeleton className="h-8 w-48 bg-white/5 mb-4" />
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <Skeleton key={i} className="h-32 bg-white/5 rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (company === null) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold text-white mb-4">Company Not Found</h1>
          <p className="text-white/50 mb-6">This company doesn't exist in our database.</p>
          <Link href="/companies">
            <Button className="bg-indigo-500 hover:bg-indigo-600">Browse All Companies</Button>
          </Link>
        </div>
      </div>
    );
  }

  const initials = company.name
    .split(' ')
    .map(w => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  // Group jobs by level
  const jobsByLevel: Record<string, typeof jobs> = {};
  if (jobs) {
    for (const job of jobs) {
      if (!jobsByLevel[job.level]) {
        jobsByLevel[job.level] = [];
      }
      jobsByLevel[job.level]!.push(job);
    }
  }

  const levelOrder = ['intern', 'new_grad', 'junior', 'mid', 'senior', 'staff', 'principal', 'director', 'vp', 'exec', 'unknown'];

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      <div className="container mx-auto px-4 py-8">
        {/* Back link */}
        <Link 
          href="/companies" 
          className="inline-flex items-center gap-2 text-white/50 hover:text-white transition-colors mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to companies
        </Link>

        {/* Company header */}
        <div className="p-6 sm:p-8 rounded-xl bg-[#12121a] border border-white/[0.06] mb-8">
          <div className="flex flex-col sm:flex-row gap-6">
            {/* Logo */}
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center text-2xl font-bold text-indigo-400 border border-white/[0.06] flex-shrink-0">
              {initials}
            </div>

            {/* Info */}
            <div className="flex-1">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-2xl sm:text-3xl font-bold text-white">{company.name}</h1>
                    <TierBadge tier={company.tier as Tier} size="lg" />
                  </div>
                  <div className="flex flex-wrap items-center gap-4 text-white/50">
                    <div className="flex items-center gap-1.5">
                      <Globe className="h-4 w-4" />
                      <span>{company.domain}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Briefcase className="h-4 w-4" />
                      <span>{jobs?.length || 0} open {(jobs?.length || 0) === 1 ? 'position' : 'positions'}</span>
                    </div>
                  </div>
                </div>
                {company.careersUrl && (
                  <a 
                    href={company.careersUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button className="bg-white/5 hover:bg-white/10 text-white border border-white/[0.06] gap-2">
                      <ExternalLink className="h-4 w-4" />
                      Careers Page
                    </Button>
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Jobs */}
        <div>
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
            <Building2 className="h-6 w-6 text-indigo-400" />
            Open Positions
          </h2>
          
          {jobs && jobs.length > 0 ? (
            <div className="space-y-8">
              {levelOrder.map(level => {
                const levelJobs = jobsByLevel[level];
                if (!levelJobs || levelJobs.length === 0) return null;
                
                const levelLabels: Record<string, string> = {
                  intern: "🎓 Internships",
                  new_grad: "🚀 New Grad",
                  junior: "Junior",
                  mid: "Mid-Level",
                  senior: "Senior",
                  staff: "Staff",
                  principal: "Principal",
                  director: "Director",
                  vp: "VP",
                  exec: "Executive",
                  unknown: "Other",
                };
                
                return (
                  <div key={level}>
                    <h3 className="text-lg font-medium text-white/70 mb-3 flex items-center gap-2">
                      {levelLabels[level] || level}
                      <span className="text-sm text-white/40">({levelJobs.length})</span>
                    </h3>
                    <div className="grid gap-3">
                      {levelJobs.map(job => (
                        <JobCard 
                          key={job._id} 
                          job={{
                            id: job._id,
                            jobId: job.jobId,
                            title: job.title,
                            company: job.company,
                            companySlug: job.companySlug,
                            tier: job.tier as Tier,
                            tierScore: job.tierScore,
                            level: job.level as any,
                            jobType: job.jobType as any,
                            location: job.location,
                            remote: job.remote,
                            url: job.url,
                            salaryMin: job.salaryMin,
                            salaryMax: job.salaryMax,
                            scrapedAt: job.scrapedAt,
                            score: job.score,
                          }}
                          compact
                        />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-8 rounded-xl bg-[#12121a] border border-white/[0.06] text-center">
              <p className="text-white/50">
                No open positions at {company.name} right now. Check back soon!
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
