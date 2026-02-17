import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getCompanyBySlug, getJobsByCompany } from '@/lib/mock-data';
import { TierBadge } from '@/components/tier-badge';
import { JobCard } from '@/components/job-card';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  MapPin, 
  Globe, 
  Briefcase,
  ArrowLeft,
  ExternalLink,
  Building2
} from 'lucide-react';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const company = getCompanyBySlug(slug);
  if (!company) return { title: 'Company Not Found - TierJobs' };
  return {
    title: `${company.name} Jobs - TierJobs`,
    description: company.description || `Browse open positions at ${company.name}`,
  };
}

export default async function CompanyDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const company = getCompanyBySlug(slug);

  if (!company) {
    notFound();
  }

  const jobs = getJobsByCompany(slug);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Back link */}
      <Link 
        href="/companies" 
        className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to companies
      </Link>

      {/* Company header */}
      <Card className="mb-8">
        <CardContent className="p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row gap-6">
            {/* Logo */}
            <div className="w-20 h-20 rounded-xl bg-muted flex items-center justify-center text-3xl font-bold text-muted-foreground flex-shrink-0">
              {company.name.charAt(0)}
            </div>

            {/* Info */}
            <div className="flex-1">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-2xl sm:text-3xl font-bold">{company.name}</h1>
                    <TierBadge tier={company.tier} size="lg" />
                  </div>
                  <div className="flex flex-wrap items-center gap-4 text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="h-4 w-4" />
                      <span>{company.location}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Briefcase className="h-4 w-4" />
                      <span>{jobs.length} open {jobs.length === 1 ? 'position' : 'positions'}</span>
                    </div>
                  </div>
                </div>
                {company.website && (
                  <a 
                    href={company.website}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button variant="outline" className="gap-2">
                      <Globe className="h-4 w-4" />
                      Website
                      <ExternalLink className="h-3 w-3" />
                    </Button>
                  </a>
                )}
              </div>

              {company.description && (
                <p className="text-muted-foreground leading-relaxed max-w-2xl">
                  {company.description}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Jobs */}
      <div>
        <h2 className="text-xl font-bold mb-6 flex items-center gap-3">
          <Building2 className="h-6 w-6 text-amber-500" />
          Open Positions at {company.name}
        </h2>
        
        {jobs.length > 0 ? (
          <div className="grid gap-4">
            {jobs.map(job => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground">
                No open positions at {company.name} right now. Check back soon!
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
