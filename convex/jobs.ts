import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { jobLevelValidator, jobTypeValidator } from "./schema";

// Job document type for upserts
const jobInput = {
  jobId: v.string(),
  company: v.string(),
  companySlug: v.string(),
  tier: v.string(),
  tierScore: v.number(),
  title: v.string(),
  url: v.string(),
  location: v.optional(v.string()),
  remote: v.boolean(),
  level: jobLevelValidator,
  jobType: jobTypeValidator,
  team: v.optional(v.string()),
  description: v.optional(v.string()),
  salaryMin: v.optional(v.number()),
  salaryMax: v.optional(v.number()),
  postedAt: v.optional(v.number()),
  scrapedAt: v.number(),
  score: v.optional(v.number()),
};

// Upsert a single job
export const upsert = mutation({
  args: jobInput,
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("jobs")
      .withIndex("by_jobId", (q) => q.eq("jobId", args.jobId))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, args);
      return { id: existing._id, action: "updated" as const };
    } else {
      const id = await ctx.db.insert("jobs", args);
      return { id, action: "created" as const };
    }
  },
});

// Bulk upsert jobs
export const bulkUpsert = mutation({
  args: { jobs: v.array(v.object(jobInput)) },
  handler: async (ctx, args) => {
    const results = { created: 0, updated: 0 };

    for (const job of args.jobs) {
      const existing = await ctx.db
        .query("jobs")
        .withIndex("by_jobId", (q) => q.eq("jobId", job.jobId))
        .first();

      if (existing) {
        await ctx.db.patch(existing._id, job);
        results.updated++;
      } else {
        await ctx.db.insert("jobs", job);
        results.created++;
      }
    }

    return results;
  },
});

// List jobs with filters
export const list = query({
  args: {
    tier: v.optional(v.string()),
    level: v.optional(jobLevelValidator),
    jobType: v.optional(jobTypeValidator),
    location: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 50;
    let jobsQuery = ctx.db.query("jobs");

    // Apply index-based filters
    if (args.tier) {
      jobsQuery = jobsQuery.withIndex("by_tier", (q) => q.eq("tier", args.tier!));
    } else if (args.level) {
      jobsQuery = jobsQuery.withIndex("by_level", (q) => q.eq("level", args.level!));
    } else if (args.jobType) {
      jobsQuery = jobsQuery.withIndex("by_jobType", (q) => q.eq("jobType", args.jobType!));
    } else {
      // Default: order by score descending
      jobsQuery = jobsQuery.withIndex("by_score");
    }

    let jobs = await jobsQuery.order("desc").take(limit * 2);

    // Apply remaining filters in memory
    if (args.tier && args.level) {
      jobs = jobs.filter((j) => j.level === args.level);
    }
    if (args.tier && args.jobType) {
      jobs = jobs.filter((j) => j.jobType === args.jobType);
    }
    if (args.location) {
      const loc = args.location.toLowerCase();
      jobs = jobs.filter((j) => j.location?.toLowerCase().includes(loc));
    }

    return jobs.slice(0, limit);
  },
});

// Get jobs by company
export const byCompany = query({
  args: { companySlug: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("jobs")
      .withIndex("by_company", (q) => q.eq("companySlug", args.companySlug))
      .order("desc")
      .collect();
  },
});

// Full-text search by title
export const search = query({
  args: {
    query: v.string(),
    tier: v.optional(v.string()),
    level: v.optional(jobLevelValidator),
    jobType: v.optional(jobTypeValidator),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 20;
    
    let searchQuery = ctx.db
      .query("jobs")
      .withSearchIndex("search_title", (q) => {
        let sq = q.search("title", args.query);
        if (args.tier) sq = sq.eq("tier", args.tier);
        if (args.level) sq = sq.eq("level", args.level);
        if (args.jobType) sq = sq.eq("jobType", args.jobType);
        return sq;
      });

    return await searchQuery.take(limit);
  },
});

// Get a single job by jobId
export const get = query({
  args: { jobId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("jobs")
      .withIndex("by_jobId", (q) => q.eq("jobId", args.jobId))
      .first();
  },
});

// Delete a job by jobId
export const remove = mutation({
  args: { jobId: v.string() },
  handler: async (ctx, args) => {
    const job = await ctx.db
      .query("jobs")
      .withIndex("by_jobId", (q) => q.eq("jobId", args.jobId))
      .first();
    
    if (job) {
      await ctx.db.delete(job._id);
      return { deleted: true };
    }
    return { deleted: false };
  },
});

// Count jobs (useful for stats)
export const count = query({
  args: { tier: v.optional(v.string()) },
  handler: async (ctx, args) => {
    let q = ctx.db.query("jobs");
    if (args.tier) {
      q = q.withIndex("by_tier", (qb) => qb.eq("tier", args.tier!));
    }
    const jobs = await q.collect();
    return jobs.length;
  },
});
