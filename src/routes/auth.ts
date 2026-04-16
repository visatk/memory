import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { drizzle } from 'drizzle-orm/d1';
import { eq } from 'drizzle-orm';
import { sign, verify } from 'hono/jwt';
import { setCookie, getCookie, deleteCookie } from 'hono/cookie';
import { users } from '../db/schema';
import { hashPassword, verifyPassword } from '../utils/crypto';

export type AuthEnv = {
  Bindings: {
    DB: D1Database;
    JWT_SECRET: string;
  };
  Variables: {
    user: { id: number; username: string; exp: number; };
  };
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

authRouter.post('/register', zValidator('json', registerSchema), async (c) => {
  const db = drizzle(c.env.DB);
  const { username, email, password } = c.req.valid('json');

  const existingUser = await db.select().from(users).where(eq(users.email, email)).get();
  if (existingUser) {
    return c.json({ error: 'Email already exists' }, 400);
  }

  // Await the new async WebCrypto implementation
  const passwordHash = await hashPassword(password);
  
  const newUser = await db.insert(users).values({ 
    username, 
    email, 
    passwordHash 
  }).returning();
  
  const payload = {
    id: newUser[0].id,
    username: newUser[0].username,
    exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7 
  };
  
  const token = await sign(payload, getSecret(c), 'HS256');
  
  setCookie(c, 'auth_token', token, { 
    httpOnly: true, secure: true, sameSite: 'Strict', path: '/' 
  });

  return c.json({ id: newUser[0].id, username: newUser[0].username }, 201);
});

authRouter.post('/login', zValidator('json', loginSchema), async (c) => {
  const db = drizzle(c.env.DB);
  const { email, password } = c.req.valid('json');

  const user = await db.select().from(users).where(eq(users.email, email)).get();
  
  // Await async verification
  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    return c.json({ error: 'Invalid credentials' }, 401);
  }

  const payload = {
    id: user.id,
    username: user.username,
    exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7
  };

  const token = await sign(payload, getSecret(c), 'HS256');
  
  setCookie(c, 'auth_token', token, { 
    httpOnly: true, secure: true, sameSite: 'Strict', path: '/' 
  });

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
    const decoded = await verify(token, getSecret(c), 'HS256') as { id: number; username: string; exp: number };
    return c.json({ user: { id: decoded.id, username: decoded.username } });
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
