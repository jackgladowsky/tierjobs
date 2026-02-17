/**
 * Companies API Routes
 */

import { Hono } from 'hono';
import type { Env } from '../index';

export const companiesRouter = new Hono<{ Bindings: Env }>();

// List companies
companiesRouter.get('/', async (c) => {
  const db = c.env.DB;
  const tier = c.req.query('tier');
  const limit = Math.min(parseInt(c.req.query('limit') || '100'), 500);
  
  let query = 'SELECT * FROM companies';
  const params: any[] = [];
  
  if (tier) {
    query += ' WHERE tier = ?';
    params.push(tier);
  }
  
  query += ' ORDER BY tier_score DESC, job_count DESC LIMIT ?';
  params.push(limit);
  
  const result = await db.prepare(query).bind(...params).all();
  
  return c.json(result.results);
});

// Get single company
companiesRouter.get('/:slug', async (c) => {
  const db = c.env.DB;
  const slug = c.req.param('slug');
  
  const company = await db.prepare('SELECT * FROM companies WHERE slug = ?')
    .bind(slug)
    .first();
  
  if (!company) {
    return c.json({ error: 'Company not found' }, 404);
  }
  
  return c.json(company);
});

// Top companies by tier score
companiesRouter.get('/top/list', async (c) => {
  const db = c.env.DB;
  const limit = Math.min(parseInt(c.req.query('limit') || '20'), 100);
  
  const result = await db.prepare(`
    SELECT * FROM companies 
    ORDER BY tier_score DESC, job_count DESC
    LIMIT ?
  `).bind(limit).all();
  
  return c.json(result.results);
});

// Bulk upsert companies
companiesRouter.post('/bulk', async (c) => {
  const db = c.env.DB;
  const { companies } = await c.req.json<{ companies: any[] }>();
  
  if (!companies || !Array.isArray(companies)) {
    return c.json({ error: 'Invalid companies array' }, 400);
  }
  
  let created = 0;
  let updated = 0;
  
  for (const company of companies) {
    const existing = await db.prepare('SELECT id FROM companies WHERE slug = ?')
      .bind(company.slug)
      .first();
    
    if (existing) {
      await db.prepare(`
        UPDATE companies SET
          name = ?, domain = ?, careers_url = ?, tier = ?,
          tier_score = ?, job_count = ?, last_scraped = ?, updated_at = ?
        WHERE slug = ?
      `).bind(
        company.name,
        company.domain,
        company.careersUrl || company.careers_url || null,
        company.tier,
        company.tierScore || company.tier_score,
        company.jobCount || company.job_count || 0,
        company.lastScraped || company.last_scraped || null,
        Math.floor(Date.now() / 1000),
        company.slug
      ).run();
      updated++;
    } else {
      await db.prepare(`
        INSERT INTO companies (slug, name, domain, careers_url, tier, tier_score, job_count, last_scraped)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `).bind(
        company.slug,
        company.name,
        company.domain,
        company.careersUrl || company.careers_url || null,
        company.tier,
        company.tierScore || company.tier_score,
        company.jobCount || company.job_count || 0,
        company.lastScraped || company.last_scraped || null
      ).run();
      created++;
    }
  }
  
  return c.json({ created, updated, total: companies.length });
});
