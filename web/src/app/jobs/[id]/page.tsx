"use client";

import Link from 'next/link';
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import { TierBadge } from '@/components/tier-badge';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tier, JobLevel, JobType } from '@/lib/types';
import { 
  MapPin, 
  Clock, 
  Briefcase, 
  Building2, 
  DollarSign, 
  ExternalLink,
  ArrowLeft,
  Globe,
  Loader2,
  Users
} from 'lucide-react';
import { use } from 'react';

interface PageProps {
  params: Promise<{ id: string }>;
}

function formatSalary(min?: number, max?: number) {
  if (!min && !max) return null;
  const format = (n: number) => {
    if (n >= 1000) return `$${(n / 1000).toFixed(0)}k`;
    return `$${n}`;
  };
  if (min && max) return `${format(min)} - ${format(max)}`;
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

function formatLevel(level: string): string {
  const labels: Record<string, string> = {
    intern: 'Intern',
    new_grad: 'New Grad',
    junior: 'Junior',
    mid: 'Mid-Level',
    senior: 'Senior',
    staff: 'Staff',
    principal: 'Principal',
    director: 'Director',
    vp: 'VP',
    exec: 'Executive',
    unknown: 'Unknown',
  };
  return labels[level] || level;
}

function formatJobType(type: string): string {
  const labels: Record<string, string> = {
    swe: 'Software Engineering',
    mle: 'Machine Learning',
    ds: 'Data Science',
    quant: 'Quantitative',
    pm: 'Product Management',
    design: 'Design',
    devops: 'DevOps',
    security: 'Security',
    research: 'Research',
    other: 'Other',
  };
  return labels[type] || type;
}

export default function JobDetailPage({ params }: PageProps) {
  const { id } = use(params);
  
  // Try to get job by Convex ID
  const job = useQuery(api.jobs.getById, { id: id as Id<"jobs"> });
  const company = useQuery(api.companies.get, job ? { slug: job.companySlug } : "skip");
  const relatedJobs = useQuery(api.jobs.byCompany, job ? { companySlug: job.companySlug } : "skip");

  if (job === undefined) {
    return (
      <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (job === null) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold mb-4">Job Not Found</h1>
          <p className="text-muted-foreground mb-6">This job listing may have been removed or doesn't exist.</p>
          <Link href="/jobs">
            <Button>Browse All Jobs</Button>
          </Link>
        </div>
      </div>
    );
  }

  const filteredRelatedJobs = relatedJobs?.filter(j => j._id !== job._id).slice(0, 3) ?? [];
  const salaryDisplay = formatSalary(job.salaryMin, job.salaryMax);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Back link */}
      <Link 
        href="/jobs" 
        className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to jobs
      </Link>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Header */}
          <div className="space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <TierBadge tier={job.tier as Tier} size="lg" />
                  <Badge variant="outline">{formatLevel(job.level)}</Badge>
                  <Badge variant="secondary">{formatJobType(job.jobType)}</Badge>
                </div>
                <h1 className="text-3xl font-bold">{job.title}</h1>
              </div>
            </div>

            {/* Company info */}
            <Link 
              href={`/companies/${job.companySlug}`}
              className="flex items-center gap-3 group"
            >
              <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center text-xl font-bold text-muted-foreground">
                {job.company.charAt(0)}
              </div>
              <div>
                <div className="font-semibold group-hover:text-primary transition-colors">
                  {job.company}
                </div>
                <div className="text-sm text-muted-foreground">
                  {company?.domain || job.companySlug}
                </div>
              </div>
            </Link>

            {/* Meta */}
            <div className="flex flex-wrap gap-4 text-sm">
              {job.location && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <span>{job.location}</span>
                </div>
              )}
              <div className="flex items-center gap-2 text-muted-foreground">
                <Globe className="h-4 w-4" />
                <Badge variant="outline">{job.remote ? 'Remote' : 'On-site'}</Badge>
              </div>
              {job.team && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Users className="h-4 w-4" />
                  <span>{job.team}</span>
                </div>
              )}
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>Posted {timeAgo(job.postedAt)}</span>
              </div>
            </div>

            {salaryDisplay && (
              <div className="flex items-center gap-2 text-lg">
                <DollarSign className="h-5 w-5 text-green-500" />
                <span className="font-semibold text-green-500">
                  {salaryDisplay}
                </span>
                <span className="text-sm text-muted-foreground">/ year</span>
              </div>
            )}
          </div>

          {/* Description */}
          <Card>
            <CardHeader>
              <CardTitle>About this role</CardTitle>
            </CardHeader>
            <CardContent>
              {job.description ? (
                <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                  {job.description}
                </p>
              ) : (
                <p className="text-muted-foreground italic">
                  No description available. Click "Apply Now" to see the full job details on the company's career page.
                </p>
              )}
            </CardContent>
          </Card>

          {/* Job Details */}
          <Card>
            <CardHeader>
              <CardTitle>Job Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-muted-foreground">Level</div>
                  <div className="font-medium">{formatLevel(job.level)}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Type</div>
                  <div className="font-medium">{formatJobType(job.jobType)}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Location</div>
                  <div className="font-medium">{job.location || 'Not specified'}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Remote</div>
                  <div className="font-medium">{job.remote ? 'Yes' : 'No'}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Apply card */}
          <Card className="sticky top-24">
            <CardContent className="p-6 space-y-4">
              <a href={job.url} target="_blank" rel="noopener noreferrer">
                <Button className="w-full bg-gradient-to-r from-amber-500 to-yellow-400 text-black hover:from-amber-600 hover:to-yellow-500 gap-2">
                  Apply Now
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </a>
              <p className="text-xs text-center text-muted-foreground">
                You'll be redirected to {job.company}'s application page
              </p>
            </CardContent>
          </Card>

          {/* Company card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                About {job.company}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Tier</span>
                <TierBadge tier={job.tier as Tier} />
              </div>
              {company && (
                <>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Open Positions</span>
                    <span className="font-medium">{company.jobCount}</span>
                  </div>
                </>
              )}
              <Link href={`/companies/${job.companySlug}`}>
                <Button variant="outline" className="w-full gap-2">
                  View Company
                  <ArrowLeft className="h-4 w-4 rotate-180" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Related jobs */}
      {filteredRelatedJobs.length > 0 && (
        <div className="mt-12">
          <h2 className="text-xl font-bold mb-4">More jobs at {job.company}</h2>
          <div className="grid gap-4">
            {filteredRelatedJobs.map(j => (
              <Link key={j._id} href={`/jobs/${j._id}`}>
                <Card className="hover:border-primary/50 transition-colors cursor-pointer">
                  <CardContent className="p-4 flex items-center justify-between">
                    <div>
                      <div className="font-medium">{j.title}</div>
                      <div className="text-sm text-muted-foreground">
                        {j.location} • {formatLevel(j.level)}
                      </div>
                    </div>
                    <TierBadge tier={j.tier as Tier} size="sm" />
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
