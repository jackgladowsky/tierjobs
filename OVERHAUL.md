# TierJobs Overhaul - Master Plan

**Goal:** Make TierJobs go viral on Twitter. A genuinely useful, beautiful tool for SWEs hunting jobs at elite companies.

**Target User:** Jack (and people like him) — CS students hunting internships/new grad roles at top companies.

**Key Differentiator:** LLM-powered prestige scoring that actually ranks companies and roles objectively.

---

## Phase 1: Data Quality (CRITICAL)

### 1.1 Full Job Data Extraction
**Status:** Running full scrape now
**Goal:** Every job has description, salary range, requirements

**Verification:**
```bash
# Test: >95% of jobs have descriptions
curl -s -X POST "https://greedy-weasel-36.convex.cloud/api/query" \
  -H "Content-Type: application/json" \
  -d '{"path":"jobs:count","args":{}}' 
# Compare with jobs that have descriptions
```

### 1.2 SWE-Only Filter
**Goal:** Only show technical/coding roles. Filter out PM, Design, HR, etc.

**Implementation:**
- Update scraper classification to be stricter
- Add `isTechnical: boolean` field to job schema
- Filter UI to only show technical roles by default
- Keep `jobType` for subcategories: `swe`, `mle`, `ds`, `devops`, `security`

**Verification Test:**
```typescript
// test/technical-filter.test.ts
test("all displayed jobs are technical", async () => {
  const jobs = await api.jobs.list({ limit: 100 });
  const nonTechnical = jobs.filter(j => 
    ["pm", "design", "other"].includes(j.jobType)
  );
  expect(nonTechnical.length).toBe(0);
});
```

### 1.3 Intern/New Grad Focus
**Goal:** Highlight and prioritize intern + new_grad roles

**Implementation:**
- Add "For You" tab that shows intern/new_grad by default
- Add prominent filters for experience level
- Show "X intern positions" / "X new grad positions" on homepage

---

## Phase 2: LLM Prestige Scoring System

### 2.1 Company Scoring Model
**Goal:** Generate objective company rankings based on real data

**Factors to score (1-100 each):**
1. **TC Score** — Avg compensation at company (levels.fyi data if available)
2. **Brand Prestige** — Name recognition, selectivity, "FAANG-ness"
3. **Engineering Culture** — Tech blog quality, open source contributions
4. **Growth Trajectory** — IPO status, funding, market position
5. **Work-Life Balance** — Glassdoor/Blind sentiment (optional)

**Implementation:**
```python
# scoring/company_scorer.py
async def score_company(company: Company) -> CompanyScore:
    prompt = f"""
    Score this tech company on a 1-100 scale for software engineering prestige.
    
    Company: {company.name}
    Domain: {company.domain}
    Known for: {company.description}
    Current tier: {company.tier}
    
    Return JSON with scores for:
    - tc_score: typical SWE compensation (1-100, 100 = highest paying)
    - brand_prestige: name recognition and selectivity (1-100)
    - engineering_culture: technical excellence reputation (1-100)
    - growth: company trajectory and stability (1-100)
    - overall: weighted average
    
    Be objective. Use public knowledge about compensation, selectivity, and reputation.
    """
    return await llm.generate(prompt, response_format=CompanyScore)
```

**Verification:**
- Anthropic, OpenAI should score 95+
- Jane Street, Citadel should score 95+ on TC
- Discord, Spotify should score lower than FAANG
- Run scoring on all companies, manually verify top 10 and bottom 10

### 2.2 Role Scoring Model  
**Goal:** Score individual job postings

**Factors:**
1. **TC Range** — Salary min/max (normalized)
2. **Level Impact** — Intern < New Grad < Mid < Senior < Staff
3. **Team Prestige** — Core product vs internal tools
4. **Location Value** — SF/NYC premium
5. **Remote Flexibility** — Bonus for remote

**Implementation:**
```python
async def score_role(job: Job, company_score: CompanyScore) -> float:
    base = company_score.overall
    
    # Level multiplier
    level_mult = {
        "intern": 0.7, "new_grad": 0.85, "junior": 0.9,
        "mid": 1.0, "senior": 1.1, "staff": 1.2
    }
    
    # TC boost (if available)
    tc_boost = 0
    if job.salary_max:
        if job.salary_max > 400000: tc_boost = 15
        elif job.salary_max > 300000: tc_boost = 10
        elif job.salary_max > 200000: tc_boost = 5
    
    return base * level_mult.get(job.level, 1.0) + tc_boost
```

### 2.3 Composite Rankings
**Goal:** Generate ranked lists that are actually useful

**Lists to generate:**
- Top 50 Intern Roles (by score)
- Top 50 New Grad Roles (by score)
- Top Companies for SWE (by company score)
- Highest Paying Roles (by TC)
- Best Remote Roles (remote + high score)

---

## Phase 3: UI Overhaul

### 3.1 Color Scheme Redesign
**Goal:** Ditch generic dark theme, make it distinctive and chill

**New Palette:**
```css
/* "Midnight Hacker" theme */
--bg-primary: #0a0a0f;      /* Near black with blue tint */
--bg-secondary: #12121a;    /* Card backgrounds */
--bg-tertiary: #1a1a24;     /* Hover states */

--accent-primary: #6366f1;   /* Indigo - main accent */
--accent-secondary: #818cf8; /* Lighter indigo */
--accent-success: #34d399;   /* Mint green for salary */
--accent-warning: #fbbf24;   /* Amber for tier badges */

--text-primary: #f1f5f9;     /* Almost white */
--text-secondary: #94a3b8;   /* Muted */
--text-tertiary: #64748b;    /* Very muted */

/* Tier colors - gradient feel */
--tier-s-plus: linear-gradient(135deg, #fbbf24, #f59e0b);
--tier-s: linear-gradient(135deg, #a78bfa, #8b5cf6);
--tier-a: linear-gradient(135deg, #60a5fa, #3b82f6);
--tier-b: linear-gradient(135deg, #4ade80, #22c55e);
```

### 3.2 Visual Identity
**Goal:** Make it memorable, not generic

**Elements:**
- Custom logo with "TJ" monogram
- Subtle grid/dot pattern background
- Glassmorphism cards with blur
- Smooth micro-animations
- Tier badges with gradients and glow effects
- Company logos (fetch from clearbit/logo.dev)

### 3.3 Homepage Redesign
**Goal:** Immediate value, viral potential

**Layout:**
```
┌─────────────────────────────────────────────────────┐
│  🏆 TierJobs                              [Sign In] │
├─────────────────────────────────────────────────────┤
│                                                     │
│   Find your dream SWE role at elite companies       │
│   [10,777 jobs] from [33 top-tier companies]       │
│                                                     │
│   ┌──────────┐ ┌──────────┐ ┌──────────┐           │
│   │ Internships│ │ New Grad │ │ All Roles│           │
│   │    342    │ │   891    │ │  10,777  │           │
│   └──────────┘ └──────────┘ └──────────┘           │
│                                                     │
├─────────────────────────────────────────────────────┤
│  🔥 Trending This Week                              │
│  ┌─────────────────────────────────────────────┐   │
│  │ #1  Anthropic — SWE Intern — $100/hr — SF   │   │
│  │ #2  xAI — ML Engineer — $400k — Palo Alto   │   │
│  │ #3  SpaceX — Flight SW — $180k — Hawthorne  │   │
│  └─────────────────────────────────────────────┘   │
│                                                     │
│  🏅 Top Companies for SWE                           │
│  [Anthropic 98] [Jane Street 97] [xAI 96] ...      │
│                                                     │
└─────────────────────────────────────────────────────┘
```

### 3.4 Job Card Redesign
**Goal:** Information-dense but clean

**New card layout:**
- Company logo (left)
- Title + Company + Score badge (top)
- Location + Remote tag + Level (middle)
- Salary range with visual bar (bottom)
- Quick-apply button on hover

### 3.5 Company Page
**Goal:** Full company profile with scoring breakdown

**Sections:**
- Company header with logo, score, tier
- Score breakdown (TC, Prestige, Culture, Growth)
- Open roles grouped by level
- "Similar Companies" recommendations

---

## Phase 4: Viral Features

### 4.1 Company Tier List Generator
**Goal:** Shareable tier list images for Twitter

**Implementation:**
- `/tier-list` page with drag-drop tier maker
- Pre-populated with scored companies
- "Share to Twitter" button generates image
- Watermark with TierJobs URL

### 4.2 "My Dream Companies" List
**Goal:** Users save companies, share their list

**Implementation:**
- Save companies to list (localStorage first, auth later)
- Generate shareable image of their top picks
- "I'm hunting at [X, Y, Z]" Twitter share

### 4.3 Weekly Rankings Email/Post
**Goal:** Content for Twitter engagement

**Auto-generate:**
- "Top 10 new SWE roles this week"
- "Highest paying intern roles right now"
- "Companies with most open new grad positions"

### 4.4 Salary Comparison Tool
**Goal:** "What could I make at X vs Y?"

**Implementation:**
- Side-by-side company comparison
- Show TC ranges for same level
- Shareable comparison cards

---

## Sub-Agent Task Breakdown

### Agent 1: Data Pipeline (2-3 hours)
**Tasks:**
1. Verify full scrape completed with descriptions
2. Add `isTechnical` classification to scraper
3. Re-scrape with technical filter
4. Add tests for data quality

**Verification:**
- [ ] >95% jobs have descriptions
- [ ] >90% jobs have salary data (where available)
- [ ] 0 non-technical jobs in filtered view
- [ ] Tests pass: `npm run test:data`

### Agent 2: Scoring System (2-3 hours)
**Tasks:**
1. Implement company scoring with LLM
2. Implement role scoring algorithm
3. Store scores in Convex
4. Create ranked lists queries

**Verification:**
- [ ] All 33 companies have scores
- [ ] Scores are sensible (manual check top/bottom 5)
- [ ] Ranked lists API working
- [ ] Tests pass: `npm run test:scoring`

### Agent 3: UI Overhaul (3-4 hours)
**Tasks:**
1. Implement new color scheme
2. Redesign homepage layout
3. Redesign job cards
4. Add company logos
5. Add animations/polish

**Verification:**
- [ ] New theme applied globally
- [ ] Homepage shows stats + trending
- [ ] Job cards show all info
- [ ] Lighthouse score >90
- [ ] Mobile responsive

### Agent 4: Viral Features (2 hours)
**Tasks:**
1. Build tier list generator
2. Build company comparison tool
3. Add share buttons
4. Generate OG images for sharing

**Verification:**
- [ ] Tier list generates shareable image
- [ ] Comparison tool works
- [ ] Twitter cards render correctly

### Agent 5: Polish & Deploy (1-2 hours)
**Tasks:**
1. Final bug fixes
2. Performance optimization
3. Deploy to Vercel
4. Test production

**Verification:**
- [ ] No console errors
- [ ] All links work
- [ ] Filters persist correctly
- [ ] Deployed and accessible

---

## Testing Strategy

### Regression Tests (Automated)
```bash
# Run all tests
npm run test

# Specific test suites
npm run test:data      # Data quality
npm run test:scoring   # Scoring accuracy
npm run test:ui        # Component tests
npm run test:e2e       # End-to-end with Playwright
```

### Manual Verification Checklist
- [ ] Homepage loads with stats
- [ ] Filters work and persist in URL
- [ ] Job detail pages show full descriptions
- [ ] Salary ranges display correctly
- [ ] Company pages show scores
- [ ] Mobile layout works
- [ ] Share features generate images
- [ ] Performance feels snappy

---

## File Structure After Overhaul

```
tierjobs/
├── scraper/
│   └── src/tierjobs_scraper/
│       ├── scoring/           # NEW: LLM scoring
│       │   ├── company.py
│       │   └── role.py
│       └── classification.py  # Updated: stricter SWE filter
├── web/
│   ├── src/
│   │   ├── app/
│   │   │   ├── page.tsx       # Redesigned homepage
│   │   │   ├── jobs/
│   │   │   ├── companies/
│   │   │   ├── tier-list/     # NEW: Viral feature
│   │   │   └── compare/       # NEW: Comparison tool
│   │   ├── components/
│   │   │   ├── job-card.tsx   # Redesigned
│   │   │   ├── company-card.tsx
│   │   │   ├── score-badge.tsx # NEW
│   │   │   └── tier-maker.tsx  # NEW
│   │   └── styles/
│   │       └── theme.css      # NEW: Color system
│   └── convex/
│       ├── jobs.ts
│       ├── companies.ts
│       └── scores.ts          # NEW: Scoring data
└── tests/
    ├── data.test.ts
    ├── scoring.test.ts
    └── e2e/
```

---

## Timeline

**Tonight (while Jack sleeps):**
- Full scrape runs (~1-2 hours)
- Plan documented ✅

**Tomorrow Morning:**
- Spawn agents for parallel work
- Agent 1: Data pipeline
- Agent 2: Scoring system
- Agent 3: UI overhaul

**Tomorrow Afternoon:**
- Agent 4: Viral features
- Agent 5: Polish & deploy

**Evening:**
- Twitter launch
- "Check out what I built" post

---

## Success Metrics

**Viral potential:**
- [ ] Looks good in screenshots
- [ ] Has shareable content (tier lists, comparisons)
- [ ] Solves real problem (finding elite SWE roles)
- [ ] Unique angle (prestige scoring)

**Utility:**
- [ ] Jack can find intern/new grad roles easily
- [ ] Full job details available
- [ ] Salary data visible
- [ ] Filters actually work

---

*Last updated: 2026-02-17 03:40 UTC*
*Full scrape running in background (session: good-trail)*
