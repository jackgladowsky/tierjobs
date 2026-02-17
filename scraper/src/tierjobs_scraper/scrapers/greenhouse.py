"""Scraper for Greenhouse job boards.

Many companies use Greenhouse (boards.greenhouse.io).
They have a public JSON API at: https://boards-api.greenhouse.io/v1/boards/{company}/jobs
"""

from datetime import datetime
from .base import APIBasedScraper
from ..models import Job, Company, JobLevel, JobType


# Map company slugs to their Greenhouse board names
GREENHOUSE_BOARDS = {
    "anthropic": "anthropic",
    "figma": "figma",
    "notion": "notion",
    "ramp": "ramp",
    "plaid": "plaid",
    "discord": "discord",
    "stripe": "stripe",
    "airbnb": "airbnb",
    "coinbase": "coinbase",
    "databricks": "databricks",
    "doordash": "doordash",
    "instacart": "instacart",
    "reddit": "reddit",
    "robinhood": "robinhood",
    "asana": "asana",
    "duolingo": "duolingo",
}


class GreenhouseScraper(APIBasedScraper):
    """Scraper for Greenhouse job boards."""
    
    def __init__(self, company: Company, board_name: str | None = None):
        super().__init__(company)
        self.board_name = board_name or GREENHOUSE_BOARDS.get(company.slug, company.slug)
    
    async def scrape(self) -> list[Job]:
        """Scrape jobs from Greenhouse API."""
        url = f"https://boards-api.greenhouse.io/v1/boards/{self.board_name}/jobs"
        
        data = await self.fetch_json(url)
        jobs = []
        
        for job_data in data.get("jobs", []):
            job = self.parse_job(job_data)
            if job:
                jobs.append(job)
        
        return jobs
    
    def parse_job(self, data: dict) -> Job | None:
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

            # Get department/team
            team = None
            if data.get("departments"):
                team = data["departments"][0].get("name")

            # Extract posting date
            posted_at = None
            if data.get("updated_at"):
                try:
                    posted_at = datetime.fromisoformat(data["updated_at"].replace("Z", "+00:00"))
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
