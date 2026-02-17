# TierJobs API - Cloudflare Workers

AI-powered job board for elite tech companies. Built on Cloudflare's developer platform.

## Architecture

- **Workers** - API endpoints (Hono framework)
- **D1** - SQLite database for jobs/companies
- **Workers AI** - Llama 3.3 for natural language job search
- **KV** - Caching layer
- **Durable Objects** - User sessions and saved jobs

## Features for Cloudflare Internship Application

| Requirement | Implementation |
|-------------|----------------|
| LLM | Workers AI (Llama 3.3 70B) for chat-based job search |
| Workflow/Coordination | Job scraping pipeline, query orchestration |
| User Input | Chat interface for natural language queries |
| Memory/State | D1 for data, Durable Objects for sessions |

## Setup

### 1. Authenticate with Cloudflare

```bash
npx wrangler login
```

### 2. Create D1 Database

```bash
npx wrangler d1 create tierjobs
```

Copy the `database_id` from the output and add to `wrangler.toml`:

```toml
[[d1_databases]]
binding = "DB"
database_name = "tierjobs"
database_id = "YOUR_DATABASE_ID"
```

### 3. Create KV Namespace

```bash
npx wrangler kv namespace create CACHE
```

Copy the `id` from the output and add to `wrangler.toml`:

```toml
[[kv_namespaces]]
binding = "CACHE"
id = "YOUR_KV_ID"
```

### 4. Run Schema Migration

```bash
# Local
npx wrangler d1 execute tierjobs --local --file=./schema.sql

# Production
npx wrangler d1 execute tierjobs --remote --file=./schema.sql
```

### 5. Migrate Data from Convex

```bash
# Export from Convex and generate SQL
node scripts/migrate-from-convex.js

# Import to D1
npx wrangler d1 execute tierjobs --remote --file=./data/seed-companies.sql
npx wrangler d1 execute tierjobs --remote --file=./data/seed-jobs.sql
```

### 6. Deploy

```bash
npx wrangler deploy
```

## Development

```bash
npx wrangler dev
```

API runs at `http://localhost:8787`

## API Endpoints

### Jobs
- `GET /api/jobs` - List jobs with filters (tier, level, jobType, remote, search)
- `GET /api/jobs/:id` - Get single job
- `GET /api/jobs/company/:slug` - Jobs by company
- `GET /api/jobs/featured/list` - Featured high-tier jobs

### Companies
- `GET /api/companies` - List companies
- `GET /api/companies/:slug` - Get single company
- `GET /api/companies/top/list` - Top companies by tier

### AI Chat
- `POST /api/chat` - Natural language job search
- `GET /api/chat/suggestions` - Suggested queries
- `GET /api/chat/history/:sessionId` - Chat history

### Stats
- `GET /api/stats` - Overall statistics
- `GET /api/stats/tier/:tier` - Tier-specific stats
- `GET /api/stats/levels` - Level breakdown

## Example Chat Queries

```
"Find me ML internships at S-tier companies"
"Remote SWE jobs for new grads"
"Show me Anthropic positions"
"What companies are hiring the most?"
```

## Project Structure

```
cloudflare/
├── src/
│   ├── index.ts           # Main worker entry
│   ├── routes/
│   │   ├── jobs.ts        # Job endpoints
│   │   ├── companies.ts   # Company endpoints
│   │   ├── chat.ts        # AI chat endpoint
│   │   └── stats.ts       # Stats endpoints
│   └── durable-objects/
│       └── user-session.ts # Session state
├── schema.sql             # D1 schema
├── scripts/
│   └── migrate-from-convex.js
├── wrangler.toml
└── package.json
```
