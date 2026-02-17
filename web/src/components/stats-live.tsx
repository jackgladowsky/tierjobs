'use client';

import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';

export function StatsLive() {
  const companyStats = useQuery(api.companies.stats);

  const totalJobs = companyStats?.totalJobs ?? '—';
  const totalCompanies = companyStats?.totalCompanies ?? '—';

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
      <div className="text-center">
        <div className="text-3xl font-bold text-amber-500">
          {typeof totalJobs === 'number' ? `${totalJobs.toLocaleString()}+` : totalJobs}
        </div>
        <div className="text-sm text-muted-foreground">Open Positions</div>
      </div>
      <div className="text-center">
        <div className="text-3xl font-bold text-amber-500">
          {typeof totalCompanies === 'number' ? `${totalCompanies}+` : totalCompanies}
        </div>
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
  );
}
