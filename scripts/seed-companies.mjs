#!/usr/bin/env node
import { readFileSync } from 'fs';
import { parse } from 'csv-parse/sync';

// Tier score mapping
const tierScores = {
  'S+': 100,
  'S': 95,
  'S-': 90,
  'A++': 85,
  'A+': 80,
  'A': 75,
  'A-': 70,
  'B+': 65,
  'B': 60,
  'B-': 55,
};

// Extract domain from URL
function extractDomain(url) {
  if (!url || url === 'N/A') return '';
  try {
    const u = new URL(url);
    return u.hostname.replace(/^www\./, '');
  } catch {
    return '';
  }
}

// Slugify company name
function slugify(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

// Read and parse CSV
const csv = readFileSync('/home/jack/tierjobs/shared/companies.csv', 'utf-8');
const records = parse(csv, { columns: true, skip_empty_lines: true });

const companies = records.map(row => ({
  name: row.Company,
  slug: slugify(row.Company),
  domain: extractDomain(row['Careers Page URL']) || extractDomain(row['Job Board URL']),
  careersUrl: row['Careers Page URL'] !== 'N/A' ? row['Careers Page URL'] : undefined,
  tier: row.Tier,
  tierScore: tierScores[row.Tier] || 50,
  jobCount: 0, // Will be updated when jobs are scraped
}));

// Output as JSON for Convex mutation
console.log(JSON.stringify(companies, null, 2));
