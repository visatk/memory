import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { drizzle } from 'drizzle-orm/d1';
import { eq } from 'drizzle-orm';
import { sign, verify } from 'hono/jwt';
import { setCookie, getCookie, deleteCookie } from 'hono/cookie';
import { users } from '../db/schema';
import { hashPassword, verifyPassword } from '../utils/crypto';

// Define strict types for our Hono environment
export type AuthEnv = {
  Bindings: {
    DB: D1Database;
    JWT_SECRET: string;
  };
  Variables: {
    user: {
      id: number;
      username: string;
      exp: number;
    };
  };
};

export const authRouter = new Hono<AuthEnv>();

// Default fallback secret for local dev. Set JWT_SECRET in production Cloudflare dashboard.
const getSecret = (c: any): string => c.env.JWT_SECRET || 'super-secure-dev-secret-123';

// --- Zod Validation Schemas ---
const registerSchema = z.object({
  username: z.string().min(3).max(30),
  email: z.string().email(),
  password: z.string().min(8)
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string()
});

// --- Routes ---

authRouter.post('/register', zValidator('json', registerSchema), async (c) => {
  const db = drizzle(c.env.DB);
  const { username, email, password } = c.req.valid('json');

  // 1. Check if email already exists
  const existingUser = await db.select().from(users).where(eq(users.email, email)).get();
  if (existingUser) {
    return c.json({ error: 'Email already exists' }, 400);
  }

  // 2. Hash password directly at the edge
  const passwordHash = hashPassword(password);
  
  // 3. Insert user
  const newUser = await db.insert(users).values({ 
    username, 
    email, 
    passwordHash 
  }).returning();
  
  // 4. Generate JWT & Set HttpOnly Cookie (Added 'HS256' for strict algorithmic security)
  const payload = {
    id: newUser[0].id,
    username: newUser[0].username,
    exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7 // 7 days expiration
  };
  
  const token = await sign(payload, getSecret(c), 'HS256');
  
  setCookie(c, 'auth_token', token, { 
    httpOnly: true, 
    secure: true, 
    sameSite: 'Strict', 
    path: '/' 
  });

  return c.json({ id: newUser[0].id, username: newUser[0].username }, 201);
});

authRouter.post('/login', zValidator('json', loginSchema), async (c) => {
  const db = drizzle(c.env.DB);
  const { email, password } = c.req.valid('json');

  // 1. Find user by email
  const user = await db.select().from(users).where(eq(users.email, email)).get();
  
  // 2. Verify password hashes
  if (!user || !verifyPassword(password, user.passwordHash)) {
    return c.json({ error: 'Invalid credentials' }, 401);
  }

  // 3. Generate JWT & Set HttpOnly Cookie
  const payload = {
    id: user.id,
    username: user.username,
    exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7
  };

  const token = await sign(payload, getSecret(c), 'HS256');
  
  setCookie(c, 'auth_token', token, { 
    httpOnly: true, 
    secure: true, 
    sameSite: 'Strict', 
    path: '/' 
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
    // Explicitly pass 'HS256' to satisfy strict typings and prevent Algorithm Confusion
    const decoded = await verify(token, getSecret(c), 'HS256') as { id: number; username: string; exp: number };
    return c.json({ user: { id: decoded.id, username: decoded.username } });
  } catch {
    return c.json({ user: null });
  }
});

// --- Middleware ---

// Middleware to protect forum POST routes
export const requireAuth = async (c: any, next: any) => {
  const token = getCookie(c, 'auth_token');
  
  if (!token) {
    return c.json({ error: 'Unauthorized' }, 401);
  }
  
  try {
    // Strict algorithm verification
    const decoded = await verify(token, getSecret(c), 'HS256');
    c.set('user', decoded);
    await next();
  } catch {
    return c.json({ error: 'Unauthorized' }, 401);
  }
};
