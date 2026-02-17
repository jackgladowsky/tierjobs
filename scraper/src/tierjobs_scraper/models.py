"""Data models for job listings."""

from datetime import datetime
from pydantic import BaseModel, Field
from enum import Enum


class JobLevel(str, Enum):
    INTERN = "intern"
    NEW_GRAD = "new_grad"
    JUNIOR = "junior"
    MID = "mid"
    SENIOR = "senior"
    STAFF = "staff"
    PRINCIPAL = "principal"
    DIRECTOR = "director"
    VP = "vp"
    EXEC = "exec"
    UNKNOWN = "unknown"


class JobType(str, Enum):
    SOFTWARE_ENGINEER = "swe"
    ML_ENGINEER = "mle"
    DATA_SCIENTIST = "ds"
    QUANT = "quant"
    PRODUCT_MANAGER = "pm"
    DESIGNER = "design"
    DEVOPS = "devops"
    SECURITY = "security"
    RESEARCH = "research"
    OTHER = "other"


class Job(BaseModel):
    """A job listing."""
    
    id: str = Field(description="Unique identifier (company_slug + job_id)")
    company: str
    company_slug: str
    tier: str
    tier_score: int
    
    title: str
    url: str
    location: str | None = None
    remote: bool = False
    
    # Raw fields from API
    team: str | None = None  # departments[0].name
    departments: list[str] = Field(default_factory=list)  # All department names
    offices: list[str] = Field(default_factory=list)  # Office locations
    
    description_html: str | None = None  # Full HTML content
    description: str | None = None  # Clean text (parsed from HTML)
    metadata: dict = Field(default_factory=dict)  # Raw metadata from API
    
    salary_min: int | None = None
    salary_max: int | None = None
    salary_currency: str | None = None
    
    # Dates
    posted_at: datetime | None = None  # first_published
    updated_at: datetime | None = None  # updated_at
    scraped_at: datetime = Field(default_factory=datetime.utcnow)
    
    # Raw IDs from API
    internal_job_id: int | None = None
    requisition_id: str | None = None
    
    # Computed score (tier + TC + other factors)
    score: float | None = None
    
    class Config:
        use_enum_values = True


class Company(BaseModel):
    """A company we scrape."""
    
    name: str
    slug: str
    domain: str
    careers_url: str | None
    tier: str
    tier_score: int
    
    # Scraper config
    scraper_type: str = "generic"  # or company-specific like "greenhouse", "lever"
    last_scraped: datetime | None = None
    job_count: int = 0


class ScrapeResult(BaseModel):
    """Result of a scrape operation."""
    
    company: str
    success: bool
    jobs_found: int = 0
    jobs_new: int = 0
    jobs_updated: int = 0
    error: str | None = None
    duration_ms: int = 0
