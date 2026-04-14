import { Hono } from 'hono';

type Bindings = {
  ASSETS: Fetcher;
}

const app = new Hono<{ Bindings: Bindings }>();
const api = app.basePath('/api');

// Dynamic tool registry to populate the frontend sidebar
api.get('/tools', (c) => {
  return c.json([
    {
      id: 'json-formatter',
      name: 'JSON Formatter',
      description: 'Format, validate, and minify JSON payloads.',
      category: 'Data',
      path: '/tools/json-formatter'
    },
    {
      id: 'jwt-inspector',
      name: 'JWT Inspector',
      description: 'Decode and verify JWTs using browser-native APIs.',
      category: 'Security',
      path: '/tools/jwt-inspector'
    }
  ]);
});

api.all('*', (c) => c.json({ error: 'Endpoint not found' }, 404));

export default {
  fetch: app.fetch
};
