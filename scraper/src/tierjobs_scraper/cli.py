"""CLI for TierJobs scraper."""

import asyncio
import json
from datetime import datetime
from pathlib import Path

import click
from rich.console import Console
from rich.table import Table
from rich.progress import Progress, SpinnerColumn, TextColumn

from .models import Company, JobType
from .scrapers import GreenhouseScraper, LeverScraper
from .scrapers.greenhouse import GREENHOUSE_BOARDS
from .scrapers.lever import LEVER_SITES
from .convex_client import AsyncConvexClient


console = Console()

# Load tier data
TIERS_PATH = Path(__file__).parent.parent.parent.parent / "shared" / "tiers.json"

# Valid role types for filtering
VALID_ROLES = {jt.value for jt in JobType}
ROLE_HELP = ", ".join(sorted(VALID_ROLES))


def load_companies() -> dict[str, Company]:
    """Load companies from tiers.json."""
    with open(TIERS_PATH) as f:
        data = json.load(f)
    
    companies = {}
    for tier, tier_data in data["tiers"].items():
        score = tier_data["score"]
        for company_data in tier_data["companies"]:
            slug = company_data["name"].lower().replace(" ", "_").replace(".", "")
            companies[slug] = Company(
                name=company_data["name"],
                slug=slug,
                domain=company_data["domain"],
                careers_url=company_data["careers_url"],
                tier=tier,
                tier_score=score,
            )
    return companies


def get_scraper(company: Company, full: bool = False):
    """Get the appropriate scraper for a company."""
    slug = company.slug
    
    # Check if it's a Greenhouse company
    if slug in GREENHOUSE_BOARDS:
        return GreenhouseScraper(company, full=full)
    
    # Check if it's a Lever company
    if slug in LEVER_SITES:
        return LeverScraper(company)
    
    # Default to Greenhouse with company slug
    return GreenhouseScraper(company, full=full)


def validate_roles(roles: tuple[str, ...]) -> list[str] | None:
    """Validate role filters. Returns None if invalid roles found."""
    if not roles:
        return []
    
    invalid = [r for r in roles if r not in VALID_ROLES]
    if invalid:
        console.print(f"[red]Invalid role(s): {', '.join(invalid)}[/red]")
        console.print(f"Valid roles: {ROLE_HELP}")
        return None
    return list(roles)


def filter_jobs_by_role(jobs: list, roles: list[str]) -> list:
    """Filter jobs by role type."""
    if not roles:
        return jobs
    return [job for job in jobs if job.job_type in roles]


@click.group()
def main():
    """TierJobs Scraper - Scrape jobs from top tech companies."""
    pass


@main.command()
def companies():
    """List all companies we can scrape."""
    all_companies = load_companies()
    
    table = Table(title="Companies")
    table.add_column("Tier", style="cyan")
    table.add_column("Company", style="white")
    table.add_column("Slug", style="dim")
    table.add_column("Score", justify="right")
    
    # Group by tier
    by_tier = {}
    for company in all_companies.values():
        if company.tier not in by_tier:
            by_tier[company.tier] = []
        by_tier[company.tier].append(company)
    
    for tier in ["S+", "S", "S-", "A++", "A+", "A", "A-", "B+", "B", "B-"]:
        if tier in by_tier:
            for company in by_tier[tier]:
                table.add_row(tier, company.name, company.slug, str(company.tier_score))
    
    console.print(table)
    console.print(f"\nTotal: {len(all_companies)} companies")


@main.command()
def roles():
    """List available role types for filtering."""
    table = Table(title="Role Types")
    table.add_column("Code", style="cyan")
    table.add_column("Description", style="white")
    
    role_descriptions = {
        "swe": "Software Engineer",
        "mle": "Machine Learning Engineer",
        "ds": "Data Scientist",
        "quant": "Quantitative Analyst/Developer",
        "pm": "Product/Program Manager",
        "design": "Designer (UX/UI/Product)",
        "devops": "DevOps/SRE/Platform Engineer",
        "security": "Security Engineer",
        "research": "Research Scientist/Engineer",
        "other": "Other roles",
    }
    
    for code in sorted(VALID_ROLES):
        desc = role_descriptions.get(code, code)
        table.add_row(code, desc)
    
    console.print(table)
    console.print("\nUsage: tierjobs scrape anthropic --role swe --role mle")


@main.command()
@click.argument("company_slug")
@click.option("--output", "-o", type=click.Path(), help="Output JSON file")
@click.option("--role", "-r", "roles", multiple=True, help=f"Filter by role type ({ROLE_HELP})")
@click.option("--push", is_flag=True, help="Push jobs to Convex database")
@click.option("--full", is_flag=True, help="Fetch full job details including description (slower)")
@click.option("--full-id", type=str, help="Fetch full details for a single job ID (for testing)")
def scrape(company_slug: str, output: str | None, roles: tuple[str, ...], push: bool, full: bool, full_id: str | None):
    """Scrape jobs from a specific company.
    
    Examples:
    
        tierjobs scrape anthropic
        
        tierjobs scrape anthropic --role swe
        
        tierjobs scrape anthropic --role swe --role mle --push
        
        tierjobs scrape stripe --full -o stripe_jobs.json
    """
    all_companies = load_companies()

    if company_slug not in all_companies:
        console.print(f"[red]Unknown company: {company_slug}[/red]")
        console.print("Run 'tierjobs companies' to see available companies")
        return

    # Validate roles
    role_filters = validate_roles(roles)
    if role_filters is None:
        return

    company = all_companies[company_slug]
    
    # Handle --full-id for single job testing
    if full_id:
        console.print(f"Fetching full details for job [cyan]{full_id}[/cyan]...")
        scraper = get_scraper(company, full=True)
        
        async def fetch_single():
            job = await scraper.fetch_single_job(full_id)
            return job
        
        job = asyncio.run(fetch_single())
        if job:
            console.print(f"[green]✓[/green] Fetched job: {job.title}")
            # Print all fields
            job_dict = job.model_dump()
            for k, v in job_dict.items():
                val = str(v)[:100] + "..." if v and len(str(v)) > 100 else str(v)
                status = "✓" if v not in [None, [], ""] else "✗"
                console.print(f"  {status} {k}: {val}")
            
            if output:
                with open(output, "w") as f:
                    json.dump([job.model_dump()], f, indent=2, default=str)
                console.print(f"Saved to {output}")
        else:
            console.print(f"[red]✗[/red] Failed to fetch job {full_id}")
        return
    
    scraper = get_scraper(company, full=full)

    mode_msg = " [yellow](full mode - fetching descriptions)[/yellow]" if full else ""
    role_msg = f" [dim](filtering: {', '.join(role_filters)})[/dim]" if role_filters else ""
    console.print(f"Scraping [cyan]{company.name}[/cyan] ({company.tier}){mode_msg}{role_msg}...")

    async def run():
        result = await scraper.run()
        return result, scraper.jobs

    result, jobs = asyncio.run(run())

    if result.success:
        # Apply role filter
        original_count = len(jobs)
        jobs = filter_jobs_by_role(jobs, role_filters)
        filtered_count = len(jobs)
        
        filter_note = ""
        if role_filters and filtered_count != original_count:
            filter_note = f" ({filtered_count} after filtering)"
        
        console.print(f"[green]✓[/green] Found {original_count} jobs{filter_note} in {result.duration_ms}ms")
        
        if jobs:
            table = Table(title=f"Jobs at {company.name}")
            table.add_column("Title", style="white", max_width=40)
            table.add_column("Type", style="magenta", max_width=8)
            table.add_column("Level", style="blue", max_width=8)
            table.add_column("Location", style="dim", max_width=15)
            table.add_column("Salary", style="green")
            
            for job in jobs[:20]:  # Show first 20
                salary = ""
                if job.salary_min and job.salary_max:
                    salary = f"${job.salary_min//1000}k-${job.salary_max//1000}k"
                
                # Use normalized location if available
                location = job.location_normalized or job.location or "N/A"
                
                table.add_row(
                    job.title[:40],
                    job.job_type,
                    job.level,
                    location[:15] if location else "—",
                    salary or "—",
                )
            
            console.print(table)
            
            if len(jobs) > 20:
                console.print(f"... and {len(jobs) - 20} more")
        
        # Push to Convex
        if push and jobs:
            async def push_to_convex():
                async with AsyncConvexClient() as client:
                    # Check health
                    if not await client.health_check():
                        console.print("[red]✗[/red] Convex unreachable")
                        return False
                    
                    # Bulk upsert jobs
                    result = await client.bulk_upsert_jobs(jobs)
                    console.print(f"[green]✓[/green] Pushed to Convex: {result['created']} created, {result['updated']} updated")
                    
                    # Update company job count
                    await client.update_company_job_count(
                        company.slug,
                        len(jobs),
                        datetime.utcnow()
                    )
                    return True
            
            asyncio.run(push_to_convex())
        
        if output:
            with open(output, "w") as f:
                json.dump([job.model_dump() for job in jobs], f, indent=2, default=str)
            console.print(f"Saved to {output}")
    else:
        console.print(f"[red]✗[/red] Failed: {result.error}")


@main.command("scrape-all")
@click.option("--output", "-o", type=click.Path(), default="jobs.json", help="Output JSON file")
@click.option("--tier", "-t", "tiers", multiple=True, help="Only scrape specific tiers (e.g., -t S+ -t S)")
@click.option("--role", "-r", "roles", multiple=True, help=f"Filter by role type ({ROLE_HELP})")
@click.option("--push", is_flag=True, help="Push jobs to Convex database")
@click.option("--full", is_flag=True, help="Fetch full job details including description (slower)")
def scrape_all(output: str, tiers: tuple[str, ...], roles: tuple[str, ...], push: bool, full: bool):
    """Scrape jobs from all companies.
    
    Examples:
    
        tierjobs scrape-all
        
        tierjobs scrape-all --tier S+ --tier S
        
        tierjobs scrape-all --role swe --role mle --push
        
        tierjobs scrape-all --full --push  # Get full descriptions
    """
    all_companies = load_companies()

    # Validate roles
    role_filters = validate_roles(roles)
    if role_filters is None:
        return

    # Filter by tier if specified
    if tiers:
        all_companies = {k: v for k, v in all_companies.items() if v.tier in tiers}

    mode_msg = " [yellow](full mode)[/yellow]" if full else ""
    console.print(f"Scraping {len(all_companies)} companies...{mode_msg}")
    if role_filters:
        console.print(f"Filtering for roles: {', '.join(role_filters)}")
    
    all_jobs = []
    results = []
    company_job_counts: dict[str, int] = {}
    
    async def run_all():
        for slug, company in all_companies.items():
            try:
                scraper = get_scraper(company, full=full)
                console.print(f"  Scraping [cyan]{company.name}[/cyan]...", end=" ")
                result = await scraper.run()
                results.append(result)

                if result.success:
                    jobs = scraper.jobs
                    original_count = len(jobs)
                    
                    # Apply role filter
                    jobs = filter_jobs_by_role(jobs, role_filters)

                    filter_msg = f" ({len(jobs)} filtered)" if role_filters and len(jobs) != original_count else ""
                    console.print(f"[green]{original_count} jobs{filter_msg}[/green]")
                    all_jobs.extend(jobs)
                    company_job_counts[slug] = len(jobs)
                else:
                    console.print(f"[red]failed: {result.error}[/red]")
            except Exception as e:
                console.print(f"[red]error: {e}[/red]")
    
    asyncio.run(run_all())
    
    # Summary
    successful = sum(1 for r in results if r.success)
    total_jobs = len(all_jobs)
    
    console.print(f"\n[green]✓[/green] Scraped {successful}/{len(results)} companies")
    console.print(f"[green]✓[/green] Found {total_jobs} total jobs")
    
    # Push to Convex
    if push and all_jobs:
        async def push_to_convex():
            async with AsyncConvexClient() as client:
                # Check health
                if not await client.health_check():
                    console.print("[red]✗[/red] Convex unreachable")
                    return
                
                # Bulk upsert jobs in batches of 100
                batch_size = 100
                created = 0
                updated = 0
                
                for i in range(0, len(all_jobs), batch_size):
                    batch = all_jobs[i:i + batch_size]
                    result = await client.bulk_upsert_jobs(batch)
                    created += result.get("created", 0)
                    updated += result.get("updated", 0)
                    console.print(f"  Pushed batch {i // batch_size + 1}...")
                
                console.print(f"[green]✓[/green] Pushed to Convex: {created} created, {updated} updated")
                
                # Update company job counts
                now = datetime.utcnow()
                for slug, count in company_job_counts.items():
                    await client.update_company_job_count(slug, count, now)
                
                console.print(f"[green]✓[/green] Updated {len(company_job_counts)} company job counts")
        
        asyncio.run(push_to_convex())
    
    # Save
    with open(output, "w") as f:
        json.dump([job.model_dump() for job in all_jobs], f, indent=2, default=str)
    console.print(f"Saved to {output}")


if __name__ == "__main__":
    main()
