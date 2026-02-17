"""Scraper for Lever job boards.

Many companies use Lever (jobs.lever.co).
They have a public API at: https://api.lever.co/v0/postings/{company}
"""

from datetime import datetime
from .base import APIBasedScraper
from ..models import Job, Company


# Map company slugs to their Lever site names
LEVER_SITES = {
    "atlassian": "atlassian",
    "palantir": "palantir",
    "plaid": "plaid",
}


class LeverScraper(APIBasedScraper):
    """Scraper for Lever job boards."""
    
    def __init__(self, company: Company, site_name: str | None = None):
        super().__init__(company)
        self.site_name = site_name or LEVER_SITES.get(company.slug, company.slug)
    
    async def scrape(self) -> list[Job]:
        """Scrape jobs from Lever API."""
        url = f"https://api.lever.co/v0/postings/{self.site_name}?mode=json"
        
        data = await self.fetch_json(url)
        jobs = []
        
        for job_data in data:
            job = self.parse_job(job_data)
            if job:
                jobs.append(job)
        
        return jobs
    
    def parse_job(self, data: dict) -> Job | None:
        """Parse a job from Lever API response."""
        try:
            job_id = data["id"]
            title = data["text"]
            url = data["hostedUrl"]

            # Extract location
            location = data.get("categories", {}).get("location")

            # Get team/department
            team = data.get("categories", {}).get("team")

            # Get description
            description = data.get("descriptionPlain")

            # Extract posting date
            posted_at = None
            if data.get("createdAt"):
                try:
                    # Lever API returns Unix timestamp in milliseconds
                    posted_at = datetime.fromtimestamp(data["createdAt"] / 1000)
                except Exception:
                    pass

            # create_job auto-infers job_type, level, and normalizes location
            return self.create_job(
                id=self.make_job_id(job_id),
                title=title,
                url=url,
                location=location,
                team=team,
                description=description[:500] if description else None,
                posted_at=posted_at,
            )
        except Exception as e:
            print(f"Error parsing job: {e}")
            return None
