import Link from 'next/link';
import { Job } from '@/lib/types';
import { TierBadge, ScoreBadge } from './tier-badge';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Building2, DollarSign, ExternalLink, Wifi } from 'lucide-react';
import { cn } from '@/lib/utils';

interface JobCardProps {
  job: Job;
  featured?: boolean;
  compact?: boolean;
}

function formatSalary(min?: number, max?: number): string | null {
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

function formatLocation(location?: string): string {
  if (!location) return 'Multiple Locations';
  // Shorten common patterns
  return location
    .replace(', United States', '')
    .replace(', California', ', CA')
    .replace(', New York', ', NY')
    .replace(', Washington', ', WA')
    .replace(', Massachusetts', ', MA')
    .replace(', Texas', ', TX');
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
  swe: "SWE",
  mle: "ML/AI",
  ds: "Data Science",
  quant: "Quant",
  pm: "PM",
  design: "Design",
  devops: "Platform",
  security: "Security",
  research: "Research",
  other: "Other",
};

export function JobCard({ job, featured, compact }: JobCardProps) {
  const salary = formatSalary(job.salaryMin, job.salaryMax);
  const level = levelLabels[job.level] || levelLabels.unknown;
  const location = formatLocation(job.location);
  
  return (
    <Link href={`/jobs/${job.id}`} className="block group">
      <Card
        className={cn(
          'relative transition-all duration-200 hover-lift cursor-pointer overflow-hidden',
          'bg-[#12121a] border-white/[0.06] hover:border-indigo-500/30',
          featured && 'border-amber-500/20 ring-1 ring-amber-500/10'
        )}
      >
        {/* Subtle gradient overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
        
        <CardContent className={cn("relative", compact ? "p-4" : "p-5")}>
          <div className="flex gap-4">
            {/* Company Logo */}
            <div className="company-logo flex-shrink-0">
              {job.company.charAt(0)}
            </div>
            
            {/* Content */}
            <div className="flex-1 min-w-0">
              {/* Title & Tier */}
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="min-w-0">
                  <h3 className="font-semibold text-[15px] text-white group-hover:text-indigo-300 transition-colors truncate">
                    {job.title}
                  </h3>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="text-sm text-white/70">{job.company}</span>
                    {job.score && (
                      <ScoreBadge score={job.score} size="sm" />
                    )}
                  </div>
                </div>
                <TierBadge tier={job.tier} size="sm" />
              </div>

              {/* Metadata Row */}
              <div className="flex flex-wrap items-center gap-2 mb-3">
                {/* Level Badge */}
                <Badge 
                  variant="outline" 
                  className={cn("text-xs border", level.color)}
                >
                  {level.label}
                </Badge>
                
                {/* Job Type */}
                <Badge variant="secondary" className="text-xs bg-white/5 text-white/60 border-0">
                  {typeLabels[job.jobType] || job.jobType}
                </Badge>
                
                {/* Remote Badge */}
                {job.remote && (
                  <Badge variant="outline" className="text-xs bg-cyan-500/10 text-cyan-400 border-cyan-500/30">
                    <Wifi className="h-3 w-3 mr-1" />
                    Remote
                  </Badge>
                )}
              </div>

              {/* Footer: Location & Salary */}
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-1 text-white/50">
                  <MapPin className="h-3.5 w-3.5" />
                  <span className="truncate max-w-[200px]">{location}</span>
                </div>
                
                {salary && (
                  <div className="flex items-center gap-1 text-emerald-400 font-medium">
                    <DollarSign className="h-3.5 w-3.5" />
                    <span>{salary}</span>
                  </div>
                )}
              </div>
            </div>
            
            {/* Arrow on hover */}
            <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
              <ExternalLink className="h-4 w-4 text-indigo-400" />
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

// Compact row variant for lists
export function JobRow({ job }: { job: Job }) {
  const salary = formatSalary(job.salaryMin, job.salaryMax);
  const level = levelLabels[job.level] || levelLabels.unknown;
  
  return (
    <Link href={`/jobs/${job.id}`} className="block group">
      <div className="flex items-center gap-4 p-3 rounded-lg hover:bg-white/[0.03] transition-colors">
        <div className="company-logo w-10 h-10 text-sm">
          {job.company.charAt(0)}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-medium text-white group-hover:text-indigo-300 truncate">
              {job.title}
            </span>
            <TierBadge tier={job.tier} size="sm" />
          </div>
          <div className="flex items-center gap-2 text-sm text-white/50">
            <span>{job.company}</span>
            <span>•</span>
            <span>{formatLocation(job.location)}</span>
          </div>
        </div>
        
        <Badge variant="outline" className={cn("text-xs border", level.color)}>
          {level.label}
        </Badge>
        
        {salary && (
          <span className="text-sm text-emerald-400 font-medium">{salary}</span>
        )}
      </div>
    </Link>
  );
}
