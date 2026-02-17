import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getJobById, getJobsByCompany } from '@/lib/mock-data';
import { TierBadge } from '@/components/tier-badge';
import { JobCard } from '@/components/job-card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  MapPin, 
  Clock, 
  Briefcase, 
  Building2, 
  DollarSign, 
  ExternalLink,
  ArrowLeft,
  CheckCircle2,
  Globe
} from 'lucide-react';

interface PageProps {
  params: Promise<{ id: string }>;
}

function formatSalary(salary: { min: number; max: number; currency: string }) {
  const format = (n: number) => {
    if (n >= 1000) return `$${(n / 1000).toFixed(0)}k`;
    return `$${n}`;
  };
  return `${format(salary.min)} - ${format(salary.max)} ${salary.currency}`;
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

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;
  const job = getJobById(id);
  if (!job) return { title: 'Job Not Found - TierJobs' };
  return {
    title: `${job.title} at ${job.company.name} - TierJobs`,
    description: job.description,
  };
}

export default async function JobDetailPage({ params }: PageProps) {
  const { id } = await params;
  const job = getJobById(id);

  if (!job) {
    notFound();
  }

  const relatedJobs = getJobsByCompany(job.company.slug)
    .filter(j => j.id !== job.id)
    .slice(0, 3);

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
                  <TierBadge tier={job.tier} size="lg" />
                  {job.featured && (
                    <Badge className="bg-amber-500/20 text-amber-500 border-amber-500/30">
                      Featured
                    </Badge>
                  )}
                </div>
                <h1 className="text-3xl font-bold">{job.title}</h1>
              </div>
            </div>

            {/* Company info */}
            <Link 
              href={`/companies/${job.company.slug}`}
              className="flex items-center gap-3 group"
            >
              <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center text-xl font-bold text-muted-foreground">
                {job.company.name.charAt(0)}
              </div>
              <div>
                <div className="font-semibold group-hover:text-primary transition-colors">
                  {job.company.name}
                </div>
                <div className="text-sm text-muted-foreground flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" />
                  {job.company.location}
                </div>
              </div>
            </Link>

            {/* Meta */}
            <div className="flex flex-wrap gap-4 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span>{job.location}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Globe className="h-4 w-4" />
                <Badge variant="outline">{job.remote}</Badge>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Briefcase className="h-4 w-4" />
                <span>{job.level} • {job.type}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>Posted {timeAgo(job.postedAt)}</span>
              </div>
            </div>

            {job.salary && (
              <div className="flex items-center gap-2 text-lg">
                <DollarSign className="h-5 w-5 text-green-500" />
                <span className="font-semibold text-green-500">
                  {formatSalary(job.salary)}
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
              <p className="text-muted-foreground leading-relaxed">
                {job.description}
              </p>
            </CardContent>
          </Card>

          {/* Requirements */}
          <Card>
            <CardHeader>
              <CardTitle>Requirements</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {job.requirements.map((req, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-muted-foreground">{req}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Apply card */}
          <Card className="sticky top-24">
            <CardContent className="p-6 space-y-4">
              <Button className="w-full bg-gradient-to-r from-amber-500 to-yellow-400 text-black hover:from-amber-600 hover:to-yellow-500 gap-2">
                Apply Now
                <ExternalLink className="h-4 w-4" />
              </Button>
              <Button variant="outline" className="w-full">
                Save Job
              </Button>
              <p className="text-xs text-center text-muted-foreground">
                You'll be redirected to the company's application page
              </p>
            </CardContent>
          </Card>

          {/* Company card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                About {job.company.name}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Tier</span>
                <TierBadge tier={job.company.tier} />
              </div>
              {job.company.description && (
                <p className="text-sm text-muted-foreground">
                  {job.company.description}
                </p>
              )}
              <Link href={`/companies/${job.company.slug}`}>
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
      {relatedJobs.length > 0 && (
        <div className="mt-12">
          <h2 className="text-xl font-bold mb-4">More jobs at {job.company.name}</h2>
          <div className="grid gap-4">
            {relatedJobs.map(j => (
              <JobCard key={j.id} job={j} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
