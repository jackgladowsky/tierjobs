import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { JobCard } from '@/components/job-card';
import { TierBadge } from '@/components/tier-badge';
import { getFeaturedJobs, companies } from '@/lib/mock-data';
import { Tier } from '@/lib/types';
import { ArrowRight, Sparkles, TrendingUp, Users, Zap } from 'lucide-react';

const tierDescriptions: Record<Tier, string> = {
  'S+': 'Elite tier - FAANG & equivalent. Top compensation, prestige, and growth.',
  'S': 'Premium tier - Unicorns and top public tech. Excellent comp and culture.',
  'A++': 'High growth - Late-stage startups on path to IPO. Strong equity.',
  'A+': 'Strong tier - Well-funded companies with solid engineering.',
  'A': 'Solid tier - Good companies with competitive offers.',
  'B': 'Standard tier - Stable companies with reasonable compensation.',
};

export default function HomePage() {
  const featuredJobs = getFeaturedJobs();
  const tierCounts = companies.reduce((acc, c) => {
    acc[c.tier] = (acc[c.tier] || 0) + 1;
    return acc;
  }, {} as Record<Tier, number>);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden border-b">
        <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 via-transparent to-purple-500/10" />
        <div className="container mx-auto px-4 py-20 md:py-32 relative">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500 text-sm mb-6">
              <Sparkles className="h-4 w-4" />
              <span>Jobs at top-tier companies</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
              Find your next role at{' '}
              <span className="bg-gradient-to-r from-amber-500 to-yellow-400 bg-clip-text text-transparent">
                elite tech companies
              </span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Browse jobs ranked by company tier. From S+ giants like Google and Apple to rising A-tier startups. Know your worth.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/jobs">
                <Button size="lg" className="bg-gradient-to-r from-amber-500 to-yellow-400 text-black hover:from-amber-600 hover:to-yellow-500 gap-2">
                  Browse Jobs
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/companies">
                <Button size="lg" variant="outline" className="gap-2">
                  View Companies
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-b">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-amber-500">500+</div>
              <div className="text-sm text-muted-foreground">Open Positions</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-amber-500">50+</div>
              <div className="text-sm text-muted-foreground">Companies</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-amber-500">$200k+</div>
              <div className="text-sm text-muted-foreground">Avg. Salary</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-amber-500">10k+</div>
              <div className="text-sm text-muted-foreground">Placements</div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Jobs */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
                <Zap className="h-6 w-6 text-amber-500" />
                Featured Jobs
              </h2>
              <p className="text-muted-foreground">Hand-picked opportunities at top companies</p>
            </div>
            <Link href="/jobs">
              <Button variant="ghost" className="gap-2">
                View all
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
          <div className="grid gap-4">
            {featuredJobs.map(job => (
              <JobCard key={job.id} job={job} featured />
            ))}
          </div>
        </div>
      </section>

      {/* Tier Breakdown */}
      <section className="py-16 bg-muted/30 border-y">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-bold mb-2 flex items-center gap-2 justify-center">
              <TrendingUp className="h-6 w-6 text-amber-500" />
              Company Tiers
            </h2>
            <p className="text-muted-foreground">How we rank companies by prestige and compensation</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl mx-auto">
            {(['S+', 'S', 'A++', 'A+', 'A', 'B'] as Tier[]).map(tier => (
              <Card key={tier} className="hover:border-primary/50 transition-colors">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between mb-3">
                    <TierBadge tier={tier} size="lg" />
                    <span className="text-sm text-muted-foreground">
                      {tierCounts[tier] || 0} companies
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {tierDescriptions[tier]}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Why TierJobs */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-bold mb-2 flex items-center gap-2 justify-center">
              <Users className="h-6 w-6 text-amber-500" />
              Why TierJobs?
            </h2>
            <p className="text-muted-foreground">We help you make informed career decisions</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            <Card>
              <CardContent className="p-6">
                <div className="w-12 h-12 rounded-lg bg-amber-500/10 flex items-center justify-center mb-4">
                  <TrendingUp className="h-6 w-6 text-amber-500" />
                </div>
                <h3 className="font-semibold mb-2">Transparent Rankings</h3>
                <p className="text-sm text-muted-foreground">
                  Every company is ranked by prestige, compensation, and growth potential so you know what you're getting into.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="w-12 h-12 rounded-lg bg-amber-500/10 flex items-center justify-center mb-4">
                  <Sparkles className="h-6 w-6 text-amber-500" />
                </div>
                <h3 className="font-semibold mb-2">Curated Quality</h3>
                <p className="text-sm text-muted-foreground">
                  We only list jobs at companies we'd want to work at ourselves. No spam, no low-quality postings.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="w-12 h-12 rounded-lg bg-amber-500/10 flex items-center justify-center mb-4">
                  <Zap className="h-6 w-6 text-amber-500" />
                </div>
                <h3 className="font-semibold mb-2">Real Salaries</h3>
                <p className="text-sm text-muted-foreground">
                  We show actual salary ranges, not vague estimates. Know your worth before you apply.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-gradient-to-br from-amber-500/10 via-transparent to-purple-500/10 border-t">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to level up your career?</h2>
          <p className="text-muted-foreground mb-8 max-w-md mx-auto">
            Join thousands of engineers who found their dream jobs at top-tier companies.
          </p>
          <Link href="/jobs">
            <Button size="lg" className="bg-gradient-to-r from-amber-500 to-yellow-400 text-black hover:from-amber-600 hover:to-yellow-500 gap-2">
              Start Browsing
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
