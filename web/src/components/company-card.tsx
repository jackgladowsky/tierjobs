import Link from 'next/link';
import { TierBadge } from './tier-badge';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, Briefcase, Globe } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Company {
  id: string;
  name: string;
  slug: string;
  tier: string;
  domain?: string;
  careersUrl?: string;
  jobCount: number;
  score?: number;
}

interface CompanyCardProps {
  company: Company;
}

export function CompanyCard({ company }: CompanyCardProps) {
  const initials = company.name
    .split(' ')
    .map(w => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
  
  return (
    <Link href={`/companies/${company.slug}`} className="block group">
      <Card className="relative overflow-hidden transition-all duration-200 hover-lift bg-[#12121a] border-white/[0.06] hover:border-indigo-500/30">
        {/* Gradient overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
        
        <CardContent className="relative p-5">
          <div className="flex items-start gap-4">
            {/* Logo */}
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center text-lg font-bold text-indigo-400 flex-shrink-0 border border-white/[0.06]">
              {initials}
            </div>
            
            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2 mb-2">
                <h3 className="font-semibold text-white group-hover:text-indigo-300 transition-colors truncate">
                  {company.name}
                </h3>
                <TierBadge tier={company.tier as any} size="sm" />
              </div>
              
              {company.domain && (
                <div className="flex items-center gap-1.5 text-sm text-white/40 mb-3">
                  <Globe className="h-3.5 w-3.5" />
                  <span className="truncate">{company.domain}</span>
                </div>
              )}
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-sm">
                  <Briefcase className="h-3.5 w-3.5 text-indigo-400" />
                  <span className="text-white/70">{company.jobCount}</span>
                  <span className="text-white/40">open roles</span>
                </div>
                
                <ExternalLink className="h-4 w-4 text-white/30 group-hover:text-indigo-400 transition-colors" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
