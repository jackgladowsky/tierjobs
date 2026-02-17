import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Company document type for upserts
const companyInput = {
  name: v.string(),
  slug: v.string(),
  domain: v.string(),
  careersUrl: v.optional(v.string()),
  tier: v.string(),
  tierScore: v.number(),
  lastScraped: v.optional(v.number()),
  jobCount: v.number(),
};

// Upsert a company
export const upsert = mutation({
  args: companyInput,
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("companies")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, args);
      return { id: existing._id, action: "updated" as const };
    } else {
      const id = await ctx.db.insert("companies", args);
      return { id, action: "created" as const };
    }
  },
});

// Bulk upsert companies
export const bulkUpsert = mutation({
  args: { companies: v.array(v.object(companyInput)) },
  handler: async (ctx, args) => {
    const results = { created: 0, updated: 0 };

    for (const company of args.companies) {
      const existing = await ctx.db
        .query("companies")
        .withIndex("by_slug", (q) => q.eq("slug", company.slug))
        .first();

      if (existing) {
        await ctx.db.patch(existing._id, company);
        results.updated++;
      } else {
        await ctx.db.insert("companies", company);
        results.created++;
      }
    }

    return results;
  },
});

// List all companies
export const list = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 100;
    return await ctx.db
      .query("companies")
      .withIndex("by_tierScore")
      .order("desc")
      .take(limit);
  },
});

// Get companies by tier
export const byTier = query({
  args: { tier: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("companies")
      .withIndex("by_tier", (q) => q.eq("tier", args.tier))
      .order("desc")
      .collect();
  },
});

// Get a single company by slug
export const get = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("companies")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();
  },
});

// Update job count for a company
export const updateJobCount = mutation({
  args: {
    slug: v.string(),
    jobCount: v.number(),
    lastScraped: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const company = await ctx.db
      .query("companies")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();

    if (company) {
      const update: { jobCount: number; lastScraped?: number } = {
        jobCount: args.jobCount,
      };
      if (args.lastScraped) {
        update.lastScraped = args.lastScraped;
      }
      await ctx.db.patch(company._id, update);
      return { updated: true };
    }
    return { updated: false };
  },
});

// Get company stats
export const stats = query({
  args: {},
  handler: async (ctx) => {
    const companies = await ctx.db.query("companies").collect();
    
    const byTier: Record<string, number> = {};
    let totalJobs = 0;
    
    for (const c of companies) {
      byTier[c.tier] = (byTier[c.tier] || 0) + 1;
      totalJobs += c.jobCount;
    }
    
    return {
      totalCompanies: companies.length,
      totalJobs,
      byTier,
    };
  },
});
