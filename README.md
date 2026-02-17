# TierJobs

A prestige-ranked job board that aggregates and scores tech opportunities from top companies.

## Why?

Everyone knows the tier list. But finding open roles means checking 50+ career pages manually. TierJobs scrapes them all, ranks positions by prestige + TC + growth, and surfaces the best opportunities.

## Features

- **Auto-scraped listings** from 100+ top tech companies
- **Prestige scoring** based on company tier (S+ to B-)
- **TC estimates** pulled from levels.fyi data
- **Smart filters** by tier, role type, location, level
- **Alerts** for roles matching your criteria

## Project Structure

```
tierjobs/
├── scraper/          # Python scraping service
│   └── src/
│       └── tierjobs_scraper/
│           ├── scrapers/    # Per-company scrapers
│           ├── models.py    # Data models
│           └── cli.py       # CLI interface
├── web/              # Next.js frontend
└── shared/           # Shared constants (tier list, etc.)
```

## Tech Stack

- **Scrapers**: Python + Playwright + BeautifulSoup
- **Backend**: Next.js API routes
- **Database**: PostgreSQL
- **Frontend**: Next.js + Tailwind + shadcn/ui
- **Infra**: Vercel + Supabase (or self-hosted)

## Company Tiers

| Tier | Companies |
|------|-----------|
| S+   | Anthropic, OpenAI, Google DeepMind, Rentech, TGS, xAI, Citadel Securities, Jane Street, HRT |
| S    | Citadel, D.E. Shaw, Jump, Optiver, 2s, Tesla (Autopilot), Five Rings, SpaceX |
| S-   | IMC, SIG, DRW, Akuna |
| A++  | Databricks, Netflix, Anduril, Google, Meta, Sierra AI, Roblox |
| A+   | Snowflake, Waymo, Stripe, LinkedIn, Figma, Plaid, Uber, Airbnb, Block, Ramp, Coinbase, Nvidia, Palantir |
| A    | Notion, Apple, Doordash, Datadog, Robinhood, MongoDB, Tesla, Pinterest |
| A-   | Snap, AWS, Dropbox, Vercel, Cloudflare, Reddit, Twilio, Instacart |
| B+   | TikTok, Discord, Amazon, Microsoft, Bloomberg, AMD, Adobe, Atlassian |
| B    | Duolingo, Asana, Spotify, Epic Games, Etsy, Twitch, PayPal |
| B-   | Oracle, Zoom, IBM, Salesforce, eBay, Shopify |

## Development

```bash
# Scraper
cd scraper
uv sync
uv run tierjobs scrape --company anthropic

# Web
cd web
npm install
npm run dev
```

## License

MIT
