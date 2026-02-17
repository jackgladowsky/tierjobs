import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { api } from "./_generated/api";

const http = httpRouter();

// Helper to convert null values to undefined for Convex
function stripNulls<T extends Record<string, unknown>>(obj: T): T {
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value !== null) {
      result[key] = value;
    }
  }
  return result as T;
}

// Health check
http.route({
  path: "/health",
  method: "GET",
  handler: httpAction(async () => {
    return new Response(JSON.stringify({ status: "ok" }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }),
});

// Bulk upsert jobs from scraper
http.route({
  path: "/jobs/bulk",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    try {
      const body = await request.json();
      const jobs = body.jobs;

      if (!Array.isArray(jobs)) {
        return new Response(JSON.stringify({ error: "jobs must be an array" }), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        });
      }

      // Strip null values from each job (Convex expects undefined for optional)
      const cleanedJobs = jobs.map(stripNulls);

      const result = await ctx.runMutation(api.jobs.bulkUpsert, { jobs: cleanedJobs });

      return new Response(JSON.stringify(result), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } catch (error) {
      return new Response(
        JSON.stringify({ error: String(error) }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }
  }),
});

// Upsert single job
http.route({
  path: "/jobs",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    try {
      const job = await request.json();
      const cleanedJob = stripNulls(job);
      const result = await ctx.runMutation(api.jobs.upsert, cleanedJob);

      return new Response(JSON.stringify(result), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } catch (error) {
      return new Response(
        JSON.stringify({ error: String(error) }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }
  }),
});

// Upsert company
http.route({
  path: "/companies",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    try {
      const company = await request.json();
      const result = await ctx.runMutation(api.companies.upsert, company);

      return new Response(JSON.stringify(result), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } catch (error) {
      return new Response(
        JSON.stringify({ error: String(error) }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }
  }),
});

// Bulk upsert companies
http.route({
  path: "/companies/bulk",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    try {
      const body = await request.json();
      const companies = body.companies;

      if (!Array.isArray(companies)) {
        return new Response(JSON.stringify({ error: "companies must be an array" }), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        });
      }

      const cleanedCompanies = companies.map(stripNulls);
      const result = await ctx.runMutation(api.companies.bulkUpsert, { companies: cleanedCompanies });

      return new Response(JSON.stringify(result), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } catch (error) {
      return new Response(
        JSON.stringify({ error: String(error) }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }
  }),
});

// Update company job count after scrape
http.route({
  path: "/companies/job-count",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    try {
      const body = await request.json();
      const result = await ctx.runMutation(api.companies.updateJobCount, body);

      return new Response(JSON.stringify(result), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } catch (error) {
      return new Response(
        JSON.stringify({ error: String(error) }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }
  }),
});

export default http;
