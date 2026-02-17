'use client';

import { useState, useCallback, useRef } from 'react';
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { TierBadge } from './tier-badge';
import { Button } from './ui/button';
import { Skeleton } from './ui/skeleton';
import { 
  Share2, 
  Download, 
  RotateCcw, 
  Twitter, 
  Check,
  Sparkles,
  GripVertical,
  Plus,
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Company {
  slug: string;
  company: string;
  tier: string;
  count: number;
}

type TierKey = 'S+' | 'S' | 'A' | 'B' | 'C' | 'F';

const TIER_ORDER: TierKey[] = ['S+', 'S', 'A', 'B', 'C', 'F'];

const TIER_COLORS: Record<TierKey, { bg: string; border: string }> = {
  'S+': { bg: 'bg-gradient-to-r from-amber-500/20 to-yellow-500/20', border: 'border-amber-500/30' },
  'S': { bg: 'bg-gradient-to-r from-violet-500/20 to-purple-500/20', border: 'border-violet-500/30' },
  'A': { bg: 'bg-gradient-to-r from-blue-500/20 to-indigo-500/20', border: 'border-blue-500/30' },
  'B': { bg: 'bg-gradient-to-r from-emerald-500/20 to-green-500/20', border: 'border-emerald-500/30' },
  'C': { bg: 'bg-gradient-to-r from-orange-500/20 to-amber-500/20', border: 'border-orange-500/30' },
  'F': { bg: 'bg-gradient-to-r from-red-500/20 to-rose-500/20', border: 'border-red-500/30' },
};

export function TierListMaker() {
  const companies = useQuery(api.jobs.topCompanies, { limit: 50 });
  
  // State: which companies are in which tier
  const [tierAssignments, setTierAssignments] = useState<Record<TierKey, string[]>>({
    'S+': [],
    'S': [],
    'A': [],
    'B': [],
    'C': [],
    'F': [],
  });
  
  // Track which companies have been placed
  const placedCompanies = new Set(Object.values(tierAssignments).flat());
  
  // Companies not yet placed
  const unplacedCompanies = companies?.filter(c => !placedCompanies.has(c.slug)) || [];
  
  const [draggedCompany, setDraggedCompany] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const tierListRef = useRef<HTMLDivElement>(null);
  
  const handleDragStart = (slug: string) => {
    setDraggedCompany(slug);
  };
  
  const handleDragEnd = () => {
    setDraggedCompany(null);
  };
  
  const handleDrop = (tier: TierKey) => {
    if (!draggedCompany) return;
    
    // Remove from any existing tier
    const newAssignments = { ...tierAssignments };
    for (const t of TIER_ORDER) {
      newAssignments[t] = newAssignments[t].filter(s => s !== draggedCompany);
    }
    
    // Add to new tier
    newAssignments[tier] = [...newAssignments[tier], draggedCompany];
    setTierAssignments(newAssignments);
    setDraggedCompany(null);
  };
  
  const removeFromTier = (tier: TierKey, slug: string) => {
    setTierAssignments({
      ...tierAssignments,
      [tier]: tierAssignments[tier].filter(s => s !== slug),
    });
  };
  
  const reset = () => {
    setTierAssignments({
      'S+': [],
      'S': [],
      'A': [],
      'B': [],
      'C': [],
      'F': [],
    });
  };
  
  const autoFill = () => {
    if (!companies) return;
    
    // Auto-assign based on original tier
    const newAssignments: Record<TierKey, string[]> = {
      'S+': [],
      'S': [],
      'A': [],
      'B': [],
      'C': [],
      'F': [],
    };
    
    for (const company of companies) {
      let targetTier: TierKey = 'A';
      if (company.tier.startsWith('S+')) targetTier = 'S+';
      else if (company.tier.startsWith('S')) targetTier = 'S';
      else if (company.tier.startsWith('A')) targetTier = 'A';
      else if (company.tier.startsWith('B')) targetTier = 'B';
      else targetTier = 'C';
      
      newAssignments[targetTier].push(company.slug);
    }
    
    setTierAssignments(newAssignments);
  };
  
  const shareToTwitter = () => {
    const tierText = TIER_ORDER
      .filter(t => tierAssignments[t].length > 0)
      .map(t => {
        const companySlugs = tierAssignments[t];
        const companyNames = companySlugs
          .map(slug => companies?.find(c => c.slug === slug)?.company)
          .filter(Boolean)
          .slice(0, 5);
        return `${t}: ${companyNames.join(', ')}${companySlugs.length > 5 ? '...' : ''}`;
      })
      .join('\n');
    
    const text = `My tech company tier list 🏆\n\n${tierText}\n\nMake your own at tierjobs.com/tier-list`;
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };
  
  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText('https://tierjobs.com/tier-list');
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };
  
  if (!companies) {
    return (
      <div className="space-y-4">
        {TIER_ORDER.map(tier => (
          <Skeleton key={tier} className="h-20 w-full rounded-xl bg-white/5" />
        ))}
      </div>
    );
  }
  
  const getCompanyBySlug = (slug: string) => companies.find(c => c.slug === slug);
  
  return (
    <div className="space-y-8">
      {/* Controls */}
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Button
          onClick={autoFill}
          className="bg-violet-500/20 text-violet-300 hover:bg-violet-500/30 border border-violet-500/30"
        >
          <Sparkles className="h-4 w-4 mr-2" />
          Auto-Fill
        </Button>
        <Button
          onClick={reset}
          variant="ghost"
          className="text-white/50 hover:text-white hover:bg-white/5"
        >
          <RotateCcw className="h-4 w-4 mr-2" />
          Reset
        </Button>
        <Button
          onClick={shareToTwitter}
          className="bg-blue-500/20 text-blue-300 hover:bg-blue-500/30 border border-blue-500/30"
        >
          <Twitter className="h-4 w-4 mr-2" />
          Share on Twitter
        </Button>
        <Button
          onClick={copyLink}
          variant="ghost"
          className="text-white/50 hover:text-white hover:bg-white/5"
        >
          {copied ? <Check className="h-4 w-4 mr-2" /> : <Share2 className="h-4 w-4 mr-2" />}
          {copied ? 'Copied!' : 'Copy Link'}
        </Button>
      </div>
      
      {/* Tier list */}
      <div ref={tierListRef} className="space-y-3">
        {TIER_ORDER.map(tier => {
          const colors = TIER_COLORS[tier];
          const companiesInTier = tierAssignments[tier];
          
          return (
            <div
              key={tier}
              className={cn(
                "flex rounded-xl border overflow-hidden transition-all",
                colors.bg,
                colors.border,
                draggedCompany && "ring-1 ring-indigo-500/50"
              )}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => handleDrop(tier)}
            >
              {/* Tier label */}
              <div className="w-20 flex-shrink-0 flex items-center justify-center border-r border-white/10 p-4">
                <TierBadge tier={tier as any} size="lg" />
              </div>
              
              {/* Companies in tier */}
              <div className="flex-1 flex flex-wrap items-center gap-2 p-3 min-h-[72px]">
                {companiesInTier.length === 0 && (
                  <span className="text-sm text-white/30 px-2">
                    Drop companies here
                  </span>
                )}
                {companiesInTier.map(slug => {
                  const company = getCompanyBySlug(slug);
                  if (!company) return null;
                  
                  return (
                    <div
                      key={slug}
                      className="group relative flex items-center gap-2 px-3 py-2 rounded-lg bg-[#0a0a0f]/50 border border-white/10 cursor-grab active:cursor-grabbing"
                      draggable
                      onDragStart={() => handleDragStart(slug)}
                      onDragEnd={handleDragEnd}
                    >
                      <div className="w-7 h-7 rounded-md bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center text-xs font-bold text-indigo-400">
                        {company.company.charAt(0)}
                      </div>
                      <span className="text-sm text-white font-medium">
                        {company.company}
                      </span>
                      <button
                        onClick={() => removeFromTier(tier, slug)}
                        className="absolute -top-1 -right-1 p-0.5 rounded-full bg-red-500/20 text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Unplaced companies */}
      {unplacedCompanies.length > 0 && (
        <div className="pt-8 border-t border-white/[0.06]">
          <h3 className="text-lg font-medium text-white mb-4">
            Companies to Rank
          </h3>
          <div className="flex flex-wrap gap-2">
            {unplacedCompanies.map(company => (
              <div
                key={company.slug}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-lg bg-[#12121a] border border-white/[0.06] cursor-grab active:cursor-grabbing transition-all",
                  draggedCompany === company.slug && "opacity-50 scale-95"
                )}
                draggable
                onDragStart={() => handleDragStart(company.slug)}
                onDragEnd={handleDragEnd}
              >
                <GripVertical className="h-4 w-4 text-white/30" />
                <div className="w-7 h-7 rounded-md bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center text-xs font-bold text-indigo-400">
                  {company.company.charAt(0)}
                </div>
                <span className="text-sm text-white">
                  {company.company}
                </span>
                <span className="text-xs text-white/40">
                  {company.count} roles
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Tips */}
      <div className="text-center text-sm text-white/40 pt-4">
        Drag and drop companies into tiers • Click Auto-Fill for our rankings • Share on Twitter when you're done
      </div>
    </div>
  );
}
