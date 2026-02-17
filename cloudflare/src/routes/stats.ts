/**
 * Stats API Routes
 */

import { Hono } from 'hono';
import type { Env } from '../index';

export const statsRouter = new Hono<{ Bindings: Env }>();

// Get overall stats (with caching)
statsRouter.get('/', async (c) => {
  const db = c.env.DB;
  const cache = c.env.CACHE;
  
  // Check cache first (1 hour TTL)
  const cached = await cache.get('stats:overall', 'json');
  if (cached) {
    return c.json(cached);
  }
  
  // Get stats from DB
  const [
    jobCount,
    companyCount,
    tierCounts,
    levelCounts,
    topCompanies,
  ] = await Promise.all([
    db.prepare('SELECT COUNT(*) as count FROM jobs').first<{ count: number }>(),
    db.prepare('SELECT COUNT(*) as count FROM companies').first<{ count: number }>(),
    db.prepare(`
      SELECT tier, COUNT(*) as count 
      FROM jobs 
      GROUP BY tier 
      ORDER BY COUNT(*) DESC
    `).all(),
    db.prepare(`
      SELECT level, COUNT(*) as count 
      FROM jobs 
      GROUP BY level 
      ORDER BY COUNT(*) DESC
    `).all(),
    db.prepare(`
      SELECT slug, name, tier, job_count 
      FROM companies 
      ORDER BY job_count DESC 
      LIMIT 10
    `).all(),
  ]);
  
  const stats = {
    totalJobs: jobCount?.count || 0,
    totalCompanies: companyCount?.count || 0,
    byTier: Object.fromEntries(
      (tierCounts.results || []).map((r: any) => [r.tier, r.count])
    ),
    byLevel: Object.fromEntries(
      (levelCounts.results || []).map((r: any) => [r.level, r.count])
    ),
    topCompanies: topCompanies.results || [],
    updatedAt: Date.now(),
  };
  
  // Cache for 1 hour
  await cache.put('stats:overall', JSON.stringify(stats), { expirationTtl: 3600 });
  
  return c.json(stats);
});

// Get stats for specific tier
statsRouter.get('/tier/:tier', async (c) => {
  const db = c.env.DB;
  const tier = c.req.param('tier');
  
  const [jobCount, levelCounts, companies] = await Promise.all([
    db.prepare('SELECT COUNT(*) as count FROM jobs WHERE tier = ?').bind(tier).first<{ count: number }>(),
    db.prepare(`
      SELECT level, COUNT(*) as count 
      FROM jobs 
      WHERE tier = ?
      GROUP BY level 
      ORDER BY COUNT(*) DESC
    `).bind(tier).all(),
    db.prepare(`
      SELECT slug, name, job_count 
      FROM companies 
      WHERE tier = ?
      ORDER BY job_count DESC
    `).bind(tier).all(),
  ]);
  
  return c.json({
    tier,
    totalJobs: jobCount?.count || 0,
    byLevel: Object.fromEntries(
      (levelCounts.results || []).map((r: any) => [r.level, r.count])
    ),
    companies: companies.results || [],
  });
});

// Level-specific stats
statsRouter.get('/levels', async (c) => {
  const db = c.env.DB;
  
  const result = await db.prepare(`
    SELECT level, COUNT(*) as count 
    FROM jobs 
    GROUP BY level 
    ORDER BY 
      CASE level
        WHEN 'intern' THEN 1
        WHEN 'new_grad' THEN 2
        WHEN 'junior' THEN 3
        WHEN 'mid' THEN 4
        WHEN 'senior' THEN 5
        WHEN 'staff' THEN 6
        WHEN 'principal' THEN 7
        WHEN 'director' THEN 8
        WHEN 'vp' THEN 9
        WHEN 'exec' THEN 10
        ELSE 11
      END
  `).all();
  
  return c.json({
    levels: result.results || [],
    total: (result.results || []).reduce((sum: number, r: any) => sum + r.count, 0),
  });
});
