import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

// Enums as string unions
export const jobLevelValidator = v.union(
  v.literal("intern"),
  v.literal("new_grad"),
  v.literal("junior"),
  v.literal("mid"),
  v.literal("senior"),
  v.literal("staff"),
  v.literal("principal"),
  v.literal("director"),
  v.literal("vp"),
  v.literal("exec"),
  v.literal("unknown")
);

export const jobTypeValidator = v.union(
  v.literal("swe"),
  v.literal("mle"),
  v.literal("ds"),
  v.literal("quant"),
  v.literal("pm"),
  v.literal("design"),
  v.literal("devops"),
  v.literal("security"),
  v.literal("research"),
  v.literal("other")
);

export default defineSchema({
  jobs: defineTable({
    // Primary identifier (company_slug + job_id)
    jobId: v.string(),
    
    // Company info
    company: v.string(),
    companySlug: v.string(),
    tier: v.string(),
    tierScore: v.number(),
    
    // Job details
    title: v.string(),
    url: v.string(),
    location: v.optional(v.string()),
    remote: v.boolean(),
    
    // Classification
    level: jobLevelValidator,
    jobType: jobTypeValidator,
    team: v.optional(v.string()),
    
    // Content
    description: v.optional(v.string()),
    
    // Compensation
    salaryMin: v.optional(v.number()),
    salaryMax: v.optional(v.number()),
    
    // Timestamps
    postedAt: v.optional(v.number()), // Unix timestamp
    scrapedAt: v.number(), // Unix timestamp
    
    // Computed prestige score
    score: v.optional(v.number()),
  })
    .index("by_jobId", ["jobId"])
    .index("by_company", ["companySlug"])
    .index("by_tier", ["tier"])
    .index("by_level", ["level"])
    .index("by_jobType", ["jobType"])
    .index("by_score", ["score"])
    .searchIndex("search_title", {
      searchField: "title",
      filterFields: ["tier", "level", "jobType", "companySlug"],
    }),

  companies: defineTable({
    name: v.string(),
    slug: v.string(),
    domain: v.string(),
    careersUrl: v.optional(v.string()),
    tier: v.string(),
    tierScore: v.number(),
    lastScraped: v.optional(v.number()), // Unix timestamp
    jobCount: v.number(),
  })
    .index("by_slug", ["slug"])
    .index("by_tier", ["tier"])
    .index("by_tierScore", ["tierScore"]),
});
