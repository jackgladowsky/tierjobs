/**
 * Jobs API Routes
 */

import { Hono } from 'hono';
import type { Env } from '../index';

export const jobsRouter = new Hono<{ Bindings: Env }>();

// List jobs with filters and pagination
jobsRouter.get('/', async (c) => {
  const db = c.env.DB;
  
  // Parse query params
  const tier = c.req.query('tier');
  const level = c.req.query('level');
  const jobType = c.req.query('jobType');
  const remote = c.req.query('remote');
  const company = c.req.query('company');
  const search = c.req.query('search');
  const limit = Math.min(parseInt(c.req.query('limit') || '50'), 100);
  const offset = parseInt(c.req.query('offset') || '0');
  
  // Build query dynamically
  let query = 'SELECT * FROM jobs WHERE 1=1';
  const params: any[] = [];
  
  if (tier) {
    query += ' AND tier = ?';
    params.push(tier);
  }
  if (level) {
    query += ' AND level = ?';
    params.push(level);
  }
  if (jobType) {
    query += ' AND job_type = ?';
    params.push(jobType);
  }
  if (remote === 'true') {
    query += ' AND remote = 1';
  }
  if (company) {
    query += ' AND company_slug = ?';
    params.push(company);
  }
  if (search) {
    // Use FTS for search
    query = `
      SELECT jobs.* FROM jobs
      JOIN jobs_fts ON jobs.id = jobs_fts.rowid
      WHERE jobs_fts MATCH ?
    `;
    params.length = 0; // Reset params
    params.push(search + '*'); // Prefix search
    
    // Re-add other filters
    if (tier) { query += ' AND jobs.tier = ?'; params.push(tier); }
    if (level) { query += ' AND jobs.level = ?'; params.push(level); }
    if (jobType) { query += ' AND jobs.job_type = ?'; params.push(jobType); }
    if (remote === 'true') { query += ' AND jobs.remote = 1'; }
    if (company) { query += ' AND jobs.company_slug = ?'; params.push(company); }
  }
  
  query += ' ORDER BY tier_score DESC, scraped_at DESC LIMIT ? OFFSET ?';
  params.push(limit, offset);
  
  const result = await db.prepare(query).bind(...params).all();
  
  // Get total count for pagination
  let countQuery = 'SELECT COUNT(*) as count FROM jobs WHERE 1=1';
  const countParams: any[] = [];
  
  if (tier) { countQuery += ' AND tier = ?'; countParams.push(tier); }
  if (level) { countQuery += ' AND level = ?'; countParams.push(level); }
  if (jobType) { countQuery += ' AND job_type = ?'; countParams.push(jobType); }
  if (remote === 'true') { countQuery += ' AND remote = 1'; }
  if (company) { countQuery += ' AND company_slug = ?'; countParams.push(company); }
  
  const countResult = await db.prepare(countQuery).bind(...countParams).first<{ count: number }>();
  
  return c.json({
    jobs: result.results,
    pagination: {
      total: countResult?.count || 0,
      limit,
      offset,
      hasMore: offset + limit < (countResult?.count || 0),
    },
  });
});

// Get single job by ID
jobsRouter.get('/:id', async (c) => {
  const db = c.env.DB;
  const id = c.req.param('id');
  
  const job = await db.prepare('SELECT * FROM jobs WHERE id = ? OR job_id = ?')
    .bind(id, id)
    .first();
  
  if (!job) {
    return c.json({ error: 'Job not found' }, 404);
  }
  
  return c.json(job);
});

// Get jobs by company
jobsRouter.get('/company/:slug', async (c) => {
  const db = c.env.DB;
  const slug = c.req.param('slug');
  const limit = Math.min(parseInt(c.req.query('limit') || '100'), 500);
  
  const result = await db.prepare(`
    SELECT * FROM jobs 
    WHERE company_slug = ? 
    ORDER BY level, title
    LIMIT ?
  `).bind(slug, limit).all();
  
  return c.json(result.results);
});

// Featured jobs (high tier, recent)
jobsRouter.get('/featured/list', async (c) => {
  const db = c.env.DB;
  const limit = Math.min(parseInt(c.req.query('limit') || '10'), 50);
  
  const result = await db.prepare(`
    SELECT * FROM jobs 
    WHERE tier IN ('S+', 'S', 'S-', 'A++', 'A+')
    ORDER BY tier_score DESC, scraped_at DESC
    LIMIT ?
  `).bind(limit).all();
  
  return c.json(result.results);
});

// Bulk upsert jobs (for scraper)
jobsRouter.post('/bulk', async (c) => {
  const db = c.env.DB;
  const { jobs } = await c.req.json<{ jobs: any[] }>();
  
  if (!jobs || !Array.isArray(jobs)) {
    return c.json({ error: 'Invalid jobs array' }, 400);
  }
  
  let created = 0;
  let updated = 0;
  
  // Process in batches
  const batchSize = 100;
  for (let i = 0; i < jobs.length; i += batchSize) {
    const batch = jobs.slice(i, i + batchSize);
    
    for (const job of batch) {
      const existing = await db.prepare('SELECT id FROM jobs WHERE job_id = ?')
        .bind(job.jobId || job.job_id)
        .first();
      
      if (existing) {
        await db.prepare(`
          UPDATE jobs SET
            company_slug = ?, company_name = ?, tier = ?, tier_score = ?,
            title = ?, url = ?, location = ?, remote = ?, level = ?,
            job_type = ?, team = ?, description = ?, salary_min = ?,
            salary_max = ?, posted_at = ?, scraped_at = ?, score = ?
          WHERE job_id = ?
        `).bind(
          job.companySlug || job.company_slug,
          job.company || job.company_name,
          job.tier,
          job.tierScore || job.tier_score,
          job.title,
          job.url,
          job.location || null,
          job.remote ? 1 : 0,
          job.level,
          job.jobType || job.job_type,
          job.team || null,
          job.description || null,
          job.salaryMin || job.salary_min || null,
          job.salaryMax || job.salary_max || null,
          job.postedAt || job.posted_at || null,
          job.scrapedAt || job.scraped_at,
          job.score || null,
          job.jobId || job.job_id
        ).run();
        updated++;
      } else {
        await db.prepare(`
          INSERT INTO jobs (
            job_id, company_slug, company_name, tier, tier_score,
            title, url, location, remote, level, job_type, team,
            description, salary_min, salary_max, posted_at, scraped_at, score
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).bind(
          job.jobId || job.job_id,
          job.companySlug || job.company_slug,
          job.company || job.company_name,
          job.tier,
          job.tierScore || job.tier_score,
          job.title,
          job.url,
          job.location || null,
          job.remote ? 1 : 0,
          job.level,
          job.jobType || job.job_type,
          job.team || null,
          job.description || null,
          job.salaryMin || job.salary_min || null,
          job.salaryMax || job.salary_max || null,
          job.postedAt || job.posted_at || null,
          job.scrapedAt || job.scraped_at,
          job.score || null
        ).run();
        created++;
      }
    }
  }
  
  // Update company job counts
  await db.prepare(`
    UPDATE companies SET job_count = (
      SELECT COUNT(*) FROM jobs WHERE jobs.company_slug = companies.slug
    )
  `).run();
  
  return c.json({ created, updated, total: jobs.length });
});
