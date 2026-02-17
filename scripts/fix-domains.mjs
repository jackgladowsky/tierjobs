#!/usr/bin/env node

const CONVEX_URL = 'https://greedy-weasel-36.convex.site';

// Manual domain fixes
const domainFixes = {
  'anthropic': 'anthropic.com',
  'google-deepmind': 'deepmind.google',
  'tgs': 'tgsmanagement.com',
  'renaissance-technologies': 'rentec.com',
  'anduril': 'anduril.com',
  'databricks': 'databricks.com',
  'roblox': 'roblox.com',
  'sierra-ai': 'sierra.ai',
  'airbnb': 'airbnb.com',
  'block': 'block.xyz',
  'coinbase': 'coinbase.com',
  'figma': 'figma.com',
  'palantir': 'palantir.com',
  'plaid': 'plaid.com',
  'ramp': 'ramp.com',
  'stripe': 'stripe.com',
  'uber': 'uber.com',
  'waymo': 'waymo.com',
  'datadog': 'datadoghq.com',
  'doordash': 'doordash.com',
  'mongodb': 'mongodb.com',
  'notion': 'notion.so',
  'pinterest': 'pinterest.com',
  'robinhood': 'robinhood.com',
  'cloudflare': 'cloudflare.com',
  'dropbox': 'dropbox.com',
  'instacart': 'instacart.com',
  'reddit': 'reddit.com',
  'snap': 'snap.com',
  'twilio': 'twilio.com',
  'vercel': 'vercel.com',
  'discord': 'discord.com',
  'asana': 'asana.com',
  'duolingo': 'duolingo.com',
  'epic-games': 'epicgames.com',
  'etsy': 'etsy.com',
  'spotify': 'spotify.com',
  'twitch': 'twitch.tv',
  'google': 'google.com',
  'meta': 'meta.com',
  'netflix': 'netflix.com',
  'apple': 'apple.com',
  'amazon': 'amazon.com',
  'aws': 'aws.amazon.com',
  'microsoft': 'microsoft.com',
  'nvidia': 'nvidia.com',
  'linkedin': 'linkedin.com',
  'snowflake': 'snowflake.com',
  'atlassian': 'atlassian.com',
  'bloomberg': 'bloomberg.com',
  'tiktok': 'tiktok.com',
  'paypal': 'paypal.com',
  'ibm': 'ibm.com',
  'oracle': 'oracle.com',
  'salesforce': 'salesforce.com',
  'shopify': 'shopify.com',
  'zoom': 'zoom.us',
  'ebay': 'ebay.com',
  'amd': 'amd.com',
  'adobe': 'adobe.com',
  'citadel': 'citadel.com',
  'd-e-shaw': 'deshaw.com',
  'akuna-capital': 'akunacapital.com',
  'drw': 'drw.com',
  'imc': 'imc.com',
  'sig': 'sig.com',
};

async function main() {
  for (const [slug, domain] of Object.entries(domainFixes)) {
    try {
      const res = await fetch(`${CONVEX_URL}/companies`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
          slug,
          domain,
          tier: 'A', // placeholder, upsert will keep existing
          tierScore: 75,
          jobCount: 0,
        }),
      });
      if (res.ok) {
        console.log(`✓ ${slug} → ${domain}`);
      } else {
        console.error(`✗ ${slug}: ${await res.text()}`);
      }
    } catch (err) {
      console.error(`✗ ${slug}: ${err.message}`);
    }
  }
}

main();
