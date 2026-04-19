import { Hono } from 'hono';
import { drizzle } from 'drizzle-orm/d1';
import { eq, desc, like, or, and, sql } from 'drizzle-orm';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { verify } from 'hono/jwt';
import { getCookie } from 'hono/cookie';
import { threads, replies, users, threadUnlocks } from '../db/schema';
import { requireAuth } from './auth';

export const forumRouter = new Hono<{ Bindings: { DB: D1Database, JWT_SECRET: string }, Variables: { user: any } }>();

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

  let query: any = db.select({
    id: threads.id, title: threads.title, category: threads.category,
    author: threads.author, upvotes: threads.upvotes, views: threads.views,
    isPinned: threads.isPinned, isLocked: threads.isLocked, createdAt: threads.createdAt,
    hasLockedContent: sql`locked_content IS NOT NULL AND locked_content != ''`
  }).from(threads);
  
  if (conditions.length > 0) query = query.where(and(...conditions));

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
  
  // Security protocol: Strip the locked content payload unless unlocked
  let currentUser = null;
  const token = getCookie(c, 'auth_token');
  if (token) {
    try { currentUser = await verify(token, c.env.JWT_SECRET || 'super-secure-dev-secret-123') as any; } catch {}
  }

  let canViewLocked = false;
  if (currentUser) {
    if (currentUser.id === thread.authorId || currentUser.role === 'admin') canViewLocked = true;
    else {
      const unlocked = await db.select().from(threadUnlocks).where(and(eq(threadUnlocks.userId, currentUser.id), eq(threadUnlocks.threadId, threadId))).get();
      if (unlocked) canViewLocked = true;
    }
  }

  const { lockedContent, ...publicThread } = thread;
  return c.json({ 
    ...publicThread, 
    hasLockedContent: !!lockedContent, 
    lockedContent: canViewLocked ? lockedContent : undefined,
    replies: threadReplies 
  });
});

forumRouter.post('/threads', requireAuth, zValidator('json', z.object({ 
  title: z.string(), 
  content: z.string(), 
  category: z.string(),
  lockedContent: z.string().optional(),
  unlockCost: z.number().default(0)
})), async (c) => {
  const db = drizzle(c.env.DB);
  const user = c.get('user');
  const { title, content, category, lockedContent, unlockCost } = c.req.valid('json');

  const finalLockedContent = lockedContent?.trim() ? lockedContent : null;

  const result = await db.insert(threads).values({ 
    title, content, category, 
    lockedContent: finalLockedContent, 
    unlockCost: finalLockedContent ? unlockCost : 0, 
    authorId: user.id, author: user.username 
  }).returning();

  // Reward 5 points for creating a thread
  c.executionCtx.waitUntil(
    db.update(users).set({ points: sql`${users.points} + 5` }).where(eq(users.id, user.id)).execute()
  );

  return c.json(result[0], 201);
});

// CONTENT UNLOCK ENDPOINT
forumRouter.post('/threads/:id/unlock', requireAuth, async (c) => {
  const db = drizzle(c.env.DB);
  const user = c.get('user');
  const threadId = parseInt(c.req.param('id'));

  const thread = await db.select().from(threads).where(eq(threads.id, threadId)).get();
  if (!thread || !thread.lockedContent) return c.json({ error: 'No locked content available' }, 404);

  // Free access for author
  if (thread.authorId === user.id) return c.json({ success: true, lockedContent: thread.lockedContent });

  // Check if already unlocked
  const existing = await db.select().from(threadUnlocks).where(and(eq(threadUnlocks.userId, user.id), eq(threadUnlocks.threadId, threadId))).get();
  if (existing) return c.json({ success: true, lockedContent: thread.lockedContent });

  const dbUser = await db.select().from(users).where(eq(users.id, user.id)).get();
  if (!dbUser || dbUser.points < thread.unlockCost) {
    return c.json({ error: 'Insufficient points balance' }, 400);
  }

  // Execute point exchange: Deduct from buyer, give 80% to creator
  await db.batch([
    db.update(users).set({ points: sql`${users.points} - ${thread.unlockCost}` }).where(eq(users.id, user.id)),
    db.update(users).set({ points: sql`${users.points} + ${Math.floor(thread.unlockCost * 0.8)}` }).where(eq(users.id, thread.authorId)),
    db.insert(threadUnlocks).values({ userId: user.id, threadId })
  ]);

  return c.json({ success: true, lockedContent: thread.lockedContent });
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
  if (thread.authorId !== user.id && user.role === 'user') return c.json({ error: 'Forbidden' }, 403);
  await db.delete(threads).where(eq(threads.id, threadId)).execute();
  return c.json({ success: true });
});

forumRouter.post('/vote/:type/:id', requireAuth, async (c) => {
  const db = drizzle(c.env.DB);
  const type = c.req.param('type');
  const id = parseInt(c.req.param('id'));

  if (type === 'thread') {
    const target = await db.select({ authorId: threads.authorId }).from(threads).where(eq(threads.id, id)).get();
    if (target) {
      await db.batch([
        db.update(threads).set({ upvotes: sql`${threads.upvotes} + 1` }).where(eq(threads.id, id)),
        db.update(users).set({ points: sql`${users.points} + 2` }).where(eq(users.id, target.authorId)) // 2 pts per upvote
      ]);
    }
  } else if (type === 'reply') {
    const target = await db.select({ authorId: replies.authorId }).from(replies).where(eq(replies.id, id)).get();
    if (target) {
      await db.batch([
        db.update(replies).set({ upvotes: sql`${replies.upvotes} + 1` }).where(eq(replies.id, id)),
        db.update(users).set({ points: sql`${users.points} + 1` }).where(eq(users.id, target.authorId)) // 1 pt per upvote
      ]);
    }
  }
  
  return c.json({ success: true });
});
