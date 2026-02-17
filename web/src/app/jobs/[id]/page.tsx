"use client";

import Link from 'next/link';
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import { TierBadge, ScoreBadge } from '@/components/tier-badge';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tier } from '@/lib/types';
import { 
  MapPin, 
  Clock, 
  Briefcase, 
  Building2, 
  DollarSign, 
  ExternalLink,
  ArrowLeft,
  Globe,
  Wifi,
  Users,
  ChevronRight
} from 'lucide-react';
import { use } from 'react';
import { cn } from '@/lib/utils';

interface PageProps {
  params: Promise<{ id: string }>;
}

function formatSalary(min?: number, max?: number) {
  if (!min && !max) return null;
  const format = (n: number) => {
    if (n >= 1000) return `$${Math.round(n / 1000)}k`;
    return `$${n}`;
  };
  if (min && max) return `${format(min)} – ${format(max)}`;
  if (min) return `${format(min)}+`;
  if (max) return `Up to ${format(max)}`;
  return null;
}

function timeAgo(timestamp?: number) {
  if (!timestamp) return 'Recently';
  const now = Date.now();
  const diff = now - timestamp;
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days} days ago`;
  if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
  return `${Math.floor(days / 30)} months ago`;
}

const levelLabels: Record<string, { label: string; color: string }> = {
  intern: { label: "Intern", color: "bg-amber-500/20 text-amber-400 border-amber-500/30" },
  new_grad: { label: "New Grad", color: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" },
  junior: { label: "Junior", color: "bg-blue-500/20 text-blue-400 border-blue-500/30" },
  mid: { label: "Mid", color: "bg-violet-500/20 text-violet-400 border-violet-500/30" },
  senior: { label: "Senior", color: "bg-indigo-500/20 text-indigo-400 border-indigo-500/30" },
  staff: { label: "Staff", color: "bg-purple-500/20 text-purple-400 border-purple-500/30" },
  principal: { label: "Principal", color: "bg-pink-500/20 text-pink-400 border-pink-500/30" },
  director: { label: "Director", color: "bg-rose-500/20 text-rose-400 border-rose-500/30" },
  vp: { label: "VP", color: "bg-red-500/20 text-red-400 border-red-500/30" },
  exec: { label: "Executive", color: "bg-red-500/20 text-red-400 border-red-500/30" },
  unknown: { label: "Open", color: "bg-gray-500/20 text-gray-400 border-gray-500/30" },
};

const typeLabels: Record<string, string> = {
  swe: "Software Engineering",
  mle: "Machine Learning",
  ds: "Data Science",
  quant: "Quantitative",
  pm: "Product Management",
  design: "Design",
  devops: "DevOps/Platform",
  security: "Security",
  research: "Research",
  other: "Other",
};

export default function JobDetailPage({ params }: PageProps) {
  const { id } = use(params);
  
  const job = useQuery(api.jobs.getById, { id: id as Id<"jobs"> });
  const company = useQuery(api.companies.get, job ? { slug: job.companySlug } : "skip");
  const relatedJobs = useQuery(api.jobs.byCompany, job ? { companySlug: job.companySlug } : "skip");

  if (job === undefined) {
    return (
      <div className="min-h-screen bg-[#0a0a0f]">
        <div className="container mx-auto px-4 py-8">
          <Skeleton className="h-6 w-32 bg-white/5 mb-6" />
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <Skeleton className="h-48 bg-white/5 rounded-xl" />
              <Skeleton className="h-64 bg-white/5 rounded-xl" />
            </div>
            <div className="space-y-6">
              <Skeleton className="h-40 bg-white/5 rounded-xl" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (job === null) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold text-white mb-4">Job Not Found</h1>
          <p className="text-white/50 mb-6">This job listing may have been removed or doesn't exist.</p>
          <Link href="/jobs">
            <Button className="bg-indigo-500 hover:bg-indigo-600">Browse All Jobs</Button>
          </Link>
        </div>
      </div>
    );
  }

  const filteredRelatedJobs = relatedJobs?.filter(j => j._id !== job._id).slice(0, 4) ?? [];
  const salaryDisplay = formatSalary(job.salaryMin, job.salaryMax);
  const level = levelLabels[job.level] || levelLabels.unknown;

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      <div className="container mx-auto px-4 py-8">
        {/* Back link */}
        <Link 
          href="/jobs" 
          className="inline-flex items-center gap-2 text-white/50 hover:text-white transition-colors mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to jobs
        </Link>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Header Card */}
            <div className="p-6 rounded-xl bg-[#12121a] border border-white/[0.06]">
              <div className="flex flex-wrap items-center gap-2 mb-4">
                <TierBadge tier={job.tier as Tier} size="lg" />
                <Badge variant="outline" className={cn("border", level.color)}>
                  {level.label}
                </Badge>
                <Badge variant="secondary" className="bg-white/5 text-white/60 border-0">
                  {typeLabels[job.jobType] || job.jobType}
                </Badge>
                {job.remote && (
                  <Badge variant="outline" className="bg-cyan-500/10 text-cyan-400 border-cyan-500/30">
                    <Wifi className="h-3 w-3 mr-1" />
                    Remote
                  </Badge>
                )}
              </div>
              
              <h1 className="text-2xl md:text-3xl font-bold text-white mb-4">
                {job.title}
              </h1>

              {/* Company info */}
              <Link 
                href={`/companies/${job.companySlug}`}
                className="flex items-center gap-3 group mb-6"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center text-lg font-bold text-indigo-400 border border-white/[0.06]">
                  {job.company.charAt(0)}
                </div>
                <div>
                  <div className="font-semibold text-white group-hover:text-indigo-300 transition-colors">
                    {job.company}
                  </div>
                  <div className="text-sm text-white/40">
                    {company?.domain || job.companySlug}
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-white/30 ml-auto" />
              </Link>

              {/* Meta */}
              <div className="flex flex-wrap gap-4 text-sm text-white/50 mb-4">
                {job.location && (
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    <span>{job.location}</span>
                  </div>
                )}
                {job.team && (
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    <span>{job.team}</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span>Posted {timeAgo(job.postedAt)}</span>
                </div>
              </div>

              {salaryDisplay && (
                <div className="flex items-center gap-2 pt-4 border-t border-white/[0.06]">
                  <DollarSign className="h-5 w-5 text-emerald-400" />
                  <span className="text-xl font-bold text-emerald-400">
                    {salaryDisplay}
                  </span>
                  <span className="text-sm text-white/40">/ year</span>
                </div>
              )}
            </div>

            {/* Description */}
            <div className="p-6 rounded-xl bg-[#12121a] border border-white/[0.06]">
              <h2 className="text-lg font-semibold text-white mb-4">About this role</h2>
              {job.description ? (
                <div className="text-white/70 leading-relaxed whitespace-pre-wrap">
                  {job.description}
                </div>
              ) : (
                <p className="text-white/50 italic">
                  No description available. Click "Apply Now" to see the full job details on the company's career page.
                </p>
              )}
            </div>

            {/* Job Details Grid */}
            <div className="p-6 rounded-xl bg-[#12121a] border border-white/[0.06]">
              <h2 className="text-lg font-semibold text-white mb-4">Job Details</h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div>
                  <div className="text-sm text-white/40 mb-1">Level</div>
                  <div className="font-medium text-white">{level.label}</div>
                </div>
                <div>
                  <div className="text-sm text-white/40 mb-1">Type</div>
                  <div className="font-medium text-white">{typeLabels[job.jobType] || job.jobType}</div>
                </div>
                <div>
                  <div className="text-sm text-white/40 mb-1">Location</div>
                  <div className="font-medium text-white">{job.location || 'Not specified'}</div>
                </div>
                <div>
                  <div className="text-sm text-white/40 mb-1">Remote</div>
                  <div className="font-medium text-white">{job.remote ? 'Yes' : 'On-site'}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Apply card */}
            <div className="sticky top-24 p-6 rounded-xl bg-[#12121a] border border-white/[0.06] space-y-4">
              <a href={job.url} target="_blank" rel="noopener noreferrer">
                <Button className="w-full h-12 bg-gradient-to-r from-indigo-500 to-violet-500 hover:from-indigo-600 hover:to-violet-600 text-white gap-2 text-base">
                  Apply Now
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </a>
              <p className="text-xs text-center text-white/40">
                You'll be redirected to {job.company}'s application page
              </p>
              
              {/* Company mini-card */}
              <div className="pt-4 mt-4 border-t border-white/[0.06]">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-white/50">Company</span>
                  <TierBadge tier={job.tier as Tier} size="sm" />
                </div>
                {company && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-white/50">Open Positions</span>
                    <span className="font-medium text-white">{company.jobCount}</span>
                  </div>
                )}
                <Link href={`/companies/${job.companySlug}`} className="block mt-4">
                  <Button variant="outline" className="w-full border-white/[0.06] bg-white/5 hover:bg-white/10 text-white gap-2">
                    <Building2 className="h-4 w-4" />
                    View Company
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Related jobs */}
        {filteredRelatedJobs.length > 0 && (
          <div className="mt-12">
            <h2 className="text-xl font-bold text-white mb-6">More jobs at {job.company}</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {filteredRelatedJobs.map(j => (
                <Link key={j._id} href={`/jobs/${j._id}`}>
                  <div className="p-4 rounded-xl bg-[#12121a] border border-white/[0.06] hover:border-indigo-500/30 transition-all group">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="font-medium text-white group-hover:text-indigo-300 truncate">
                          {j.title}
                        </div>
                        <div className="text-sm text-white/50 mt-1">
                          {j.location || 'Multiple Locations'} • {levelLabels[j.level]?.label || j.level}
                        </div>
                      </div>
                      <TierBadge tier={j.tier as Tier} size="sm" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
