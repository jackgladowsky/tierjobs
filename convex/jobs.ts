import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { paginationOptsValidator } from "convex/server";
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
    const baseQuery = ctx.db.query("jobs");

    // Build query with appropriate index
    let jobs;
    if (args.tier) {
      jobs = await baseQuery
        .withIndex("by_tier", (q) => q.eq("tier", args.tier!))
        .order("desc")
        .take(limit * 2);
    } else if (args.level) {
      jobs = await baseQuery
        .withIndex("by_level", (q) => q.eq("level", args.level!))
        .order("desc")
        .take(limit * 2);
    } else if (args.jobType) {
      jobs = await baseQuery
        .withIndex("by_jobType", (q) => q.eq("jobType", args.jobType!))
        .order("desc")
        .take(limit * 2);
    } else {
      // Default: order by score descending
      jobs = await baseQuery
        .withIndex("by_score")
        .order("desc")
        .take(limit * 2);
    }

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

// Get a single job by Convex _id
export const getById = query({
  args: { id: v.id("jobs") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
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

// Paginated list for infinite scroll
export const listPaginated = query({
  args: {
    tier: v.optional(v.string()),
    level: v.optional(jobLevelValidator),
    jobType: v.optional(jobTypeValidator),
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, args) => {
    let query = ctx.db.query("jobs");
    
    // Use the most selective index first, then filter for additional criteria
    if (args.tier) {
      // Start with tier index
      let tierQuery = query.withIndex("by_tier", (q) => q.eq("tier", args.tier!));
      
      // Apply additional filters if present
      if (args.level && args.jobType) {
        return await tierQuery
          .filter((q) => q.and(
            q.eq(q.field("level"), args.level!),
            q.eq(q.field("jobType"), args.jobType!)
          ))
          .order("desc")
          .paginate(args.paginationOpts);
      } else if (args.level) {
        return await tierQuery
          .filter((q) => q.eq(q.field("level"), args.level!))
          .order("desc")
          .paginate(args.paginationOpts);
      } else if (args.jobType) {
        return await tierQuery
          .filter((q) => q.eq(q.field("jobType"), args.jobType!))
          .order("desc")
          .paginate(args.paginationOpts);
      }
      
      return await tierQuery.order("desc").paginate(args.paginationOpts);
    } else if (args.level) {
      // Start with level index
      let levelQuery = query.withIndex("by_level", (q) => q.eq("level", args.level!));
      
      if (args.jobType) {
        return await levelQuery
          .filter((q) => q.eq(q.field("jobType"), args.jobType!))
          .order("desc")
          .paginate(args.paginationOpts);
      }
      
      return await levelQuery.order("desc").paginate(args.paginationOpts);
    } else if (args.jobType) {
      return await query
        .withIndex("by_jobType", (q) => q.eq("jobType", args.jobType!))
        .order("desc")
        .paginate(args.paginationOpts);
    }
    
    return await query.order("desc").paginate(args.paginationOpts);
  },
});

// Count jobs (useful for stats)
export const count = query({
  args: { tier: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const baseQuery = ctx.db.query("jobs");
    if (args.tier) {
      const jobs = await baseQuery
        .withIndex("by_tier", (qb) => qb.eq("tier", args.tier!))
        .collect();
      return jobs.length;
    }
    const jobs = await baseQuery.collect();
    return jobs.length;
  },
});

// Count jobs by level (for stats)
export const countByLevel = query({
  handler: async (ctx) => {
    const jobs = await ctx.db.query("jobs").collect();
    const counts: Record<string, number> = {
      intern: 0,
      new_grad: 0,
      junior: 0,
      mid: 0,
      senior: 0,
      staff: 0,
      principal: 0,
      director: 0,
      vp: 0,
      exec: 0,
      unknown: 0,
    };
    
    for (const job of jobs) {
      if (job.level in counts) {
        counts[job.level]++;
      }
    }
    
    return counts;
  },
});

// Get featured/trending jobs (high tier + recent)
export const featured = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 10;
    
    // Get high tier jobs first (S+, S)
    const jobs = await ctx.db
      .query("jobs")
      .order("desc")
      .collect();
    
    // Sort by tier score + recency
    const sorted = jobs.sort((a, b) => {
      // Tier score is primary (higher = better)
      const tierDiff = (b.tierScore || 0) - (a.tierScore || 0);
      if (tierDiff !== 0) return tierDiff;
      // Then by scraped date (more recent = better)
      return (b.scrapedAt || 0) - (a.scrapedAt || 0);
    });
    
    return sorted.slice(0, limit);
  },
});

// Get top companies by job count
export const topCompanies = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 10;
    const jobs = await ctx.db.query("jobs").collect();
    
    // Count jobs per company
    const companyCounts: Record<string, { 
      count: number; 
      company: string; 
      tier: string; 
      tierScore: number;
    }> = {};
    
    for (const job of jobs) {
      if (!companyCounts[job.companySlug]) {
        companyCounts[job.companySlug] = {
          count: 0,
          company: job.company,
          tier: job.tier,
          tierScore: job.tierScore,
        };
      }
      companyCounts[job.companySlug].count++;
    }
    
    // Sort by tier score, then by count
    return Object.entries(companyCounts)
      .map(([slug, data]) => ({ slug, ...data }))
      .sort((a, b) => {
        const tierDiff = b.tierScore - a.tierScore;
        if (tierDiff !== 0) return tierDiff;
        return b.count - a.count;
      })
      .slice(0, limit);
  },
});
