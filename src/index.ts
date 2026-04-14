import { Hono } from 'hono';
import { randomBytes, createHash } from 'node:crypto';
import { Buffer } from 'node:buffer';

type Bindings = {
  ASSETS: Fetcher;
};

const app = new Hono<{ Bindings: Bindings }>();
const api = app.basePath('/api');

api.get('/system-metrics', async (c) => {
  // 1. Node.js Compatibility APIs: node:crypto and node:buffer
  // Generating a secure random token directly at the edge
  const rawBytes = randomBytes(16);
  const hexToken = Buffer.from(rawBytes).toString('hex');
  const secureHash = createHash('sha256').update(hexToken).digest('hex');

  // 2. Cloudflare Runtime API: ExecutionContext (waitUntil)
  // Non-blocking background task that completes AFTER the response is sent
  c.executionCtx.waitUntil(
    new Promise(resolve => setTimeout(() => {
        console.log(`[Background Task] Processed metrics for token: ${hexToken}`);
        resolve(true);
    }, 500))
  );

  // 3. Cloudflare Runtime API: Native Cache API
  // Leveraging edge caching without hitting external databases
  const cache = caches.default;
  const cacheKey = new Request(new URL('/api/metrics/cache-store', c.req.url).toString());
  
  let cachedResponse = await cache.match(cacheKey);
  let cacheStatus = "HIT";

  if (!cachedResponse) {
    cacheStatus = "MISS";
    const cacheData = JSON.stringify({ cachedAt: new Date().toISOString() });
    
    // Create a new response to store in the cache for 30 seconds
    cachedResponse = new Response(cacheData, {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 's-maxage=30' 
      }
    });
    
    // Store in cache without blocking the main request thread
    c.executionCtx.waitUntil(cache.put(cacheKey, cachedResponse.clone()));
  }

  const { cachedAt } = await cachedResponse.json();

  return c.json({
    status: 'operational',
    nodeCryptoHash: secureHash.substring(0, 16) + '...',
    cache: {
      status: cacheStatus,
      timestamp: cachedAt
    },
    systemTime: new Date().toISOString()
  });
});

// Fallback for API routes to prevent React Router from catching bad API calls
api.all('*', (c) => c.json({ error: 'Endpoint not found' }, 404));

export default {
  fetch: app.fetch
};
