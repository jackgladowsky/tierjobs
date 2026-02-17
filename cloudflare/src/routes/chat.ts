/**
 * AI Chat Routes - Natural language job search
 * 
 * Uses Llama 3.3 on Workers AI for understanding user queries
 * and translating them to structured job searches.
 */

import { Hono } from 'hono';
import type { Env } from '../index';

export const chatRouter = new Hono<{ Bindings: Env }>();

// System prompt for the job search assistant
const SYSTEM_PROMPT = `You are TierJobs AI, an assistant that helps users find jobs at elite tech companies.

You have access to a database of jobs from top-tier companies (S+, S, A tiers). When users ask about jobs, you should:

1. Understand their query (role type, experience level, location preferences, company tier)
2. Return a JSON object with search parameters
3. Be conversational and helpful

Available filters:
- tier: "S+", "S", "S-", "A++", "A+", "A", "A-", "B+", "B", "B-"
- level: "intern", "new_grad", "junior", "mid", "senior", "staff", "principal", "director", "vp", "exec"
- jobType: "swe", "mle", "ds", "quant", "pm", "design", "devops", "security", "research"
- remote: true/false
- search: text search term

ALWAYS respond with valid JSON in this format:
{
  "message": "Your conversational response to the user",
  "filters": {
    "tier": "optional tier filter",
    "level": "optional level filter",
    "jobType": "optional type filter",
    "remote": true/false or null,
    "search": "optional search term"
  },
  "shouldSearch": true/false
}

Examples:
User: "Find me ML internships at top companies"
Response: {"message": "Looking for ML internships at elite companies! Let me find those for you.", "filters": {"level": "intern", "jobType": "mle", "tier": "S+"}, "shouldSearch": true}

User: "What's the difference between S and A tier?"
Response: {"message": "Great question! S-tier companies are the absolute elite...", "filters": {}, "shouldSearch": false}

User: "Remote SWE jobs for new grads"
Response: {"message": "Here are remote software engineering positions perfect for new graduates!", "filters": {"level": "new_grad", "jobType": "swe", "remote": true}, "shouldSearch": true}`;

// Chat endpoint
chatRouter.post('/', async (c) => {
  const db = c.env.DB;
  const ai = c.env.AI;
  
  const { message, sessionId, history = [] } = await c.req.json<{
    message: string;
    sessionId?: string;
    history?: { role: 'user' | 'assistant'; content: string }[];
  }>();
  
  if (!message) {
    return c.json({ error: 'Message is required' }, 400);
  }
  
  // Build conversation history for context
  const messages = [
    { role: 'system', content: SYSTEM_PROMPT },
    ...history.slice(-6), // Keep last 6 messages for context
    { role: 'user', content: message },
  ];
  
  try {
    // Call Llama 3.3 on Workers AI
    const response = await ai.run('@cf/meta/llama-3.3-70b-instruct-fp8-fast', {
      messages,
      max_tokens: 500,
      temperature: 0.7,
    });
    
    const aiResponse = (response as any).response;
    
    // Parse AI response
    let parsed;
    try {
      // Extract JSON from response (sometimes wrapped in markdown)
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsed = JSON.parse(jsonMatch[0]);
      } else {
        // Fallback if no JSON found
        parsed = {
          message: aiResponse,
          filters: {},
          shouldSearch: false,
        };
      }
    } catch {
      parsed = {
        message: aiResponse,
        filters: {},
        shouldSearch: false,
      };
    }
    
    // If we should search, execute the query
    let jobs: any[] = [];
    if (parsed.shouldSearch) {
      let query = 'SELECT * FROM jobs WHERE 1=1';
      const params: any[] = [];
      
      const filters = parsed.filters || {};
      
      if (filters.tier) {
        query += ' AND tier = ?';
        params.push(filters.tier);
      }
      if (filters.level) {
        query += ' AND level = ?';
        params.push(filters.level);
      }
      if (filters.jobType) {
        query += ' AND job_type = ?';
        params.push(filters.jobType);
      }
      if (filters.remote === true) {
        query += ' AND remote = 1';
      }
      if (filters.search) {
        // Use FTS
        const searchQuery = `
          SELECT jobs.* FROM jobs
          JOIN jobs_fts ON jobs.id = jobs_fts.rowid
          WHERE jobs_fts MATCH ?
        `;
        const searchParams = [filters.search + '*'];
        
        // Add other filters
        let searchFilters = '';
        if (filters.tier) { searchFilters += ' AND jobs.tier = ?'; searchParams.push(filters.tier); }
        if (filters.level) { searchFilters += ' AND jobs.level = ?'; searchParams.push(filters.level); }
        if (filters.jobType) { searchFilters += ' AND jobs.job_type = ?'; searchParams.push(filters.jobType); }
        if (filters.remote === true) { searchFilters += ' AND jobs.remote = 1'; }
        
        query = searchQuery + searchFilters + ' ORDER BY jobs.tier_score DESC LIMIT 10';
        params.length = 0;
        params.push(...searchParams);
      } else {
        query += ' ORDER BY tier_score DESC, scraped_at DESC LIMIT 10';
      }
      
      const result = await db.prepare(query).bind(...params).all();
      jobs = result.results || [];
    }
    
    // Save to chat history if session provided
    if (sessionId) {
      await db.prepare(`
        INSERT INTO chat_messages (session_id, role, content, metadata)
        VALUES (?, 'user', ?, NULL)
      `).bind(sessionId, message).run();
      
      await db.prepare(`
        INSERT INTO chat_messages (session_id, role, content, metadata)
        VALUES (?, 'assistant', ?, ?)
      `).bind(sessionId, parsed.message, JSON.stringify({ jobs: jobs.map(j => j.id) })).run();
    }
    
    return c.json({
      message: parsed.message,
      jobs,
      filters: parsed.filters,
      sessionId,
    });
    
  } catch (error) {
    console.error('AI Error:', error);
    return c.json({
      message: "I'm having trouble processing that. Try asking about specific roles like 'ML internships' or 'remote SWE jobs'.",
      jobs: [],
      error: true,
    });
  }
});

// Get chat history for a session
chatRouter.get('/history/:sessionId', async (c) => {
  const db = c.env.DB;
  const sessionId = c.req.param('sessionId');
  const limit = Math.min(parseInt(c.req.query('limit') || '50'), 100);
  
  const result = await db.prepare(`
    SELECT * FROM chat_messages
    WHERE session_id = ?
    ORDER BY created_at DESC
    LIMIT ?
  `).bind(sessionId, limit).all();
  
  return c.json(result.results?.reverse() || []);
});

// Quick suggestions endpoint
chatRouter.get('/suggestions', async (c) => {
  return c.json({
    suggestions: [
      "Find me ML internships at S-tier companies",
      "Remote SWE jobs for new grads",
      "What are the top-paying roles?",
      "Show me Anthropic jobs",
      "Backend engineer positions at startups",
      "Which companies are hiring the most?",
    ],
  });
});
