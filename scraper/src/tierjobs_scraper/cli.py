"""CLI for TierJobs scraper."""

import asyncio
import json
from pathlib import Path

import click
from rich.console import Console
from rich.table import Table
from rich.progress import Progress, SpinnerColumn, TextColumn

from .models import Company
from .scrapers import GreenhouseScraper, LeverScraper
from .scrapers.greenhouse import GREENHOUSE_BOARDS
from .scrapers.lever import LEVER_SITES


console = Console()

# Load tier data
TIERS_PATH = Path(__file__).parent.parent.parent.parent / "shared" / "tiers.json"


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


def get_scraper(company: Company):
    """Get the appropriate scraper for a company."""
    slug = company.slug
    
    # Check if it's a Greenhouse company
    if slug in GREENHOUSE_BOARDS:
        return GreenhouseScraper(company)
    
    # Check if it's a Lever company
    if slug in LEVER_SITES:
        return LeverScraper(company)
    
    # Default to Greenhouse with company slug
    return GreenhouseScraper(company)


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
@click.argument("company_slug")
@click.option("--output", "-o", type=click.Path(), help="Output JSON file")
def scrape(company_slug: str, output: str | None):
    """Scrape jobs from a specific company."""
    all_companies = load_companies()
    
    if company_slug not in all_companies:
        console.print(f"[red]Unknown company: {company_slug}[/red]")
        console.print("Run 'tierjobs companies' to see available companies")
        return
    
    company = all_companies[company_slug]
    scraper = get_scraper(company)
    
    console.print(f"Scraping [cyan]{company.name}[/cyan] ({company.tier})...")
    
    async def run():
        result = await scraper.run()
        return result, scraper.jobs
    
    result, jobs = asyncio.run(run())
    
    if result.success:
        console.print(f"[green]✓[/green] Found {result.jobs_found} jobs in {result.duration_ms}ms")
        
        if jobs:
            table = Table(title=f"Jobs at {company.name}")
            table.add_column("Title", style="white", max_width=50)
            table.add_column("Level", style="cyan")
            table.add_column("Type", style="green")
            table.add_column("Location", style="dim")
            
            for job in jobs[:20]:  # Show first 20
                table.add_row(
                    job.title[:50],
                    job.level,
                    job.job_type,
                    job.location or "N/A",
                )
            
            console.print(table)
            
            if len(jobs) > 20:
                console.print(f"... and {len(jobs) - 20} more")
        
        if output:
            with open(output, "w") as f:
                json.dump([job.model_dump() for job in jobs], f, indent=2, default=str)
            console.print(f"Saved to {output}")
    else:
        console.print(f"[red]✗[/red] Failed: {result.error}")


@main.command()
@click.option("--output", "-o", type=click.Path(), default="jobs.json", help="Output JSON file")
@click.option("--tiers", "-t", multiple=True, help="Only scrape specific tiers (e.g., -t S+ -t S)")
def scrape_all(output: str, tiers: tuple[str]):
    """Scrape jobs from all companies."""
    all_companies = load_companies()
    
    # Filter by tier if specified
    if tiers:
        all_companies = {k: v for k, v in all_companies.items() if v.tier in tiers}
    
    console.print(f"Scraping {len(all_companies)} companies...")
    
    all_jobs = []
    results = []
    
    async def run_all():
        for slug, company in all_companies.items():
            try:
                scraper = get_scraper(company)
                console.print(f"  Scraping [cyan]{company.name}[/cyan]...", end=" ")
                result = await scraper.run()
                results.append(result)
                
                if result.success:
                    console.print(f"[green]{result.jobs_found} jobs[/green]")
                    all_jobs.extend(scraper.jobs)
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
    
    # Save
    with open(output, "w") as f:
        json.dump([job.model_dump() for job in all_jobs], f, indent=2, default=str)
    console.print(f"Saved to {output}")


if __name__ == "__main__":
    main()
