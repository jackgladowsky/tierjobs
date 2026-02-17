"""Convex database client for TierJobs."""

import os
from datetime import datetime
from typing import Literal

import httpx

from .models import Job, Company


# Default to the dev deployment URL
DEFAULT_SITE_URL = "https://deafening-goldfinch-885.convex.site"


class ConvexClient:
    """HTTP client for Convex database."""

    def __init__(self, site_url: str | None = None):
        self.site_url = site_url or os.getenv("CONVEX_SITE_URL", DEFAULT_SITE_URL)
        self.client = httpx.Client(timeout=30.0)

    def _job_to_convex(self, job: Job) -> dict:
        """Convert a Job model to Convex format."""
        return {
            "jobId": job.id,
            "company": job.company,
            "companySlug": job.company_slug,
            "tier": job.tier,
            "tierScore": job.tier_score,
            "title": job.title,
            "url": job.url,
            "location": job.location,
            "remote": job.remote,
            "level": job.level.value if hasattr(job.level, "value") else job.level,
            "jobType": job.job_type.value if hasattr(job.job_type, "value") else job.job_type,
            "team": job.team,
            "description": job.description,
            "salaryMin": job.salary_min,
            "salaryMax": job.salary_max,
            "postedAt": int(job.posted_at.timestamp() * 1000) if job.posted_at else None,
            "scrapedAt": int(job.scraped_at.timestamp() * 1000),
            "score": job.score,
        }

    def _company_to_convex(self, company: Company) -> dict:
        """Convert a Company model to Convex format."""
        return {
            "name": company.name,
            "slug": company.slug,
            "domain": company.domain,
            "careersUrl": company.careers_url,
            "tier": company.tier,
            "tierScore": company.tier_score,
            "lastScraped": int(company.last_scraped.timestamp() * 1000) if company.last_scraped else None,
            "jobCount": company.job_count,
        }

    def upsert_job(self, job: Job) -> dict:
        """Upsert a single job."""
        data = self._job_to_convex(job)
        response = self.client.post(f"{self.site_url}/jobs", json=data)
        response.raise_for_status()
        return response.json()

    def bulk_upsert_jobs(self, jobs: list[Job]) -> dict:
        """Bulk upsert multiple jobs."""
        data = {"jobs": [self._job_to_convex(job) for job in jobs]}
        response = self.client.post(f"{self.site_url}/jobs/bulk", json=data)
        response.raise_for_status()
        return response.json()

    def upsert_company(self, company: Company) -> dict:
        """Upsert a company."""
        data = self._company_to_convex(company)
        response = self.client.post(f"{self.site_url}/companies", json=data)
        response.raise_for_status()
        return response.json()

    def update_company_job_count(
        self, slug: str, job_count: int, last_scraped: datetime | None = None
    ) -> dict:
        """Update company job count after scraping."""
        data = {
            "slug": slug,
            "jobCount": job_count,
        }
        if last_scraped:
            data["lastScraped"] = int(last_scraped.timestamp() * 1000)
        
        response = self.client.post(f"{self.site_url}/companies/job-count", json=data)
        response.raise_for_status()
        return response.json()

    def health_check(self) -> bool:
        """Check if Convex is reachable."""
        try:
            response = self.client.get(f"{self.site_url}/health")
            return response.status_code == 200
        except Exception:
            return False

    def close(self):
        """Close the HTTP client."""
        self.client.close()

    def __enter__(self):
        return self

    def __exit__(self, *args):
        self.close()


class AsyncConvexClient:
    """Async HTTP client for Convex database."""

    def __init__(self, site_url: str | None = None):
        self.site_url = site_url or os.getenv("CONVEX_SITE_URL", DEFAULT_SITE_URL)
        self.client = httpx.AsyncClient(timeout=30.0)

    def _job_to_convex(self, job: Job) -> dict:
        """Convert a Job model to Convex format."""
        return {
            "jobId": job.id,
            "company": job.company,
            "companySlug": job.company_slug,
            "tier": job.tier,
            "tierScore": job.tier_score,
            "title": job.title,
            "url": job.url,
            "location": job.location,
            "remote": job.remote,
            "level": job.level.value if hasattr(job.level, "value") else job.level,
            "jobType": job.job_type.value if hasattr(job.job_type, "value") else job.job_type,
            "team": job.team,
            "description": job.description,
            "salaryMin": job.salary_min,
            "salaryMax": job.salary_max,
            "postedAt": int(job.posted_at.timestamp() * 1000) if job.posted_at else None,
            "scrapedAt": int(job.scraped_at.timestamp() * 1000),
            "score": job.score,
        }

    def _company_to_convex(self, company: Company) -> dict:
        """Convert a Company model to Convex format."""
        return {
            "name": company.name,
            "slug": company.slug,
            "domain": company.domain,
            "careersUrl": company.careers_url,
            "tier": company.tier,
            "tierScore": company.tier_score,
            "lastScraped": int(company.last_scraped.timestamp() * 1000) if company.last_scraped else None,
            "jobCount": company.job_count,
        }

    async def upsert_job(self, job: Job) -> dict:
        """Upsert a single job."""
        data = self._job_to_convex(job)
        response = await self.client.post(f"{self.site_url}/jobs", json=data)
        response.raise_for_status()
        return response.json()

    async def bulk_upsert_jobs(self, jobs: list[Job]) -> dict:
        """Bulk upsert multiple jobs."""
        data = {"jobs": [self._job_to_convex(job) for job in jobs]}
        response = await self.client.post(f"{self.site_url}/jobs/bulk", json=data)
        response.raise_for_status()
        return response.json()

    async def upsert_company(self, company: Company) -> dict:
        """Upsert a company."""
        data = self._company_to_convex(company)
        response = await self.client.post(f"{self.site_url}/companies", json=data)
        response.raise_for_status()
        return response.json()

    async def update_company_job_count(
        self, slug: str, job_count: int, last_scraped: datetime | None = None
    ) -> dict:
        """Update company job count after scraping."""
        data = {
            "slug": slug,
            "jobCount": job_count,
        }
        if last_scraped:
            data["lastScraped"] = int(last_scraped.timestamp() * 1000)
        
        response = await self.client.post(f"{self.site_url}/companies/job-count", json=data)
        response.raise_for_status()
        return response.json()

    async def health_check(self) -> bool:
        """Check if Convex is reachable."""
        try:
            response = await self.client.get(f"{self.site_url}/health")
            return response.status_code == 200
        except Exception:
            return False

    async def close(self):
        """Close the HTTP client."""
        await self.client.aclose()

    async def __aenter__(self):
        return self

    async def __aexit__(self, *args):
        await self.close()
