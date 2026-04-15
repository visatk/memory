import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { drizzle } from 'drizzle-orm/d1';
import { eq } from 'drizzle-orm';
import { sign, verify } from 'hono/jwt';
import { setCookie, getCookie, deleteCookie } from 'hono/cookie';
import { users } from '../../db/schema';
import { hashPassword, verifyPassword } from '../utils/crypto';

export const authRouter = new Hono<{ Bindings: { DB: D1Database, JWT_SECRET: string }, Variables: { user: any } }>();

// Define a default secret fallback for local dev. In production, set JWT_SECRET in Cloudflare.
const getSecret = (c: any) => c.env.JWT_SECRET || 'super-secure-dev-secret-123';

const registerSchema = z.object({
  username: z.string().min(3).max(30),
  email: z.string().email(),
  password: z.string().min(8)
});

authRouter.post('/register', zValidator('json', registerSchema), async (c) => {
  const db = drizzle(c.env.DB);
  const { username, email, password } = c.req.valid('json');

  const existingUser = await db.select().from(users).where(eq(users.email, email)).get();
  if (existingUser) return c.json({ error: 'Email already exists' }, 400);

  const passwordHash = hashPassword(password);
  
  const newUser = await db.insert(users).values({ username, email, passwordHash }).returning();
  
  const token = await sign({ id: newUser[0].id, username: newUser[0].username, exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7 }, getSecret(c));
  setCookie(c, 'auth_token', token, { httpOnly: true, secure: true, sameSite: 'Strict', path: '/' });

  return c.json({ id: newUser[0].id, username: newUser[0].username });
});

authRouter.post('/login', zValidator('json', z.object({ email: z.string().email(), password: z.string() })), async (c) => {
  const db = drizzle(c.env.DB);
  const { email, password } = c.req.valid('json');

  const user = await db.select().from(users).where(eq(users.email, email)).get();
  if (!user || !verifyPassword(password, user.passwordHash)) {
    return c.json({ error: 'Invalid credentials' }, 401);
  }

  const token = await sign({ id: user.id, username: user.username, exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7 }, getSecret(c));
  setCookie(c, 'auth_token', token, { httpOnly: true, secure: true, sameSite: 'Strict', path: '/' });

  return c.json({ id: user.id, username: user.username });
});

authRouter.post('/logout', (c) => {
  deleteCookie(c, 'auth_token', { path: '/' });
  return c.json({ success: true });
});

authRouter.get('/me', async (c) => {
  const token = getCookie(c, 'auth_token');
  if (!token) return c.json({ user: null });
  try {
    const decoded = await verify(token, getSecret(c));
    return c.json({ user: { id: decoded.id, username: decoded.username } });
  } catch {
    return c.json({ user: null });
  }
});

// Middleware to protect routes
export const requireAuth = async (c: any, next: any) => {
  const token = getCookie(c, 'auth_token');
  if (!token) return c.json({ error: 'Unauthorized' }, 401);
  try {
    const decoded = await verify(token, getSecret(c));
    c.set('user', decoded);
    await next();
  } catch {
    return c.json({ error: 'Unauthorized' }, 401);
  }
};
