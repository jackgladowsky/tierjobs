#!/usr/bin/env node
import { readFileSync } from 'fs';
import { parse } from 'csv-parse/sync';

const CONVEX_URL = process.env.CONVEX_URL || 'https://greedy-weasel-36.convex.site';

// Tier score mapping
const tierScores = {
  'S+': 100, 'S': 95, 'S-': 90,
  'A++': 85, 'A+': 80, 'A': 75, 'A-': 70,
  'B+': 65, 'B': 60, 'B-': 55,
};

function extractDomain(url) {
  if (!url || url === 'N/A') return '';
  try {
    const u = new URL(url);
    return u.hostname.replace(/^www\./, '');
  } catch {
    return '';
  }
}

function slugify(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

async function main() {
  const csv = readFileSync('/home/jack/tierjobs/shared/companies.csv', 'utf-8');
  const records = parse(csv, { columns: true, skip_empty_lines: true });

  let success = 0, failed = 0;

  for (const row of records) {
    const company = {
      name: row.Company,
      slug: slugify(row.Company),
      domain: extractDomain(row['Careers Page URL']) || extractDomain(row['Job Board URL']),
      careersUrl: row['Careers Page URL'] !== 'N/A' ? row['Careers Page URL'] : undefined,
      tier: row.Tier,
      tierScore: tierScores[row.Tier] || 50,
      jobCount: 0,
    };

    try {
      const res = await fetch(`${CONVEX_URL}/companies`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(company),
      });

      if (res.ok) {
        success++;
        console.log(`✓ ${company.name}`);
      } else {
        failed++;
        console.error(`✗ ${company.name}: ${await res.text()}`);
      }
    } catch (err) {
      failed++;
      console.error(`✗ ${company.name}: ${err.message}`);
    }
  }

  console.log(`\nDone: ${success} success, ${failed} failed`);
}

main();
