import { Hono } from 'hono';
import { drizzle } from 'drizzle-orm/d1';
import { eq, desc, like, or, and, sql } from 'drizzle-orm';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { threads, replies } from '../db/schema';
import { requireAuth } from './auth';

export const forumRouter = new Hono<{ Bindings: { DB: D1Database }, Variables: { user: any } }>();

// Middleware to check elevated permissions
const requireModerator = async (c: any, next: any) => {
  const user = c.get('user');
  if (user.role !== 'admin' && user.role !== 'moderator') {
    return c.json({ error: 'Forbidden: Insufficient permissions' }, 403);
  }
  await next();
};

forumRouter.get('/threads', async (c) => {
  const db = drizzle(c.env.DB);
  const q = c.req.query('q');
  const category = c.req.query('category');

  const conditions = [];
  if (category && category !== 'all') conditions.push(eq(threads.category, category));
  if (q) conditions.push(or(like(threads.title, `%${q}%`), like(threads.content, `%${q}%`)));

  let query: any = db.select().from(threads);
  if (conditions.length > 0) query = db.select().from(threads).where(and(...conditions));

  // Multi-tier sort: Pinned first, then by recency
  return c.json(await query.orderBy(desc(threads.isPinned), desc(threads.createdAt)).limit(50).execute());
});

forumRouter.get('/threads/:id', async (c) => {
  const db = drizzle(c.env.DB);
  const threadId = parseInt(c.req.param('id'));
  const thread = await db.select().from(threads).where(eq(threads.id, threadId)).get();
  
  if (!thread) return c.json({ error: 'Not found' }, 404);
  
  c.executionCtx.waitUntil(
    db.update(threads).set({ views: sql`${threads.views} + 1` }).where(eq(threads.id, threadId)).execute()
  );
  
  const threadReplies = await db.select().from(replies).where(eq(replies.threadId, threadId)).orderBy(replies.createdAt);
  return c.json({ ...thread, replies: threadReplies });
});

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

  const thread = await db.select().from(threads).where(eq(threads.id, threadId)).get();
  if (!thread) return c.json({ error: 'Thread not found' }, 404);
  if (thread.isLocked && user.role === 'user') return c.json({ error: 'Thread is locked' }, 403);

  const result = await db.insert(replies).values({ threadId, content, authorId: user.id, author: user.username }).returning();
  return c.json(result[0], 201);
});

// Moderation Endpoints
forumRouter.patch('/threads/:id/pin', requireAuth, requireModerator, async (c) => {
  const db = drizzle(c.env.DB);
  const threadId = parseInt(c.req.param('id'));
  
  const thread = await db.select().from(threads).where(eq(threads.id, threadId)).get();
  if (!thread) return c.json({ error: 'Not found' }, 404);

  const result = await db.update(threads).set({ isPinned: !thread.isPinned }).where(eq(threads.id, threadId)).returning();
  return c.json(result[0]);
});

forumRouter.patch('/threads/:id/lock', requireAuth, requireModerator, async (c) => {
  const db = drizzle(c.env.DB);
  const threadId = parseInt(c.req.param('id'));
  
  const thread = await db.select().from(threads).where(eq(threads.id, threadId)).get();
  if (!thread) return c.json({ error: 'Not found' }, 404);

  const result = await db.update(threads).set({ isLocked: !thread.isLocked }).where(eq(threads.id, threadId)).returning();
  return c.json(result[0]);
});

forumRouter.delete('/threads/:id', requireAuth, async (c) => {
  const db = drizzle(c.env.DB);
  const threadId = parseInt(c.req.param('id'));
  const user = c.get('user');
  
  const thread = await db.select().from(threads).where(eq(threads.id, threadId)).get();
  if (!thread) return c.json({ error: 'Not found' }, 404);

  if (thread.authorId !== user.id && user.role === 'user') {
    return c.json({ error: 'Forbidden' }, 403);
  }

  await db.delete(threads).where(eq(threads.id, threadId)).execute();
  return c.json({ success: true });
});

forumRouter.post('/vote/:type/:id', async (c) => {
  const db = drizzle(c.env.DB);
  const type = c.req.param('type');
  const id = parseInt(c.req.param('id'));

  if (type === 'thread') {
    await db.update(threads).set({ upvotes: sql`${threads.upvotes} + 1` }).where(eq(threads.id, id)).execute();
  } else if (type === 'reply') {
    await db.update(replies).set({ upvotes: sql`${replies.upvotes} + 1` }).where(eq(replies.id, id)).execute();
  }
  
  return c.json({ success: true });
});
