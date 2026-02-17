'use client';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, X, Filter, SlidersHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';

// Match database values exactly
const TIERS = ['S+', 'S', 'S-', 'A++', 'A+', 'A', 'A-', 'B+', 'B', 'B-'] as const;

const LEVELS = [
  { value: 'intern', label: 'Intern' },
  { value: 'new_grad', label: 'New Grad' },
  { value: 'junior', label: 'Junior' },
  { value: 'mid', label: 'Mid-Level' },
  { value: 'senior', label: 'Senior' },
  { value: 'staff', label: 'Staff' },
  { value: 'principal', label: 'Principal' },
  { value: 'director', label: 'Director' },
  { value: 'vp', label: 'VP' },
  { value: 'exec', label: 'Executive' },
] as const;

const JOB_TYPES = [
  { value: 'swe', label: 'Software Engineer' },
  { value: 'mle', label: 'ML/AI' },
  { value: 'ds', label: 'Data Science' },
  { value: 'quant', label: 'Quant' },
  { value: 'pm', label: 'Product Manager' },
  { value: 'design', label: 'Design' },
  { value: 'devops', label: 'Platform/DevOps' },
  { value: 'security', label: 'Security' },
  { value: 'research', label: 'Research' },
  { value: 'other', label: 'Other' },
] as const;

export interface Filters {
  search: string;
  tier: string;
  level: string;
  jobType: string;
}

interface FilterBarProps {
  filters: Filters;
  onFiltersChange: (filters: Filters) => void;
  totalCount?: number;
}

export function FilterBar({ filters, onFiltersChange, totalCount }: FilterBarProps) {
  const updateFilter = (key: keyof Filters, value: string) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const clearFilters = () => {
    onFiltersChange({
      search: '',
      tier: '',
      level: '',
      jobType: '',
    });
  };

  const hasActiveFilters = filters.tier || filters.level || filters.jobType || filters.search;
  const activeCount = [filters.tier, filters.level, filters.jobType, filters.search].filter(Boolean).length;

  return (
    <div className="space-y-4">
      {/* Search bar */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
        <Input
          placeholder="Search jobs, companies, roles..."
          value={filters.search}
          onChange={(e) => updateFilter('search', e.target.value)}
          className="pl-11 h-12 bg-[#12121a] border-white/[0.06] text-white placeholder:text-white/40 focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/30"
        />
        {filters.search && (
          <button
            onClick={() => updateFilter('search', '')}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Filter row */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Filter label */}
        <div className="flex items-center gap-2 text-sm text-white/50">
          <SlidersHorizontal className="h-4 w-4" />
          <span className="hidden sm:inline">Filters</span>
        </div>

        {/* Tier filter */}
        <Select 
          value={filters.tier || undefined} 
          onValueChange={(v) => updateFilter('tier', v)}
        >
          <SelectTrigger className={cn(
            "w-[110px] h-9 bg-[#12121a] border-white/[0.06] text-sm",
            filters.tier && "border-indigo-500/50 bg-indigo-500/10"
          )}>
            <SelectValue placeholder="Tier" />
          </SelectTrigger>
          <SelectContent className="bg-[#12121a] border-white/[0.06]">
            {TIERS.map(t => (
              <SelectItem key={t} value={t} className="text-white hover:bg-white/5 focus:bg-white/5">
                {t}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Level filter */}
        <Select 
          value={filters.level || undefined} 
          onValueChange={(v) => updateFilter('level', v)}
        >
          <SelectTrigger className={cn(
            "w-[130px] h-9 bg-[#12121a] border-white/[0.06] text-sm",
            filters.level && "border-indigo-500/50 bg-indigo-500/10"
          )}>
            <SelectValue placeholder="Level" />
          </SelectTrigger>
          <SelectContent className="bg-[#12121a] border-white/[0.06]">
            {LEVELS.map(l => (
              <SelectItem key={l.value} value={l.value} className="text-white hover:bg-white/5 focus:bg-white/5">
                {l.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Job type filter */}
        <Select 
          value={filters.jobType || undefined} 
          onValueChange={(v) => updateFilter('jobType', v)}
        >
          <SelectTrigger className={cn(
            "w-[150px] h-9 bg-[#12121a] border-white/[0.06] text-sm",
            filters.jobType && "border-indigo-500/50 bg-indigo-500/10"
          )}>
            <SelectValue placeholder="Role Type" />
          </SelectTrigger>
          <SelectContent className="bg-[#12121a] border-white/[0.06]">
            {JOB_TYPES.map(t => (
              <SelectItem key={t.value} value={t.value} className="text-white hover:bg-white/5 focus:bg-white/5">
                {t.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Clear button */}
        {hasActiveFilters && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={clearFilters} 
            className="h-9 px-3 text-white/50 hover:text-white hover:bg-white/5"
          >
            <X className="h-3.5 w-3.5 mr-1.5" />
            Clear{activeCount > 1 ? ` (${activeCount})` : ''}
          </Button>
        )}

        {/* Results count */}
        {totalCount !== undefined && (
          <div className="ml-auto text-sm text-white/40">
            {totalCount.toLocaleString()} {totalCount === 1 ? 'job' : 'jobs'}
          </div>
        )}
      </div>

      {/* Quick filter chips */}
      <div className="flex flex-wrap gap-2">
        <QuickChip 
          label="🎓 Internships" 
          active={filters.level === 'intern'}
          onClick={() => updateFilter('level', filters.level === 'intern' ? '' : 'intern')}
        />
        <QuickChip 
          label="🚀 New Grad" 
          active={filters.level === 'new_grad'}
          onClick={() => updateFilter('level', filters.level === 'new_grad' ? '' : 'new_grad')}
        />
        <QuickChip 
          label="⭐ S+ Tier" 
          active={filters.tier === 'S+'}
          onClick={() => updateFilter('tier', filters.tier === 'S+' ? '' : 'S+')}
        />
        <QuickChip 
          label="💻 SWE" 
          active={filters.jobType === 'swe'}
          onClick={() => updateFilter('jobType', filters.jobType === 'swe' ? '' : 'swe')}
        />
        <QuickChip 
          label="🤖 ML/AI" 
          active={filters.jobType === 'mle'}
          onClick={() => updateFilter('jobType', filters.jobType === 'mle' ? '' : 'mle')}
        />
      </div>
    </div>
  );
}

function QuickChip({ 
  label, 
  active, 
  onClick 
}: { 
  label: string; 
  active: boolean; 
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "px-3 py-1.5 rounded-full text-sm transition-all",
        active
          ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/40"
          : "bg-white/5 text-white/60 border border-transparent hover:bg-white/10 hover:text-white"
      )}
    >
      {label}
    </button>
  );
}
