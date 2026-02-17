'use client';

import { useState, useMemo } from 'react';
import { Job } from '@/lib/types';
import { JobCard } from './job-card';
import { FilterBar, Filters } from './filter-bar';
import { Button } from '@/components/ui/button';
import { Grid, List } from 'lucide-react';
import { cn } from '@/lib/utils';

interface JobListProps {
  jobs: Job[];
  showFilters?: boolean;
  itemsPerPage?: number;
}

export function JobList({ jobs, showFilters = true, itemsPerPage = 10 }: JobListProps) {
  const [filters, setFilters] = useState<Filters>({
    search: '',
    tier: '',
    level: '',
    jobType: '',
  });
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [page, setPage] = useState(1);

  const filteredJobs = useMemo(() => {
    return jobs.filter(job => {
      if (filters.search) {
        const search = filters.search.toLowerCase();
        const matchesSearch = 
          job.title.toLowerCase().includes(search) ||
          job.company.toLowerCase().includes(search) ||
          (job.description?.toLowerCase().includes(search) ?? false);
        if (!matchesSearch) return false;
      }
      if (filters.tier && job.tier !== filters.tier) return false;
      if (filters.level && job.level !== filters.level) return false;
      if (filters.jobType && job.jobType !== filters.jobType) return false;
      return true;
    });
  }, [jobs, filters]);

  const totalPages = Math.ceil(filteredJobs.length / itemsPerPage);
  const paginatedJobs = filteredJobs.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  return (
    <div className="space-y-6">
      {showFilters && (
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <FilterBar filters={filters} onFiltersChange={setFilters} />
          </div>
          <div className="hidden sm:flex items-center gap-1 border rounded-lg p-1">
            <Button
              variant={viewMode === 'list' ? 'secondary' : 'ghost'}
              size="icon"
              className="h-8 w-8"
              onClick={() => setViewMode('list')}
            >
              <List className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
              size="icon"
              className="h-8 w-8"
              onClick={() => setViewMode('grid')}
            >
              <Grid className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Results count */}
      <div className="text-sm text-muted-foreground">
        {filteredJobs.length} {filteredJobs.length === 1 ? 'job' : 'jobs'} found
      </div>

      {/* Job cards */}
      {paginatedJobs.length > 0 ? (
        <div
          className={cn(
            viewMode === 'grid' 
              ? 'grid grid-cols-1 md:grid-cols-2 gap-4' 
              : 'flex flex-col gap-3'
          )}
        >
          {paginatedJobs.map(job => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No jobs found matching your criteria.</p>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-4">
          <Button
            variant="outline"
            disabled={page === 1}
            onClick={() => setPage(p => p - 1)}
          >
            Previous
          </Button>
          <div className="flex items-center gap-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
              <Button
                key={p}
                variant={page === p ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setPage(p)}
                className="w-8 h-8"
              >
                {p}
              </Button>
            ))}
          </div>
          <Button
            variant="outline"
            disabled={page === totalPages}
            onClick={() => setPage(p => p + 1)}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
