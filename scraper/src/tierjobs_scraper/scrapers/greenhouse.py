"""Scraper for Greenhouse job boards.

Many companies use Greenhouse (boards.greenhouse.io).
They have a public JSON API at: https://boards-api.greenhouse.io/v1/boards/{company}/jobs
"""

import re
import html
from datetime import datetime
from bs4 import BeautifulSoup
from .base import APIBasedScraper
from ..models import Job, Company


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
    
    def parse_html_content(self, html_content: str) -> str:
        """Parse HTML and return clean text."""
        # First decode HTML entities (&lt; -> <, etc.)
        decoded = html.unescape(html_content)
        # Parse with BeautifulSoup
        soup = BeautifulSoup(decoded, "html.parser")
        # Get text with newlines preserved
        text = soup.get_text(separator="\n", strip=True)
        # Clean up multiple newlines
        text = re.sub(r'\n{3,}', '\n\n', text)
        return text
    
    def extract_salary(self, html: str) -> tuple[int | None, int | None, str | None]:
        """Extract salary range from HTML content."""
        # First, find all dollar amounts in the HTML
        # Pattern to find $xxx,xxx values (may be wrapped in HTML tags)
        dollar_pattern = r'\$([0-9,]+)'
        amounts = re.findall(dollar_pattern, html)
        
        if len(amounts) >= 2:
            # Take the first two amounts as min/max (common pattern for salary ranges)
            try:
                # Filter to reasonable salary amounts (> $10k, < $10M)
                valid_amounts = []
                for amt in amounts:
                    val = int(amt.replace(',', ''))
                    if 10000 <= val <= 10000000:
                        valid_amounts.append(val)
                
                if len(valid_amounts) >= 2:
                    salary_min = valid_amounts[0]
                    salary_max = valid_amounts[1]
                    
                    # Ensure min < max
                    if salary_min > salary_max:
                        salary_min, salary_max = salary_max, salary_min
                    
                    # Check for currency (default USD)
                    currency = "USD"
                    if "CAD" in html:
                        currency = "CAD"
                    elif "EUR" in html or "€" in html:
                        currency = "EUR"
                    elif "GBP" in html or "£" in html:
                        currency = "GBP"
                    
                    return salary_min, salary_max, currency
            except (ValueError, IndexError):
                pass
        
        return None, None, None
    
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

            # Check if remote (inferred from location text)
            remote = False
            if location and "remote" in location.lower():
                remote = True

            # Raw fields - departments (full mode only)
            team = None
            departments = []
            if data.get("departments"):
                departments = [d.get("name") for d in data["departments"] if d.get("name")]
                if departments:
                    team = departments[0]

            # Raw fields - offices (full mode only)
            offices = []
            if data.get("offices"):
                offices = [o.get("name") for o in data["offices"] if o.get("name")]

            # Raw fields - metadata (full mode only)
            metadata = {}
            if data.get("metadata"):
                for m in data["metadata"]:
                    if m.get("name") and m.get("value"):
                        metadata[m["name"]] = m["value"]

            # Raw fields - description (full mode only)
            description_html = None
            description = None
            salary_min = None
            salary_max = None
            salary_currency = None
            
            if full and data.get("content"):
                description_html = data["content"]
                description = self.parse_html_content(description_html)
                salary_min, salary_max, salary_currency = self.extract_salary(description_html)

            # Raw fields - dates
            posted_at = None
            if data.get("first_published"):
                try:
                    posted_at = datetime.fromisoformat(data["first_published"].replace("Z", "+00:00"))
                except Exception:
                    pass

            updated_at = None
            if data.get("updated_at"):
                try:
                    updated_at = datetime.fromisoformat(data["updated_at"].replace("Z", "+00:00"))
                except Exception:
                    pass

            # Raw fields - IDs
            internal_job_id = data.get("internal_job_id")
            requisition_id = data.get("requisition_id")

            return self.create_job(
                id=self.make_job_id(job_id),
                title=title,
                url=url,
                location=location,
                remote=remote,
                team=team,
                departments=departments,
                offices=offices,
                metadata=metadata,
                description_html=description_html,
                description=description,
                salary_min=salary_min,
                salary_max=salary_max,
                salary_currency=salary_currency,
                posted_at=posted_at,
                updated_at=updated_at,
                internal_job_id=internal_job_id,
                requisition_id=requisition_id,
            )
        except Exception as e:
            print(f"Error parsing job: {e}")
            return None
