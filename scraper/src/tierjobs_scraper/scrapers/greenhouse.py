"""Scraper for Greenhouse job boards.

Many companies use Greenhouse (boards.greenhouse.io).
They have a public JSON API at: https://boards-api.greenhouse.io/v1/boards/{company}/jobs
"""

from datetime import datetime
from .base import APIBasedScraper
from ..models import Job, Company, JobLevel, JobType


# Map company slugs to their Greenhouse board names
GREENHOUSE_BOARDS = {
    "airbnb": "airbnb",
    "anduril": "andurilindustries",
    "anthropic": "anthropic",
    "asana": "asana",
    "block": "block",
    "cloudflare": "cloudflare",
    "coinbase": "coinbase",
    "databricks": "databricks",
    "datadog": "datadog",
    "discord": "discord",
    "doordash": "doordashusa",
    "dropbox": "dropbox",
    "duolingo": "duolingo",
    "epic_games": "epicgames",
    "etsy": "etsy",
    "figma": "figma",
    "instacart": "instacart",
    "mongodb": "mongodb",
    "pinterest": "pinterestpostings",
    "reddit": "reddit",
    "robinhood": "Robinhood",
    "roblox": "roblox",
    "snap": "snap",
    "spotify": "spotify",
    "stripe": "stripe",
    "twilio": "twilio",
    "uber": "uber",
    "waymo": "Waymo",
    "xai": "xai",
}


class GreenhouseScraper(APIBasedScraper):
    """Scraper for Greenhouse job boards."""
    
    def __init__(self, company: Company, board_name: str | None = None, full: bool = False):
        super().__init__(company)
        self.board_name = board_name or GREENHOUSE_BOARDS.get(company.slug, company.slug)
        self.full = full
    
    async def scrape(self) -> list[Job]:
        """Scrape jobs from Greenhouse API."""
        url = f"https://boards-api.greenhouse.io/v1/boards/{self.board_name}/jobs"
        
        data = await self.fetch_json(url)
        jobs = []
        
        for job_data in data.get("jobs", []):
            if self.full:
                # Fetch full details for each job
                job = await self.fetch_full_job(str(job_data["id"]))
            else:
                job = self.parse_job(job_data)
            if job:
                jobs.append(job)
        
        return jobs
    
    async def fetch_full_job(self, job_id: str) -> Job | None:
        """Fetch full job details including description."""
        url = f"https://boards-api.greenhouse.io/v1/boards/{self.board_name}/jobs/{job_id}"
        try:
            data = await self.fetch_json(url)
            return self.parse_job(data, full=True)
        except Exception as e:
            print(f"Error fetching job {job_id}: {e}")
            return None
    
    async def fetch_single_job(self, job_id: str) -> Job | None:
        """Fetch a single job by ID (for --full-id testing)."""
        return await self.fetch_full_job(job_id)
    
    def parse_job(self, data: dict, full: bool = False) -> Job | None:
        """Parse a job from Greenhouse API response."""
        try:
            job_id = str(data["id"])
            title = data["title"]
            url = data["absolute_url"]

            # Extract location
            location = None
            if data.get("location"):
                location = data["location"].get("name")

            # Check if remote
            remote = False
            if location and "remote" in location.lower():
                remote = True

            # Infer level from title
            level = self.infer_level(title)
            job_type = self.infer_job_type(title)

            # Get department/team (available in full mode)
            team = None
            if data.get("departments"):
                team = data["departments"][0].get("name")

            # Extract description (only in full mode)
            description = None
            if full and data.get("content"):
                description = data["content"]

            # Extract posting date (prefer first_published over updated_at)
            posted_at = None
            date_field = data.get("first_published") or data.get("updated_at")
            if date_field:
                try:
                    posted_at = datetime.fromisoformat(date_field.replace("Z", "+00:00"))
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
                description=description,
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
            return JobLevel.MID  # Default to mid
    
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
