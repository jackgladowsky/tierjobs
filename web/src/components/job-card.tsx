import Link from 'next/link';
import { Job } from '@/lib/types';
import { TierBadge } from './tier-badge';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Clock, Briefcase, Building2, DollarSign } from 'lucide-react';
import { cn } from '@/lib/utils';

interface JobCardProps {
  job: Job;
  featured?: boolean;
}

function formatSalary(salary: Job['salary']) {
  if (!salary) return null;
  const format = (n: number) => {
    if (n >= 1000) return `${(n / 1000).toFixed(0)}k`;
    return n.toString();
  };
  return `${salary.currency === 'USD' ? '$' : '€'}${format(salary.min)} - ${format(salary.max)}`;
}

function timeAgo(date: Date) {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days} days ago`;
  if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
  return `${Math.floor(days / 30)} months ago`;
}

export function JobCard({ job, featured }: JobCardProps) {
  return (
    <Link href={`/jobs/${job.id}`}>
      <Card
        className={cn(
          'group transition-all duration-200 hover:border-primary/50 hover:shadow-lg cursor-pointer',
          featured && 'border-amber-500/30 bg-amber-500/5'
        )}
      >
        <CardContent className="p-4 sm:p-6">
          <div className="flex flex-col gap-3">
            {/* Header */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-lg text-foreground group-hover:text-primary transition-colors truncate">
                  {job.title}
                </h3>
                <div className="flex items-center gap-2 mt-1 text-muted-foreground">
                  <Building2 className="h-4 w-4 flex-shrink-0" />
                  <span className="truncate">{job.company.name}</span>
                </div>
              </div>
              <TierBadge tier={job.tier} />
            </div>

            {/* Details */}
            <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5" />
                <span>{job.location}</span>
              </div>
              <span className="text-muted-foreground/50">•</span>
              <Badge variant="outline" className="text-xs">
                {job.remote}
              </Badge>
              <span className="text-muted-foreground/50">•</span>
              <div className="flex items-center gap-1">
                <Briefcase className="h-3.5 w-3.5" />
                <span>{job.level}</span>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between pt-2 border-t border-border/50">
              <div className="flex items-center gap-3">
                <Badge variant="secondary" className="text-xs">
                  {job.type}
                </Badge>
                {job.salary && (
                  <div className="flex items-center gap-1 text-sm text-green-500">
                    <DollarSign className="h-3.5 w-3.5" />
                    <span className="font-medium">{formatSalary(job.salary)}</span>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                <span>{timeAgo(job.postedAt)}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
