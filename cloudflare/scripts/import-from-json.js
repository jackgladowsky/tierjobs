#!/usr/bin/env node
/**
 * Import jobs from scraper's jobs.json to D1 SQL format
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';

const SCRAPER_JOBS = '/home/jack/tierjobs/scraper/jobs.json';

function escapeSQL(str) {
  if (str === null || str === undefined) return 'NULL';
  if (typeof str !== 'string') return str;
  // Escape single quotes and remove problematic characters
  return `'${str.replace(/'/g, "''").replace(/\\/g, '\\\\')}'`;
}

function truncate(str, maxLen = 50000) {
  if (!str) return null;
  if (str.length <= maxLen) return str;
  return str.substring(0, maxLen);
}

async function main() {
  console.log('Reading jobs from scraper...');
  
  if (!existsSync(SCRAPER_JOBS)) {
    console.error('jobs.json not found at', SCRAPER_JOBS);
    process.exit(1);
  }
  
  const rawData = readFileSync(SCRAPER_JOBS, 'utf-8');
  const jobs = JSON.parse(rawData);
  
  console.log(`Loaded ${jobs.length} jobs`);
  
  // Extract unique companies
  const companiesMap = new Map();
  for (const job of jobs) {
    const slug = job.company_slug;
    if (!companiesMap.has(slug)) {
      companiesMap.set(slug, {
        slug,
        name: job.company,
        domain: `${slug}.com`,
        tier: job.tier,
        tier_score: job.tier_score,
        job_count: 0,
      });
    }
    companiesMap.get(slug).job_count++;
  }
  
  const companies = Array.from(companiesMap.values());
  console.log(`Found ${companies.length} unique companies`);
  
  // Generate companies SQL
  console.log('Generating companies SQL...');
  const companiesSQL = companies.map(c => {
    return `INSERT OR REPLACE INTO companies (slug, name, domain, tier, tier_score, job_count) VALUES (${escapeSQL(c.slug)}, ${escapeSQL(c.name)}, ${escapeSQL(c.domain)}, ${escapeSQL(c.tier)}, ${c.tier_score}, ${c.job_count});`;
  }).join('\n');
  
  writeFileSync('data/seed-companies.sql', companiesSQL);
  console.log(`  Wrote ${companies.length} companies to data/seed-companies.sql`);
  
  // Generate jobs SQL in batches (D1 has limits)
  console.log('Generating jobs SQL...');
  
  // Process in chunks to avoid huge files
  const chunkSize = 1000;
  let totalWritten = 0;
  
  for (let i = 0; i < jobs.length; i += chunkSize) {
    const chunk = jobs.slice(i, i + chunkSize);
    const chunkNum = Math.floor(i / chunkSize) + 1;
    
    const jobsSQL = chunk.map(job => {
      // Clean description - remove HTML and truncate
      let desc = job.description_html || job.description || null;
      if (desc) {
        // Strip HTML tags
        desc = desc.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
        desc = truncate(desc, 10000);
      }
      
      return `INSERT OR REPLACE INTO jobs (job_id, company_slug, company_name, tier, tier_score, title, url, location, remote, level, job_type, team, description, salary_min, salary_max, scraped_at) VALUES (${escapeSQL(job.id)}, ${escapeSQL(job.company_slug)}, ${escapeSQL(job.company)}, ${escapeSQL(job.tier)}, ${job.tier_score}, ${escapeSQL(job.title)}, ${escapeSQL(job.url)}, ${escapeSQL(job.location || null)}, ${job.remote ? 1 : 0}, ${escapeSQL(job.level)}, ${escapeSQL(job.job_type)}, ${escapeSQL(job.team || null)}, ${escapeSQL(desc)}, ${job.salary_min || 'NULL'}, ${job.salary_max || 'NULL'}, ${Math.floor(Date.now() / 1000)});`;
    }).join('\n');
    
    const filename = `data/seed-jobs-${String(chunkNum).padStart(3, '0')}.sql`;
    writeFileSync(filename, jobsSQL);
    totalWritten += chunk.length;
    console.log(`  Wrote ${chunk.length} jobs to ${filename} (${totalWritten}/${jobs.length})`);
  }
  
  console.log('');
  console.log('Done! To import to D1:');
  console.log('');
  console.log('  # Companies first');
  console.log('  npx wrangler d1 execute tierjobs --remote --file=./data/seed-companies.sql');
  console.log('');
  console.log('  # Then jobs (in order)');
  const numChunks = Math.ceil(jobs.length / chunkSize);
  for (let i = 1; i <= numChunks; i++) {
    console.log(`  npx wrangler d1 execute tierjobs --remote --file=./data/seed-jobs-${String(i).padStart(3, '0')}.sql`);
  }
}

main().catch(console.error);
