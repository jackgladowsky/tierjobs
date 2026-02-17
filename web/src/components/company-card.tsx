import Link from 'next/link';
import Image from 'next/image';
import { Company } from '@/lib/types';
import { TierBadge } from './tier-badge';
import { Card, CardContent } from '@/components/ui/card';
import { MapPin, Briefcase, ExternalLink } from 'lucide-react';

// Fix domains that point to ATS providers instead of actual company
const domainOverrides: Record<string, string> = {
  'anthropic': 'anthropic.com',
  'anduril': 'anduril.com',
  'databricks': 'databricks.com',
  'roblox': 'roblox.com',
  'airbnb': 'airbnb.com',
  'block': 'block.xyz',
  'coinbase': 'coinbase.com',
  'figma': 'figma.com',
  'stripe': 'stripe.com',
  'uber': 'uber.com',
  'waymo': 'waymo.com',
  'datadog': 'datadoghq.com',
  'doordash': 'doordash.com',
  'mongodb': 'mongodb.com',
  'pinterest': 'pinterest.com',
  'robinhood': 'robinhood.com',
  'cloudflare': 'cloudflare.com',
  'dropbox': 'dropbox.com',
  'instacart': 'instacart.com',
  'reddit': 'reddit.com',
  'snap': 'snap.com',
  'twilio': 'twilio.com',
  'discord': 'discord.com',
  'asana': 'asana.com',
  'duolingo': 'duolingo.com',
  'epic-games': 'epicgames.com',
  'etsy': 'etsy.com',
  'spotify': 'spotify.com',
  'palantir': 'palantir.com',
  'plaid': 'plaid.com',
};

function CompanyLogo({ company }: { company: Company }) {
  // Use Clearbit Logo API (free, no key needed)
  const domain = domainOverrides[company.slug] || company.domain;
  const logoUrl = domain && !domain.includes('greenhouse') && !domain.includes('lever') && !domain.includes('ashby')
    ? `https://logo.clearbit.com/${domain}` 
    : null;
  
  if (!logoUrl) {
    return (
      <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center text-xl font-bold text-muted-foreground">
        {company.name.charAt(0)}
      </div>
    );
  }

  return (
    <div className="w-12 h-12 rounded-lg bg-white border border-border overflow-hidden flex items-center justify-center">
      <img
        src={logoUrl}
        alt={`${company.name} logo`}
        className="w-10 h-10 object-contain"
        onError={(e) => {
          // Fallback to initial if logo fails to load
          e.currentTarget.style.display = 'none';
          e.currentTarget.parentElement!.innerHTML = `<span class="text-xl font-bold text-muted-foreground">${company.name.charAt(0)}</span>`;
        }}
      />
    </div>
  );
}

interface CompanyCardProps {
  company: Company;
}

export function CompanyCard({ company }: CompanyCardProps) {
  return (
    <Link href={`/companies/${company.slug}`}>
      <Card className="group transition-all duration-200 hover:border-primary/50 hover:shadow-lg cursor-pointer h-full">
        <CardContent className="p-5 flex flex-col h-full">
          {/* Header */}
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex items-center gap-3">
              <CompanyLogo company={company} />
              <div>
                <h3 className="font-semibold text-lg text-foreground group-hover:text-primary transition-colors">
                  {company.name}
                </h3>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <MapPin className="h-3.5 w-3.5" />
                  <span>{company.location}</span>
                </div>
              </div>
            </div>
            <TierBadge tier={company.tier} />
          </div>

          {/* Description */}
          {company.description && (
            <p className="text-sm text-muted-foreground flex-1 line-clamp-2 mb-4">
              {company.description}
            </p>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between pt-3 border-t border-border/50 mt-auto">
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Briefcase className="h-4 w-4" />
              <span>
                {company.jobCount} open {company.jobCount === 1 ? 'position' : 'positions'}
              </span>
            </div>
            {company.website && (
              <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
