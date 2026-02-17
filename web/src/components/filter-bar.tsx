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
import { Search, X } from 'lucide-react';

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
  { value: 'mle', label: 'ML Engineer' },
  { value: 'ds', label: 'Data Scientist' },
  { value: 'quant', label: 'Quant' },
  { value: 'pm', label: 'Product Manager' },
  { value: 'design', label: 'Design' },
  { value: 'devops', label: 'DevOps/SRE' },
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
}

export function FilterBar({ filters, onFiltersChange }: FilterBarProps) {
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

  const hasActiveFilters = filters.tier || filters.level || filters.jobType;

  return (
    <div className="space-y-4">
      {/* Search bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search jobs..."
          value={filters.search}
          onChange={(e) => updateFilter('search', e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <Select 
          value={filters.tier || undefined} 
          onValueChange={(v) => updateFilter('tier', v)}
        >
          <SelectTrigger className="w-[120px]">
            <SelectValue placeholder="Tier" />
          </SelectTrigger>
          <SelectContent>
            {TIERS.map(t => (
              <SelectItem key={t} value={t}>{t}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select 
          value={filters.level || undefined} 
          onValueChange={(v) => updateFilter('level', v)}
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Level" />
          </SelectTrigger>
          <SelectContent>
            {LEVELS.map(l => (
              <SelectItem key={l.value} value={l.value}>{l.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select 
          value={filters.jobType || undefined} 
          onValueChange={(v) => updateFilter('jobType', v)}
        >
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Role Type" />
          </SelectTrigger>
          <SelectContent>
            {JOB_TYPES.map(t => (
              <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters} className="gap-1">
            <X className="h-3 w-3" />
            Clear
          </Button>
        )}
      </div>
    </div>
  );
}
