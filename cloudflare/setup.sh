#!/bin/bash
# TierJobs Cloudflare Setup Script

set -e

echo "🚀 TierJobs Cloudflare Setup"
echo "============================"
echo ""

# Check if logged in
if ! npx wrangler whoami &>/dev/null; then
    echo "❌ Not logged in to Cloudflare"
    echo "   Run: npx wrangler login"
    exit 1
fi

echo "✅ Authenticated with Cloudflare"
echo ""

# Create D1 database
echo "Creating D1 database..."
D1_OUTPUT=$(npx wrangler d1 create tierjobs 2>&1 || true)
echo "$D1_OUTPUT"

# Extract database_id
D1_ID=$(echo "$D1_OUTPUT" | grep -oP 'database_id = "\K[^"]+' || echo "")

if [ -z "$D1_ID" ]; then
    # Try to get existing
    D1_ID=$(npx wrangler d1 list 2>&1 | grep tierjobs | awk '{print $1}' || echo "")
fi

if [ -z "$D1_ID" ]; then
    echo "❌ Could not get D1 database ID. Check output above."
    exit 1
fi

echo "✅ D1 database ID: $D1_ID"
echo ""

# Create KV namespace
echo "Creating KV namespace..."
KV_OUTPUT=$(npx wrangler kv namespace create CACHE 2>&1 || true)
echo "$KV_OUTPUT"

KV_ID=$(echo "$KV_OUTPUT" | grep -oP 'id = "\K[^"]+' || echo "")

if [ -z "$KV_ID" ]; then
    echo "⚠️  Could not extract KV ID automatically."
    echo "   Check output above and add manually to wrangler.toml"
fi

echo ""
echo "📝 Updating wrangler.toml..."

cat > wrangler.toml << EOF
name = "tierjobs-api"
main = "src/index.ts"
compatibility_date = "2024-01-01"
compatibility_flags = ["nodejs_compat"]

# D1 Database
[[d1_databases]]
binding = "DB"
database_name = "tierjobs"
database_id = "$D1_ID"

# Workers AI
[ai]
binding = "AI"

# KV for caching
[[kv_namespaces]]
binding = "CACHE"
id = "${KV_ID:-REPLACE_WITH_KV_ID}"

# Durable Objects for user sessions
[[durable_objects.bindings]]
name = "USER_SESSION"
class_name = "UserSession"

[[migrations]]
tag = "v1"
new_classes = ["UserSession"]
EOF

echo "✅ wrangler.toml updated"
echo ""

# Run schema
echo "Running schema migration..."
npx wrangler d1 execute tierjobs --remote --file=./schema.sql

echo "✅ Schema created"
echo ""

echo "🎉 Setup complete!"
echo ""
echo "Next steps:"
echo "  1. Run migration: node scripts/migrate-from-convex.js"
echo "  2. Import data:"
echo "     npx wrangler d1 execute tierjobs --remote --file=./data/seed-companies.sql"
echo "     npx wrangler d1 execute tierjobs --remote --file=./data/seed-jobs.sql"
echo "  3. Deploy: npx wrangler deploy"
