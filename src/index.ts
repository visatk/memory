import { Hono } from 'hono';
import { secureHeaders } from 'hono/secure-headers';
import { drizzle } from 'drizzle-orm/d1';
import { eq, desc } from 'drizzle-orm';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { threads, replies } from './db/schema';

type Bindings = {
  ASSETS: Fetcher;
  DB: D1Database; 
}

const app = new Hono<{ Bindings: Bindings }>();

// Enterprise security headers
app.use('*', secureHeaders());

const api = app.basePath('/api');

// --- Dev Tools Meta ---
api.get('/tools-meta', (c) => {
  return c.json({
    tools: [
      { id: 'test-cards', name: 'Credit Card Generator', path: '/test-cards' },
      { id: 'fake-address', name: 'Fake Address Generator', path: '/fake-address' },
      { id: 'forum', name: 'Developer Forum', path: '/forum' }
    ],
    updatedAt: new Date().toISOString()
  });
});

// --- Zod Schemas for API Validation ---
const createThreadSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters").max(100),
  content: z.string().min(10, "Content must be at least 10 characters").max(5000),
  author: z.string().max(50).optional(),
});

const createReplySchema = z.object({
  content: z.string().min(2, "Reply is too short").max(2000),
  author: z.string().max(50).optional(),
});

// --- Forum API ---

// 1. Get all threads (Optimized with LIMIT)
api.get('/forum/threads', async (c) => {
  const db = drizzle(c.env.DB);
  // Infrastructure fix: Never pull an entire table in production.
  const allThreads = await db.select().from(threads).orderBy(desc(threads.createdAt)).limit(50);
  return c.json(allThreads);
});

// 2. Create a new thread (Secured with Zod)
api.post('/forum/threads', zValidator('json', createThreadSchema), async (c) => {
  const db = drizzle(c.env.DB);
  const { title, content, author } = c.req.valid('json');

  const result = await db.insert(threads).values({
    title,
    content,
    author: author || 'Anonymous Developer'
  }).returning();

  return c.json(result[0], 201);
});

// 3. Get a specific thread with its replies
api.get('/forum/threads/:id', async (c) => {
  const db = drizzle(c.env.DB);
  const threadId = parseInt(c.req.param('id'));

  if (isNaN(threadId)) return c.json({ error: 'Invalid thread ID' }, 400);

  const thread = await db.select().from(threads).where(eq(threads.id, threadId)).get();
  if (!thread) return c.json({ error: 'Thread not found' }, 404);

  // Limit replies to prevent payload bloat
  const threadReplies = await db.select().from(replies).where(eq(replies.threadId, threadId)).orderBy(replies.createdAt).limit(100);

  return c.json({ ...thread, replies: threadReplies });
});

// 4. Post a reply (Secured with Zod)
api.post('/forum/threads/:id/replies', zValidator('json', createReplySchema), async (c) => {
  const db = drizzle(c.env.DB);
  const threadId = parseInt(c.req.param('id'));
  
  if (isNaN(threadId)) return c.json({ error: 'Invalid thread ID' }, 400);
  
  const { content, author } = c.req.valid('json');

  const result = await db.insert(replies).values({
    threadId,
    content,
    author: author || 'Anonymous Developer'
  }).returning();

  return c.json(result[0], 201);
});

api.all('*', (c) => c.json({ error: 'Endpoint not found' }, 404));

export default {
  fetch: app.fetch
};
