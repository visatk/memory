import { Hono } from 'hono';
import { secureHeaders } from 'hono/secure-headers';

type Bindings = {
  ASSETS: Fetcher;
}

const app = new Hono<{ Bindings: Bindings }>();

// Security headers for SEO and Trust
app.use('*', secureHeaders());

const api = app.basePath('/api');

// Expose tool metadata for programmatic SEO sitemaps or external directories
api.get('/tools-meta', (c) => {
  return c.json({
    tools: [
      { id: 'test-cards', name: 'Credit Card Generator', path: '/test-cards' },
      { id: 'fake-address', name: 'Fake Address Generator', path: '/fake-address' }
    ],
    updatedAt: new Date().toISOString()
  });
});

api.all('*', (c) => c.json({ error: 'Endpoint not found' }, 404));

export default {
  fetch: app.fetch
};
