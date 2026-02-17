#!/usr/bin/env node
/**
 * Migration script: Convex → D1
 * 
 * Exports jobs from Convex and imports to D1
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { execSync } from 'child_process';

const CONVEX_URL = 'https://deafening-goldfinch-885.convex.cloud';

async function fetchFromConvex(path, args = {}) {
  const response = await fetch(`${CONVEX_URL}/api/query`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ path, args }),
  });
  return response.json();
}

async function exportJobs() {
  console.log('Fetching jobs from Convex...');
  
  // Fetch all jobs in batches
  const allJobs = [];
  let offset = 0;
  const batchSize = 500;
  
  while (true) {
    const result = await fetchFromConvex('jobs:listPaginated', {
      tier: '',
      level: '',
      jobType: '',
      limit: batchSize,
      offset,
    });
    
    if (!result.value || result.value.jobs.length === 0) break;
    
    allJobs.push(...result.value.jobs);
    console.log(`  Fetched ${allJobs.length} jobs...`);
    
    if (result.value.jobs.length < batchSize) break;
    offset += batchSize;
  }
  
  console.log(`Total: ${allJobs.length} jobs`);
  
  // Transform to D1 format
  const jobs = allJobs.map(job => ({
    job_id: job.jobId,
    company_slug: job.companySlug,
    company_name: job.company,
    tier: job.tier,
    tier_score: job.tierScore,
    title: job.title,
    url: job.url,
    location: job.location || null,
    remote: job.remote ? 1 : 0,
    level: job.level,
    job_type: job.jobType,
    team: job.team || null,
    description: job.description || null,
    salary_min: job.salaryMin || null,
    salary_max: job.salaryMax || null,
    posted_at: job.postedAt || null,
    scraped_at: job.scrapedAt,
    score: job.score || null,
  }));
  
  writeFileSync('data/jobs.json', JSON.stringify(jobs, null, 2));
  console.log('Saved to data/jobs.json');
  
  return jobs;
}

async function exportCompanies() {
  console.log('Fetching companies from Convex...');
  
  const result = await fetchFromConvex('companies:list', { limit: 500 });
  const companies = (result.value || []).map(c => ({
    slug: c.slug,
    name: c.name,
    domain: c.domain,
    careers_url: c.careersUrl || null,
    tier: c.tier,
    tier_score: c.tierScore,
    job_count: c.jobCount,
    last_scraped: c.lastScraped || null,
  }));
  
  console.log(`Total: ${companies.length} companies`);
  
  writeFileSync('data/companies.json', JSON.stringify(companies, null, 2));
  console.log('Saved to data/companies.json');
  
  return companies;
}

function generateInsertSQL(table, records, columns) {
  const statements = [];
  
  // Process in batches of 100 for D1
  const batchSize = 100;
  for (let i = 0; i < records.length; i += batchSize) {
    const batch = records.slice(i, i + batchSize);
    
    for (const record of batch) {
      const values = columns.map(col => {
        const val = record[col];
        if (val === null || val === undefined) return 'NULL';
        if (typeof val === 'string') return `'${val.replace(/'/g, "''")}'`;
        return val;
      });
      
      statements.push(
        `INSERT OR REPLACE INTO ${table} (${columns.join(', ')}) VALUES (${values.join(', ')});`
      );
    }
  }
  
  return statements.join('\n');
}

async function main() {
  // Create data directory
  execSync('mkdir -p data');
  
  // Export from Convex
  const jobs = await exportJobs();
  const companies = await exportCompanies();
  
  // Generate SQL
  console.log('Generating SQL...');
  
  const companiesSQL = generateInsertSQL('companies', companies, [
    'slug', 'name', 'domain', 'careers_url', 'tier', 'tier_score', 'job_count', 'last_scraped'
  ]);
  
  const jobsSQL = generateInsertSQL('jobs', jobs, [
    'job_id', 'company_slug', 'company_name', 'tier', 'tier_score',
    'title', 'url', 'location', 'remote', 'level', 'job_type', 'team',
    'description', 'salary_min', 'salary_max', 'posted_at', 'scraped_at', 'score'
  ]);
  
  writeFileSync('data/seed-companies.sql', companiesSQL);
  writeFileSync('data/seed-jobs.sql', jobsSQL);
  
  console.log('Generated:');
  console.log('  - data/seed-companies.sql');
  console.log('  - data/seed-jobs.sql');
  console.log('');
  console.log('To import to D1:');
  console.log('  wrangler d1 execute tierjobs --remote --file=./data/seed-companies.sql');
  console.log('  wrangler d1 execute tierjobs --remote --file=./data/seed-jobs.sql');
}

main().catch(console.error);
