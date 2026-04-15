import { Hono } from 'hono';
import { secureHeaders } from 'hono/secure-headers';
import { drizzle } from 'drizzle-orm/d1';
import { eq, desc, like, and } from 'drizzle-orm';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { threads, replies } from './db/schema';

type Bindings = {
  ASSETS: Fetcher;
  DB: D1Database; 
}

const app = new Hono<{ Bindings: Bindings }>();
app.use('*', secureHeaders());

const api = app.basePath('/api');

// --- Zod Validation Schemas ---
const createThreadSchema = z.object({
  title: z.string().min(5).max(150),
  content: z.string().min(10).max(10000),
  category: z.string().min(2).max(30),
  author: z.string().max(50).optional(),
});

const createReplySchema = z.object({
  content: z.string().min(2).max(5000),
  author: z.string().max(50).optional(),
});

// --- Advanced Forum API ---

// 1. Get Threads (With Search & Category Filtering)
api.get('/forum/threads', async (c) => {
  const db = drizzle(c.env.DB);
  const searchQuery = c.req.query('q');
  const categoryFilter = c.req.query('category');

  let conditions = [];
  if (searchQuery) conditions.push(like(threads.title, `%${searchQuery}%`));
  if (categoryFilter && categoryFilter !== 'all') conditions.push(eq(threads.category, categoryFilter));

  const query = db.select().from(threads);
  const finalQuery = conditions.length > 0 
    ? query.where(and(...conditions)).orderBy(desc(threads.createdAt)).limit(50)
    : query.orderBy(desc(threads.createdAt)).limit(50);

  const results = await finalQuery;
  return c.json(results);
});

// 2. Create Thread
api.post('/forum/threads', zValidator('json', createThreadSchema), async (c) => {
  const db = drizzle(c.env.DB);
  const { title, content, category, author } = c.req.valid('json');

  const result = await db.insert(threads).values({
    title, content, category,
    author: author || 'Anonymous Developer'
  }).returning();

  return c.json(result[0], 201);
});

// 3. Get Thread Details (Auto-increments views)
api.get('/forum/threads/:id', async (c) => {
  const db = drizzle(c.env.DB);
  const threadId = parseInt(c.req.param('id'));
  if (isNaN(threadId)) return c.json({ error: 'Invalid ID' }, 400);

  const thread = await db.select().from(threads).where(eq(threads.id, threadId)).get();
  if (!thread) return c.json({ error: 'Thread not found' }, 404);

  // Background view increment
  c.executionCtx.waitUntil(
    db.update(threads).set({ views: thread.views + 1 }).where(eq(threads.id, threadId)).execute()
  );

  const threadReplies = await db.select().from(replies).where(eq(replies.threadId, threadId)).orderBy(replies.createdAt).limit(200);
  return c.json({ ...thread, replies: threadReplies });
});

// 4. Post Reply
api.post('/forum/threads/:id/replies', zValidator('json', createReplySchema), async (c) => {
  const db = drizzle(c.env.DB);
  const threadId = parseInt(c.req.param('id'));
  if (isNaN(threadId)) return c.json({ error: 'Invalid ID' }, 400);
  
  const { content, author } = c.req.valid('json');
  const result = await db.insert(replies).values({
    threadId, content,
    author: author || 'Anonymous Developer'
  }).returning();

  return c.json(result[0], 201);
});

// 5. Voting System (Atomic upvotes)
api.post('/forum/vote/:type/:id', async (c) => {
  const db = drizzle(c.env.DB);
  const id = parseInt(c.req.param('id'));
  const type = c.req.param('type'); // 'thread' or 'reply'
  
  if (isNaN(id)) return c.json({ error: 'Invalid ID' }, 400);

  if (type === 'thread') {
    const thread = await db.select().from(threads).where(eq(threads.id, id)).get();
    if (!thread) return c.json({ error: 'Not found' }, 404);
    await db.update(threads).set({ upvotes: thread.upvotes + 1 }).where(eq(threads.id, id));
  } else if (type === 'reply') {
    const reply = await db.select().from(replies).where(eq(replies.id, id)).get();
    if (!reply) return c.json({ error: 'Not found' }, 404);
    await db.update(replies).set({ upvotes: reply.upvotes + 1 }).where(eq(replies.id, id));
  } else {
    return c.json({ error: 'Invalid type' }, 400);
  }

  return c.json({ success: true });
});

api.all('*', (c) => c.json({ error: 'Endpoint not found' }, 404));

export default { fetch: app.fetch };
