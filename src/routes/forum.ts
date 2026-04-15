import { Hono } from 'hono';
import { drizzle } from 'drizzle-orm/d1';
import { eq, desc, like, and } from 'drizzle-orm';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { threads, replies } from '../../db/schema';
import { requireAuth } from './auth';

export const forumRouter = new Hono<{ Bindings: { DB: D1Database }, Variables: { user: any } }>();

// Public Routes (Reading)
forumRouter.get('/threads', async (c) => {
  const db = drizzle(c.env.DB);
  return c.json(await db.select().from(threads).orderBy(desc(threads.createdAt)).limit(50));
});

forumRouter.get('/threads/:id', async (c) => {
  const db = drizzle(c.env.DB);
  const threadId = parseInt(c.req.param('id'));
  const thread = await db.select().from(threads).where(eq(threads.id, threadId)).get();
  if (!thread) return c.json({ error: 'Not found' }, 404);
  
  c.executionCtx.waitUntil(db.update(threads).set({ views: thread.views + 1 }).where(eq(threads.id, threadId)).execute());
  const threadReplies = await db.select().from(replies).where(eq(replies.threadId, threadId)).orderBy(replies.createdAt);
  return c.json({ ...thread, replies: threadReplies });
});

// Protected Routes (Writing)
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
