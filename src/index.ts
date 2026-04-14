import { Hono } from 'hono';
import { secureHeaders } from 'hono/secure-headers';
import { drizzle } from 'drizzle-orm/d1';
import { eq, desc } from 'drizzle-orm';
import { threads, replies } from './db/schema';

type Bindings = {
  ASSETS: Fetcher;
  DB: D1Database; // From your wrangler.jsonc
}

const app = new Hono<{ Bindings: Bindings }>();

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

// --- Forum API ---
// 1. Get all threads
api.get('/forum/threads', async (c) => {
  const db = drizzle(c.env.DB);
  const allThreads = await db.select().from(threads).orderBy(desc(threads.createdAt));
  return c.json(allThreads);
});

// 2. Create a new thread
api.post('/forum/threads', async (c) => {
  const db = drizzle(c.env.DB);
  const { title, content, author } = await c.req.json();
  
  if (!title || !content) return c.json({ error: 'Title and content required' }, 400);

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

  const thread = await db.select().from(threads).where(eq(threads.id, threadId)).get();
  if (!thread) return c.json({ error: 'Thread not found' }, 404);

  const threadReplies = await db.select().from(replies).where(eq(replies.threadId, threadId)).orderBy(replies.createdAt);

  return c.json({ ...thread, replies: threadReplies });
});

// 4. Post a reply
api.post('/forum/threads/:id/replies', async (c) => {
  const db = drizzle(c.env.DB);
  const threadId = parseInt(c.req.param('id'));
  const { content, author } = await c.req.json();

  if (!content) return c.json({ error: 'Content required' }, 400);

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
