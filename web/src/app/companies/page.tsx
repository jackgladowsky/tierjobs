import { companies } from '@/lib/mock-data';
import { CompanyCard } from '@/components/company-card';
import { TierBadge } from '@/components/tier-badge';
import { Tier } from '@/lib/types';
import { Building2 } from 'lucide-react';

export const metadata = {
  title: 'Companies - TierJobs',
  description: 'Browse top-tier tech companies by ranking.',
};

const tiers: Tier[] = ['S+', 'S', 'A++', 'A+', 'A', 'B'];

export default function CompaniesPage() {
  const companiesByTier = tiers.reduce((acc, tier) => {
    acc[tier] = companies.filter(c => c.tier === tier);
    return acc;
  }, {} as Record<Tier, typeof companies>);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
          <Building2 className="h-8 w-8 text-amber-500" />
          Companies
        </h1>
        <p className="text-muted-foreground">
          Browse {companies.length} top-tier tech companies, organized by rank
        </p>
      </div>

      <div className="space-y-12">
        {tiers.map(tier => {
          const tierCompanies = companiesByTier[tier];
          if (tierCompanies.length === 0) return null;

          return (
            <section key={tier}>
              <div className="flex items-center gap-3 mb-6">
                <TierBadge tier={tier} size="lg" />
                <span className="text-sm text-muted-foreground">
                  {tierCompanies.length} {tierCompanies.length === 1 ? 'company' : 'companies'}
                </span>
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {tierCompanies.map(company => (
                  <CompanyCard key={company.id} company={company} />
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
