/**
 * TierJobs API - Cloudflare Workers
 * 
 * AI-powered job board for elite tech companies
 * Built for Cloudflare internship application
 */

import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { UserSession } from './durable-objects/user-session';
import { jobsRouter } from './routes/jobs';
import { companiesRouter } from './routes/companies';
import { chatRouter } from './routes/chat';
import { statsRouter } from './routes/stats';

export { UserSession };

export interface Env {
  DB: D1Database;
  AI: Ai;
  CACHE: KVNamespace;
  USER_SESSION: DurableObjectNamespace;
}

const app = new Hono<{ Bindings: Env }>();

// CORS for frontend
app.use('*', cors({
  origin: ['http://localhost:3000', 'http://localhost:3001', 'https://tierjobs.com', 'https://tierjobs.pages.dev'],
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
}));

// Health check
app.get('/', (c) => {
  return c.json({
    name: 'TierJobs API',
    version: '1.0.0',
    status: 'healthy',
    features: ['jobs', 'companies', 'ai-chat', 'search'],
  });
});

// Mount routers
app.route('/api/jobs', jobsRouter);
app.route('/api/companies', companiesRouter);
app.route('/api/chat', chatRouter);
app.route('/api/stats', statsRouter);

// 404 handler
app.notFound((c) => {
  return c.json({ error: 'Not found' }, 404);
});

// Error handler
app.onError((err, c) => {
  console.error('API Error:', err);
  return c.json({ error: err.message || 'Internal server error' }, 500);
});

export default app;
