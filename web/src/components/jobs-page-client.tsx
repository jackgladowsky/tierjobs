'use client';

import { useCallback, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { FilterBar } from './filter-bar';
import { JobListLive } from './job-list-live';

export function JobsPageClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  
  // Read filters from URL
  const filters = {
    search: searchParams.get('search') || '',
    tier: searchParams.get('tier') || '',
    level: searchParams.get('level') || '',
    jobType: searchParams.get('jobType') || '',
  };

  // Update URL when filters change
  const handleFiltersChange = useCallback((newFilters: typeof filters) => {
    const params = new URLSearchParams();
    if (newFilters.search) params.set('search', newFilters.search);
    if (newFilters.tier) params.set('tier', newFilters.tier);
    if (newFilters.level) params.set('level', newFilters.level);
    if (newFilters.jobType) params.set('jobType', newFilters.jobType);
    
    const query = params.toString();
    router.replace(query ? `/jobs?${query}` : '/jobs', { scroll: false });
  }, [router]);

  // Save scroll position before navigating away
  useEffect(() => {
    const saveScroll = () => {
      sessionStorage.setItem('jobsScrollY', window.scrollY.toString());
    };
    
    // Restore scroll position on mount
    const savedScroll = sessionStorage.getItem('jobsScrollY');
    if (savedScroll) {
      setTimeout(() => {
        window.scrollTo(0, parseInt(savedScroll, 10));
      }, 100);
    }

    window.addEventListener('beforeunload', saveScroll);
    return () => window.removeEventListener('beforeunload', saveScroll);
  }, []);

  // Save scroll when clicking a job link
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const link = (e.target as HTMLElement).closest('a[href^="/jobs/"]');
      if (link) {
        sessionStorage.setItem('jobsScrollY', window.scrollY.toString());
      }
    };
    
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  return (
    <div ref={scrollContainerRef} className="space-y-6">
      <FilterBar filters={filters} onFiltersChange={handleFiltersChange} />
      <JobListLive 
        tier={filters.tier || undefined}
        level={filters.level || undefined}
        jobType={filters.jobType || undefined}
        pageSize={25} 
      />
    </div>
  );
}
