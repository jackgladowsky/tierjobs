"""Job classification utilities.

Infers job type and level from title and other fields.
"""

from .models import JobType, JobLevel


def infer_job_type(title: str, team: str | None = None) -> str:
    """Infer job type from title and team.
    
    Returns a JobType value (string).
    """
    title_lower = title.lower()
    team_lower = (team or "").lower()
    combined = f"{title_lower} {team_lower}"
    
    # ML/AI - check first as they often contain "engineer" too
    if any(x in combined for x in [
        "machine learning", "ml engineer", "ml ", "ai engineer",
        "deep learning", "nlp", "computer vision", "cv engineer",
        "llm", "language model", "generative ai"
    ]):
        return JobType.ML_ENGINEER.value
    
    # Research
    if any(x in combined for x in [
        "research scientist", "research engineer", "researcher",
        "research fellow", "applied research"
    ]):
        return JobType.RESEARCH.value
    
    # Data Science
    if any(x in combined for x in [
        "data scientist", "data science", "analytics engineer",
        "data analyst"
    ]):
        return JobType.DATA_SCIENTIST.value
    
    # Quant
    if any(x in combined for x in [
        "quant", "quantitative", "trading", "algorithmic"
    ]):
        return JobType.QUANT.value
    
    # Product Management
    if any(x in combined for x in [
        "product manager", "program manager", "technical program",
        "tpm", "product lead", "product owner"
    ]):
        return JobType.PRODUCT_MANAGER.value
    
    # Design
    if any(x in combined for x in [
        "designer", "design", "ux", "ui", "user experience",
        "user interface", "visual design", "interaction design"
    ]):
        return JobType.DESIGNER.value
    
    # DevOps/SRE/Platform
    if any(x in combined for x in [
        "devops", "sre", "site reliability", "infrastructure",
        "platform engineer", "cloud engineer", "systems engineer"
    ]):
        return JobType.DEVOPS.value
    
    # Security
    if any(x in combined for x in [
        "security", "infosec", "cybersecurity", "appsec",
        "penetration", "red team", "blue team"
    ]):
        return JobType.SECURITY.value
    
    # Software Engineering (catch-all for engineering roles)
    if any(x in combined for x in [
        "software engineer", "software developer", "backend",
        "frontend", "full stack", "fullstack", "web developer",
        "mobile engineer", "ios engineer", "android engineer",
        "engineer", "developer", "sde"
    ]):
        return JobType.SOFTWARE_ENGINEER.value
    
    return JobType.OTHER.value


def infer_level(title: str) -> str:
    """Infer job level from title.
    
    Returns a JobLevel value (string).
    """
    title_lower = title.lower()
    
    # Executive level
    if any(x in title_lower for x in ["cto", "ceo", "cfo", "coo", "chief"]):
        return JobLevel.EXEC.value
    
    # VP level
    if any(x in title_lower for x in ["vp", "vice president"]):
        return JobLevel.VP.value
    
    # Director level
    if "director" in title_lower:
        return JobLevel.DIRECTOR.value
    
    # Principal/Distinguished
    if any(x in title_lower for x in ["principal", "distinguished", "fellow"]):
        return JobLevel.PRINCIPAL.value
    
    # Staff level
    if "staff" in title_lower:
        return JobLevel.STAFF.value
    
    # Senior level
    if any(x in title_lower for x in ["senior", "sr.", "sr "]):
        return JobLevel.SENIOR.value
    
    # Junior level
    if any(x in title_lower for x in ["junior", "jr.", "jr "]):
        return JobLevel.JUNIOR.value
    
    # Entry level / New Grad
    if any(x in title_lower for x in ["new grad", "entry level", "early career", "associate"]):
        return JobLevel.NEW_GRAD.value
    
    # Intern
    if "intern" in title_lower:
        return JobLevel.INTERN.value
    
    # Default to mid-level
    return JobLevel.MID.value


def matches_role_filter(job_type: str, role_filters: list[str]) -> bool:
    """Check if a job type matches any of the role filters.
    
    Args:
        job_type: The job's type (e.g., "swe", "mle")
        role_filters: List of role filters to match against
        
    Returns:
        True if job matches any filter, False otherwise
    """
    if not role_filters:
        return True
    
    return job_type in role_filters
