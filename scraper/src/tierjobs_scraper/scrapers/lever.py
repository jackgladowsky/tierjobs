"""Scraper for Lever job boards.

Many companies use Lever (jobs.lever.co).
They have a public API at: https://api.lever.co/v0/postings/{company}
"""

from datetime import datetime
from .base import APIBasedScraper
from ..models import Job, Company, JobLevel, JobType


# Map company slugs to their Lever site names
LEVER_SITES = {
    "netflix": "netflix",
    "cloudflare": "cloudflare",
    "vercel": "vercel",
    "datadog": "datadog",
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

            # Check if remote
            remote = False
            if location and "remote" in location.lower():
                remote = True

            # Infer level and type
            level = self.infer_level(title)
            job_type = self.infer_job_type(title)

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

            return self.create_job(
                id=self.make_job_id(job_id),
                title=title,
                url=url,
                location=location,
                remote=remote,
                level=level,
                job_type=job_type,
                team=team,
                description=description[:500] if description else None,
                posted_at=posted_at,
            )
        except Exception as e:
            print(f"Error parsing job: {e}")
            return None
    
    def infer_level(self, title: str) -> JobLevel:
        """Infer job level from title."""
        title_lower = title.lower()
        
        if "intern" in title_lower:
            return JobLevel.INTERN
        elif "new grad" in title_lower or "entry" in title_lower:
            return JobLevel.NEW_GRAD
        elif "junior" in title_lower or "jr" in title_lower:
            return JobLevel.JUNIOR
        elif "senior" in title_lower or "sr" in title_lower:
            return JobLevel.SENIOR
        elif "staff" in title_lower:
            return JobLevel.STAFF
        elif "principal" in title_lower:
            return JobLevel.PRINCIPAL
        elif "director" in title_lower:
            return JobLevel.DIRECTOR
        elif "vp" in title_lower or "vice president" in title_lower:
            return JobLevel.VP
        elif any(x in title_lower for x in ["cto", "ceo", "chief"]):
            return JobLevel.EXEC
        else:
            return JobLevel.MID
    
    def infer_job_type(self, title: str) -> JobType:
        """Infer job type from title."""
        title_lower = title.lower()
        
        if any(x in title_lower for x in ["machine learning", "ml ", "ai ", "deep learning"]):
            return JobType.ML_ENGINEER
        elif any(x in title_lower for x in ["data scientist", "data science"]):
            return JobType.DATA_SCIENTIST
        elif any(x in title_lower for x in ["quant", "quantitative"]):
            return JobType.QUANT
        elif any(x in title_lower for x in ["product manager", "pm", "product lead"]):
            return JobType.PRODUCT_MANAGER
        elif any(x in title_lower for x in ["design", "ux", "ui"]):
            return JobType.DESIGNER
        elif any(x in title_lower for x in ["devops", "sre", "infrastructure", "platform"]):
            return JobType.DEVOPS
        elif any(x in title_lower for x in ["security", "infosec"]):
            return JobType.SECURITY
        elif any(x in title_lower for x in ["research", "researcher"]):
            return JobType.RESEARCH
        elif any(x in title_lower for x in ["software", "engineer", "developer", "backend", "frontend", "fullstack"]):
            return JobType.SOFTWARE_ENGINEER
        else:
            return JobType.OTHER
