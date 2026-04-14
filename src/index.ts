import { Hono } from 'hono';
import { logger } from 'hono/logger';
import { secureHeaders } from 'hono/secure-headers';

// Cloudflare Bindings Interface - strongly typed across your monorepo
export type Env = {
  Bindings: {
    DB?: D1Database;
    CACHE?: KVNamespace;
    ENVIRONMENT: string;
  };
};

const app = new Hono<Env>();

app.use('*', logger());
app.use('*', secureHeaders());

// Base API Path - Handled by Cloudflare Worker
const api = app.basePath('/api')
  .get('/telemetry', (c) => {
    // Return environment context injected by workerd (local) or edge node (prod)
    return c.json({
      status: 'operational',
      edgeLocation: c.req.header('cf-ray') ? c.req.header('cf-ray')?.split('-')[1] : 'Local (Vite/Workerd)',
      timestamp: new Date().toISOString(),
    });
  })
  .get('/database/stats', async (c) => {
    // Real D1 Database implementation pattern
    if (!c.env.DB) {
      return c.json({ 
        error: 'D1 not bound', 
        message: 'Uncomment d1_databases in wrangler.jsonc to activate bindings',
        mockData: [{ id: 1, query: 'SELECT * FROM users', ms: 14 }]
      });
    }

    try {
      // Example D1 Query
      // const { results } = await c.env.DB.prepare('SELECT count(*) as total FROM system_logs').all();
      return c.json({ status: 'connected', mockData: [] });
    } catch (error) {
      return c.json({ error: 'Database query failed' }, 500);
    }
  });

// Hono RPC Type Export - Enforces end-to-end type safety on the React client
export type AppType = typeof api;

export default app;
