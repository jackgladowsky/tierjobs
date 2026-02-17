"use client";

import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { CompanyCard } from '@/components/company-card';
import { TierBadge } from '@/components/tier-badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tier } from '@/lib/types';
import { Building2 } from 'lucide-react';

const tiers: Tier[] = ['S+', 'S', 'S-', 'A++', 'A+', 'A', 'A-', 'B+', 'B', 'B-'];

export default function CompaniesPage() {
  const companies = useQuery(api.companies.list, { limit: 200 });

  if (companies === undefined) {
    return (
      <div className="min-h-screen bg-[#0a0a0f]">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <Skeleton className="h-10 w-48 bg-white/5" />
            <Skeleton className="h-5 w-64 mt-2 bg-white/5" />
          </div>
          <div className="space-y-12">
            {[1, 2, 3].map(i => (
              <div key={i}>
                <Skeleton className="h-8 w-32 mb-4 bg-white/5" />
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[1, 2, 3].map(j => (
                    <Skeleton key={j} className="h-32 bg-white/5 rounded-xl" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const companiesByTier = tiers.reduce((acc, tier) => {
    acc[tier] = companies.filter(c => c.tier === tier);
    return acc;
  }, {} as Record<Tier, typeof companies>);

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2.5 rounded-xl bg-violet-500/10">
              <Building2 className="h-6 w-6 text-violet-400" />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-white">
              Companies
            </h1>
          </div>
          <p className="text-white/50">
            {companies.length} top-tier tech companies ranked by prestige
          </p>
        </div>

        {/* Companies by tier */}
        <div className="space-y-12">
          {tiers.map(tier => {
            const tierCompanies = companiesByTier[tier];
            if (!tierCompanies || tierCompanies.length === 0) return null;

            return (
              <section key={tier}>
                <div className="flex items-center gap-3 mb-6">
                  <TierBadge tier={tier} size="lg" />
                  <span className="text-sm text-white/50">
                    {tierCompanies.length} {tierCompanies.length === 1 ? 'company' : 'companies'}
                  </span>
                </div>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {tierCompanies.map(company => (
                    <CompanyCard key={company._id} company={{
                      id: company._id,
                      name: company.name,
                      slug: company.slug,
                      tier: company.tier as Tier,
                      domain: company.domain,
                      careersUrl: company.careersUrl,
                      jobCount: company.jobCount,
                    }} />
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      </div>
    </div>
  );
}
