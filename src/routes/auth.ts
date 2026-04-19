import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { drizzle } from 'drizzle-orm/d1';
import { eq, desc, count } from 'drizzle-orm';
import { sign, verify } from 'hono/jwt';
import { setCookie, getCookie, deleteCookie } from 'hono/cookie';
import { users, threads, replies } from '../db/schema';
import { hashPassword, verifyPassword } from '../utils/crypto';

export type AuthEnv = {
  Bindings: { DB: D1Database; JWT_SECRET: string; };
  Variables: { user: { id: number; username: string; role: string; exp: number; }; };
};

export const authRouter = new Hono<AuthEnv>();

const getSecret = (c: any): string => c.env.JWT_SECRET || 'super-secure-dev-secret-123';

const registerSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters").max(30),
  email: z.string().email("Invalid email format"),
  password: z.string().min(8, "Password must be at least 8 characters")
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string()
});

authRouter.get('/profile/:username', async (c) => {
  const db = drizzle(c.env.DB);
  const username = c.req.param('username');
  
  const user = await db.select({ 
    id: users.id, 
    username: users.username,
    role: users.role,
    points: users.points,
    createdAt: users.createdAt 
  }).from(users).where(eq(users.username, username)).get();
  
  if (!user) return c.json({ error: 'User not found' }, 404);

  const userThreads = await db.select()
    .from(threads)
    .where(eq(threads.authorId, user.id))
    .orderBy(desc(threads.createdAt))
    .limit(10);
  
  const threadsCountResult = await db.select({ value: count() }).from(threads).where(eq(threads.authorId, user.id)).get();
  const repliesCountResult = await db.select({ value: count() }).from(replies).where(eq(replies.authorId, user.id)).get();

  return c.json({
    user,
    stats: { threads: threadsCountResult?.value || 0, replies: repliesCountResult?.value || 0 },
    recentThreads: userThreads
  });
});

authRouter.post('/register', zValidator('json', registerSchema), async (c) => {
  const db = drizzle(c.env.DB);
  const { username, email, password } = c.req.valid('json');

  try {
    const existingEmail = await db.select().from(users).where(eq(users.email, email)).get();
    if (existingEmail) return c.json({ error: 'Email already registered' }, 400);
    
    const existingUsername = await db.select().from(users).where(eq(users.username, username)).get();
    if (existingUsername) return c.json({ error: 'Username already taken' }, 400);

    const passwordHash = await hashPassword(password);
    
    const totalUsers = await db.select({ value: count() }).from(users).get();
    const assignedRole = totalUsers?.value === 0 ? 'admin' : 'user';

    const newUser = await db.insert(users).values({ 
      username, email, passwordHash, role: assignedRole 
    }).returning();
    
    const payload = { id: newUser[0].id, username: newUser[0].username, role: newUser[0].role, exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7 };
    const token = await sign(payload, getSecret(c), 'HS256');
    
    setCookie(c, 'auth_token', token, { httpOnly: true, secure: true, sameSite: 'Strict', path: '/' });
    return c.json({ id: newUser[0].id, username: newUser[0].username, role: newUser[0].role, points: newUser[0].points }, 201);
  } catch (err: any) {
    return c.json({ error: 'Registration failed due to a system constraint.' }, 500);
  }
});

authRouter.post('/login', zValidator('json', loginSchema), async (c) => {
  const db = drizzle(c.env.DB);
  const { email, password } = c.req.valid('json');

  const user = await db.select().from(users).where(eq(users.email, email)).get();
  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    return c.json({ error: 'Invalid credentials' }, 401);
  }

  const payload = { id: user.id, username: user.username, role: user.role, exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7 };
  const token = await sign(payload, getSecret(c), 'HS256');
  
  setCookie(c, 'auth_token', token, { httpOnly: true, secure: true, sameSite: 'Strict', path: '/' });
  return c.json({ id: user.id, username: user.username, role: user.role, points: user.points });
});

authRouter.post('/logout', (c) => {
  deleteCookie(c, 'auth_token', { path: '/' });
  return c.json({ success: true });
});

authRouter.get('/me', async (c) => {
  const token = getCookie(c, 'auth_token');
  if (!token) return c.json({ user: null });
  try {
    const decoded = await verify(token, getSecret(c), 'HS256') as any;
    const db = drizzle(c.env.DB);
    // Fetch fresh user data to ensure points are always synced
    const user = await db.select({ id: users.id, username: users.username, role: users.role, points: users.points }).from(users).where(eq(users.id, decoded.id)).get();
    if (!user) return c.json({ user: null });
    return c.json({ user });
  } catch {
    return c.json({ user: null });
  }
});

export const requireAuth = async (c: any, next: any) => {
  const token = getCookie(c, 'auth_token');
  if (!token) return c.json({ error: 'Unauthorized' }, 401);
  try {
    const decoded = await verify(token, getSecret(c), 'HS256');
    c.set('user', decoded);
    await next();
  } catch {
    return c.json({ error: 'Unauthorized' }, 401);
  }
};
