'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, X, SlidersHorizontal } from 'lucide-react';
import { Tier, JobLevel, JobType } from '@/lib/types';

const tiers: Tier[] = ['S+', 'S', 'A++', 'A+', 'A', 'B'];
const levels: JobLevel[] = ['Intern', 'Entry', 'Mid', 'Senior', 'Staff', 'Principal', 'Director', 'VP', 'C-Level'];
const types: JobType[] = ['Full-time', 'Part-time', 'Contract', 'Internship'];
const remoteOptions = ['Remote', 'Hybrid', 'On-site'];
const locations = ['Mountain View, CA', 'San Francisco, CA', 'New York, NY', 'Seattle, WA', 'Austin, TX', 'Paris, France'];

export interface Filters {
  search: string;
  tier: string;
  level: string;
  type: string;
  remote: string;
  location: string;
}

interface FilterBarProps {
  filters: Filters;
  onFiltersChange: (filters: Filters) => void;
}

export function FilterBar({ filters, onFiltersChange }: FilterBarProps) {
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const updateFilter = (key: keyof Filters, value: string) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const clearFilters = () => {
    onFiltersChange({
      search: '',
      tier: '',
      level: '',
      type: '',
      remote: '',
      location: '',
    });
  };

  const hasActiveFilters = Object.values(filters).some(v => v !== '');

  return (
    <div className="space-y-4">
      {/* Search bar */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search jobs, companies, or keywords..."
            value={filters.search}
            onChange={(e) => updateFilter('search', e.target.value)}
            className="pl-9"
          />
        </div>
        <Button
          variant="outline"
          className="lg:hidden"
          onClick={() => setShowMobileFilters(!showMobileFilters)}
        >
          <SlidersHorizontal className="h-4 w-4" />
        </Button>
      </div>

      {/* Filters - Desktop */}
      <div className={`flex-wrap gap-2 ${showMobileFilters ? 'flex' : 'hidden lg:flex'}`}>
        <Select value={filters.tier} onValueChange={(v) => updateFilter('tier', v)}>
          <SelectTrigger className="w-[120px]">
            <SelectValue placeholder="Tier" />
          </SelectTrigger>
          <SelectContent>
            {tiers.map(t => (
              <SelectItem key={t} value={t}>{t}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filters.level} onValueChange={(v) => updateFilter('level', v)}>
          <SelectTrigger className="w-[130px]">
            <SelectValue placeholder="Level" />
          </SelectTrigger>
          <SelectContent>
            {levels.map(l => (
              <SelectItem key={l} value={l}>{l}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filters.type} onValueChange={(v) => updateFilter('type', v)}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            {types.map(t => (
              <SelectItem key={t} value={t}>{t}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filters.remote} onValueChange={(v) => updateFilter('remote', v)}>
          <SelectTrigger className="w-[130px]">
            <SelectValue placeholder="Remote" />
          </SelectTrigger>
          <SelectContent>
            {remoteOptions.map(r => (
              <SelectItem key={r} value={r}>{r}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filters.location} onValueChange={(v) => updateFilter('location', v)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Location" />
          </SelectTrigger>
          <SelectContent>
            {locations.map(l => (
              <SelectItem key={l} value={l}>{l}</SelectItem>
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
