import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { TierBadge } from '@/components/tier-badge';
import { FeaturedJobs, TopCompanies } from '@/components/featured-jobs';
import { StatsLive } from '@/components/stats-live';
import { Tier } from '@/lib/types';
import { ArrowRight, Sparkles, TrendingUp, Zap, Search, Filter, Target, Globe } from 'lucide-react';

const tierInfo: { tier: Tier; description: string; examples: string }[] = [
  {
    tier: 'S+',
    description: 'Elite tier — FAANG, top quant firms, hottest AI companies.',
    examples: 'Google, Anthropic, Jane Street, xAI',
  },
  {
    tier: 'S',
    description: 'Premium tier — Unicorns and top public tech.',
    examples: 'Stripe, Databricks, Coinbase, Discord',
  },
  {
    tier: 'A+',
    description: 'High growth — Late-stage startups on path to IPO.',
    examples: 'Anduril, Figma, SpaceX, Roblox',
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      {/* Noise overlay */}
      <div className="noise-overlay" />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0 hero-gradient" />
        <div className="absolute inset-0 bg-grid opacity-50" />
        
        <div className="container mx-auto px-4 py-20 md:py-32 relative">
          <div className="max-w-4xl mx-auto text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-sm mb-8">
              <Sparkles className="h-4 w-4" />
              <span>Your shortcut to elite tech companies</span>
            </div>
            
            {/* Headline */}
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6 text-white">
              Land your dream role at{' '}
              <span className="gradient-text">
                tier-ranked
              </span>{' '}
              companies
            </h1>
            
            {/* Subheadline */}
            <p className="text-lg md:text-xl text-white/60 mb-10 max-w-2xl mx-auto leading-relaxed">
              Every company ranked by prestige. Every role scored by opportunity.
              Stop guessing. Start targeting.
            </p>
            
            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Link href="/jobs?level=intern">
                <Button 
                  size="lg" 
                  className="bg-gradient-to-r from-indigo-500 to-violet-500 hover:from-indigo-600 hover:to-violet-600 text-white gap-2 px-8 h-12 text-base shadow-lg shadow-indigo-500/25"
                >
                  Find Internships
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/jobs?level=new_grad">
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="border-white/10 bg-white/5 hover:bg-white/10 text-white gap-2 px-8 h-12 text-base"
                >
                  New Grad Roles
                </Button>
              </Link>
            </div>
            
            {/* Quick tier preview */}
            <div className="flex items-center justify-center gap-3 text-sm text-white/40">
              <span>Browse by tier:</span>
              {(['S+', 'S', 'A+', 'A', 'B'] as Tier[]).map((tier) => (
                <Link key={tier} href={`/jobs?tier=${encodeURIComponent(tier)}`}>
                  <TierBadge tier={tier} size="sm" />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="border-t border-white/[0.06] bg-[#0a0a0f]">
        <div className="container mx-auto px-4 py-10">
          <StatsLive />
        </div>
      </section>

      {/* Top Companies */}
      <section className="py-12 bg-[#0a0a0f]">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-violet-400" />
              <h2 className="text-lg font-semibold text-white">Top Companies Hiring</h2>
            </div>
            <Link href="/companies" className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors">
              View all →
            </Link>
          </div>
          <TopCompanies limit={10} />
        </div>
      </section>

      {/* Featured Jobs */}
      <section className="py-16 bg-[#0a0a0f]">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Zap className="h-5 w-5 text-amber-400" />
                <h2 className="text-xl font-bold text-white">Featured Opportunities</h2>
              </div>
              <p className="text-white/50">Top-tier roles at elite companies</p>
            </div>
            <Link href="/jobs">
              <Button variant="ghost" className="text-indigo-400 hover:text-indigo-300 hover:bg-white/5 gap-2">
                View all
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
          <FeaturedJobs limit={6} />
        </div>
      </section>

      {/* Tier Explanation */}
      <section className="py-16 bg-[#08080c] border-y border-white/[0.06]">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-bold text-white mb-3">How We Rank Companies</h2>
            <p className="text-white/50 max-w-xl mx-auto">
              Companies are ranked by prestige, compensation, engineering culture, and growth trajectory.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {tierInfo.map(({ tier, description, examples }) => (
              <Link key={tier} href={`/jobs?tier=${encodeURIComponent(tier)}`}>
                <div className="group p-6 rounded-xl bg-[#12121a] border border-white/[0.06] hover:border-indigo-500/30 transition-all hover-lift">
                  <TierBadge tier={tier} size="lg" />
                  <p className="mt-4 text-white/70 text-sm leading-relaxed">
                    {description}
                  </p>
                  <p className="mt-3 text-xs text-white/40">
                    {examples}
                  </p>
                </div>
              </Link>
            ))}
          </div>
          
          <div className="text-center mt-8">
            <Link href="/companies" className="text-indigo-400 hover:text-indigo-300 text-sm transition-colors">
              View full company rankings →
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-[#0a0a0f]">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <FeatureCard
              icon={<Target className="h-6 w-6" />}
              title="Targeted Search"
              description="Filter by tier, experience level, role type, and location. Find exactly what you're looking for."
            />
            <FeatureCard
              icon={<TrendingUp className="h-6 w-6" />}
              title="Prestige Rankings"
              description="Every company ranked by compensation, culture, and career growth. No more guessing."
            />
            <FeatureCard
              icon={<Globe className="h-6 w-6" />}
              title="Fresh Data"
              description="Jobs scraped daily from company career pages. Never miss a new opening."
            />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-b from-[#0a0a0f] to-[#12121a]">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to level up your career?
          </h2>
          <p className="text-white/50 mb-8 max-w-md mx-auto">
            Browse {'>'}10,000 roles at the most prestigious tech companies.
          </p>
          <Link href="/jobs">
            <Button 
              size="lg" 
              className="bg-gradient-to-r from-indigo-500 to-violet-500 hover:from-indigo-600 hover:to-violet-600 text-white gap-2 px-10 h-12 text-base shadow-lg shadow-indigo-500/25"
            >
              Start Browsing
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}

function FeatureCard({ 
  icon, 
  title, 
  description 
}: { 
  icon: React.ReactNode; 
  title: string; 
  description: string;
}) {
  return (
    <div className="p-6 rounded-xl bg-[#12121a] border border-white/[0.06]">
      <div className="w-12 h-12 rounded-lg bg-indigo-500/10 flex items-center justify-center mb-4 text-indigo-400">
        {icon}
      </div>
      <h3 className="font-semibold text-white mb-2">{title}</h3>
      <p className="text-sm text-white/50 leading-relaxed">{description}</p>
    </div>
  );
}
