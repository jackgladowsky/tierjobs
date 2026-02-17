"""Base scraper class."""

import asyncio
import json
from abc import ABC, abstractmethod
from pathlib import Path
from datetime import datetime

import httpx
from playwright.async_api import async_playwright, Page
from bs4 import BeautifulSoup

from ..models import Job, Company, ScrapeResult
from ..classification import infer_job_type, infer_level
from ..location import normalize_location, extract_remote_info


class BaseScraper(ABC):
    """Base class for all job scrapers."""
    
    def __init__(self, company: Company):
        self.company = company
        self.jobs: list[Job] = []
    
    @abstractmethod
    async def scrape(self) -> list[Job]:
        """Scrape jobs from the company. Override in subclass."""
        pass
    
    async def run(self) -> ScrapeResult:
        """Run the scraper and return results."""
        start = datetime.utcnow()
        
        try:
            self.jobs = await self.scrape()
            
            duration = int((datetime.utcnow() - start).total_seconds() * 1000)
            
            return ScrapeResult(
                company=self.company.name,
                success=True,
                jobs_found=len(self.jobs),
                jobs_new=len(self.jobs),  # TODO: track new vs updated
                duration_ms=duration,
            )
        except Exception as e:
            duration = int((datetime.utcnow() - start).total_seconds() * 1000)
            return ScrapeResult(
                company=self.company.name,
                success=False,
                error=str(e),
                duration_ms=duration,
            )
    
    def make_job_id(self, job_id: str) -> str:
        """Create a unique job ID."""
        return f"{self.company.slug}_{job_id}"
    
    def create_job(self, **kwargs) -> Job:
        """Create a job with company info pre-filled.
        
        Automatically infers job_type, level, and normalizes location
        if not explicitly provided.
        """
        title = kwargs.get("title", "")
        team = kwargs.get("team")
        location = kwargs.get("location")
        
        # Auto-infer job type if not provided
        if "job_type" not in kwargs:
            kwargs["job_type"] = infer_job_type(title, team)
        
        # Auto-infer level if not provided
        if "level" not in kwargs:
            kwargs["level"] = infer_level(title)
        
        # Normalize location
        if location and "location_normalized" not in kwargs:
            kwargs["location_normalized"] = normalize_location(location)
        
        # Check for remote status
        if location and not kwargs.get("remote"):
            is_remote, _ = extract_remote_info(location)
            if is_remote:
                kwargs["remote"] = True
        
        return Job(
            company=self.company.name,
            company_slug=self.company.slug,
            tier=self.company.tier,
            tier_score=self.company.tier_score,
            **kwargs,
        )


class APIBasedScraper(BaseScraper):
    """Scraper for companies with JSON APIs."""
    
    async def fetch_json(self, url: str) -> dict:
        """Fetch JSON from URL."""
        async with httpx.AsyncClient() as client:
            response = await client.get(url, follow_redirects=True)
            response.raise_for_status()
            return response.json()


class PlaywrightScraper(BaseScraper):
    """Scraper using Playwright for JS-heavy sites."""
    
    async def get_page_content(self, url: str, wait_for: str | None = None) -> str:
        """Get page HTML after JS execution."""
        async with async_playwright() as p:
            browser = await p.chromium.launch(headless=True)
            page = await browser.new_page()
            
            await page.goto(url, wait_until="networkidle")
            
            if wait_for:
                await page.wait_for_selector(wait_for, timeout=10000)
            
            content = await page.content()
            await browser.close()
            
            return content
    
    def parse_html(self, html: str) -> BeautifulSoup:
        """Parse HTML content."""
        return BeautifulSoup(html, "html.parser")
