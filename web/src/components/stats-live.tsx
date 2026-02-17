'use client';

import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { Briefcase, Building2, Users, TrendingUp } from 'lucide-react';

export function StatsLive() {
  const stats = useQuery(api.companies.fullStats);

  const totalJobs = stats?.totalJobs ?? 0;
  const totalCompanies = stats?.totalCompanies ?? 0;
  const internCount = stats?.levelCounts?.intern ?? 0;
  const newGradCount = stats?.levelCounts?.new_grad ?? 0;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
      <StatCard
        icon={<Briefcase className="h-5 w-5" />}
        value={totalJobs.toLocaleString()}
        label="Open Positions"
        color="indigo"
      />
      <StatCard
        icon={<Building2 className="h-5 w-5" />}
        value={totalCompanies.toString()}
        label="Elite Companies"
        color="violet"
      />
      <StatCard
        icon={<Users className="h-5 w-5" />}
        value={internCount.toLocaleString()}
        label="Internships"
        color="amber"
      />
      <StatCard
        icon={<TrendingUp className="h-5 w-5" />}
        value={newGradCount.toLocaleString()}
        label="New Grad Roles"
        color="emerald"
      />
    </div>
  );
}

interface StatCardProps {
  icon: React.ReactNode;
  value: string;
  label: string;
  color: 'indigo' | 'violet' | 'amber' | 'emerald';
}

const colorClasses = {
  indigo: {
    bg: 'bg-indigo-500/10',
    text: 'text-indigo-400',
    glow: 'group-hover:shadow-indigo-500/20',
  },
  violet: {
    bg: 'bg-violet-500/10',
    text: 'text-violet-400',
    glow: 'group-hover:shadow-violet-500/20',
  },
  amber: {
    bg: 'bg-amber-500/10',
    text: 'text-amber-400',
    glow: 'group-hover:shadow-amber-500/20',
  },
  emerald: {
    bg: 'bg-emerald-500/10',
    text: 'text-emerald-400',
    glow: 'group-hover:shadow-emerald-500/20',
  },
};

function StatCard({ icon, value, label, color }: StatCardProps) {
  const colors = colorClasses[color];
  
  return (
    <div className={`group p-4 md:p-5 rounded-xl bg-[#12121a] border border-white/[0.06] hover:border-white/10 transition-all ${colors.glow} hover:shadow-lg`}>
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg ${colors.bg}`}>
          <span className={colors.text}>{icon}</span>
        </div>
        <div>
          <div className="text-2xl md:text-3xl font-bold text-white">
            {value}
          </div>
          <div className="text-sm text-white/50">{label}</div>
        </div>
      </div>
    </div>
  );
}
