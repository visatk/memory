import { Hono } from 'hono';
import { drizzle } from 'drizzle-orm/d1';
import { eq, desc, like, or, and } from 'drizzle-orm';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { threads, replies } from '../db/schema';
import { requireAuth } from './auth';

export const forumRouter = new Hono<{ Bindings: { DB: D1Database }, Variables: { user: any } }>();

// Read Threads with dynamic query filtering for frontend searches
forumRouter.get('/threads', async (c) => {
  const db = drizzle(c.env.DB);
  const q = c.req.query('q');
  const category = c.req.query('category');

  const conditions = [];

  if (category && category !== 'all') {
    conditions.push(eq(threads.category, category));
  }
  
  if (q) {
    conditions.push(
      or(
        like(threads.title, `%${q}%`),
        like(threads.content, `%${q}%`)
      )
    );
  }

  let query: any = db.select().from(threads);
  
  if (conditions.length > 0) {
    query = db.select().from(threads).where(and(...conditions));
  }

  return c.json(await query.orderBy(desc(threads.createdAt)).limit(50).execute());
});

forumRouter.get('/threads/:id', async (c) => {
  const db = drizzle(c.env.DB);
  const threadId = parseInt(c.req.param('id'));
  const thread = await db.select().from(threads).where(eq(threads.id, threadId)).get();
  
  if (!thread) return c.json({ error: 'Not found' }, 404);
  
  // Non-blocking background analytics update
  c.executionCtx.waitUntil(
    db.update(threads).set({ views: thread.views + 1 }).where(eq(threads.id, threadId)).execute()
  );
  
  const threadReplies = await db.select().from(replies).where(eq(replies.threadId, threadId)).orderBy(replies.createdAt);
  return c.json({ ...thread, replies: threadReplies });
});

// Writing logic
forumRouter.post('/threads', requireAuth, zValidator('json', z.object({ title: z.string(), content: z.string(), category: z.string() })), async (c) => {
  const db = drizzle(c.env.DB);
  const user = c.get('user');
  const { title, content, category } = c.req.valid('json');

  const result = await db.insert(threads).values({ title, content, category, authorId: user.id, author: user.username }).returning();
  return c.json(result[0], 201);
});

forumRouter.post('/threads/:id/replies', requireAuth, zValidator('json', z.object({ content: z.string() })), async (c) => {
  const db = drizzle(c.env.DB);
  const user = c.get('user');
  const threadId = parseInt(c.req.param('id'));
  const { content } = c.req.valid('json');

  const result = await db.insert(replies).values({ threadId, content, authorId: user.id, author: user.username }).returning();
  return c.json(result[0], 201);
});

// Implement missing Vote Route
forumRouter.post('/vote/:type/:id', async (c) => {
  const db = drizzle(c.env.DB);
  const type = c.req.param('type');
  const id = parseInt(c.req.param('id'));

  if (type === 'thread') {
    const thread = await db.select().from(threads).where(eq(threads.id, id)).get();
    if (thread) await db.update(threads).set({ upvotes: thread.upvotes + 1 }).where(eq(threads.id, id)).execute();
  } else if (type === 'reply') {
    const reply = await db.select().from(replies).where(eq(replies.id, id)).get();
    if (reply) await db.update(replies).set({ upvotes: reply.upvotes + 1 }).where(eq(replies.id, id)).execute();
  }
  
  return c.json({ success: true });
});
