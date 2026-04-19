import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { drizzle } from 'drizzle-orm/d1';
import { eq, desc, count, or } from 'drizzle-orm';
import { sign, verify } from 'hono/jwt';
import { setCookie, getCookie, deleteCookie } from 'hono/cookie';
import { users, threads, replies } from '../db/schema';
import { hashPassword, verifyPassword } from '../utils/crypto';

export type AuthEnv = {
  Bindings: { 
    DB: D1Database; 
    JWT_SECRET: string; 
    RESEND_API_KEY?: string;
    GITHUB_CLIENT_ID?: string;
    GITHUB_CLIENT_SECRET?: string;
  };
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

// ==========================================
// TRADITIONAL AUTHENTICATION
// ==========================================

authRouter.post('/register', zValidator('json', registerSchema), async (c) => {
  const db = drizzle(c.env.DB);
  const { username, email, password } = c.req.valid('json');

  try {
    const existingEmail = await db.select().from(users).where(eq(users.email, email)).get();
    if (existingEmail) return c.json({ error: 'Email already registered' }, 400);
    
    const existingUsername = await db.select().from(users).where(eq(users.username, username)).get();
    if (existingUsername) return c.json({ error: 'Username already taken' }, 400);

    const passwordHash = await hashPassword(password);
    const verificationToken = crypto.randomUUID();
    
    const totalUsers = await db.select({ value: count() }).from(users).get();
    const isFirstUser = totalUsers?.value === 0;
    const assignedRole = isFirstUser ? 'admin' : 'user';
    const isVerified = isFirstUser; // Admin auto-verified

    const newUser = await db.insert(users).values({ 
      username, email, passwordHash, role: assignedRole,
      isVerified, verificationToken: isVerified ? null : verificationToken
    }).returning();
    
    if (!isVerified) {
      if (c.env.RESEND_API_KEY) {
        await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${c.env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            from: 'DevKit Pro <noreply@visatk.us>',
            to: email,
            subject: 'Verify your DevKit Pro account',
            html: `
              <div style="font-family: sans-serif; max-w: 600px; margin: 0 auto; padding: 20px;">
                <h2 style="color: #18181b;">Welcome to DevKit Pro, ${username}!</h2>
                <p style="color: #52525b; font-size: 16px;">Please verify your email address to activate your account.</p>
                <a href="https://www.visatk.us/verify-email?token=${verificationToken}" style="display: inline-block; background-color: #f97316; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; margin-top: 16px;">Verify Email Address</a>
              </div>
            `
          })
        });
      }
      return c.json({ requiresVerification: true, message: "Please check your email to verify your account." }, 201);
    }

    const payload = { id: newUser[0].id, username: newUser[0].username, role: newUser[0].role, exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7 };
    const token = await sign(payload, getSecret(c), 'HS256');
    
    setCookie(c, 'auth_token', token, { httpOnly: true, secure: true, sameSite: 'Strict', path: '/' });
    return c.json({ id: newUser[0].id, username: newUser[0].username, role: newUser[0].role, points: newUser[0].points, isVerified: true }, 201);
  } catch (err: any) {
    return c.json({ error: 'Registration failed due to a system constraint.' }, 500);
  }
});

authRouter.post('/verify', zValidator('json', z.object({ token: z.string() })), async (c) => {
  const db = drizzle(c.env.DB);
  const { token } = c.req.valid('json');

  const user = await db.select().from(users).where(eq(users.verificationToken, token)).get();
  if (!user) return c.json({ error: 'Invalid or expired verification token.' }, 400);

  await db.update(users).set({ isVerified: true, verificationToken: null }).where(eq(users.id, user.id)).execute();
  return c.json({ success: true });
});

authRouter.post('/login', zValidator('json', loginSchema), async (c) => {
  const db = drizzle(c.env.DB);
  const { email, password } = c.req.valid('json');

  const user = await db.select().from(users).where(eq(users.email, email)).get();
  if (!user) return c.json({ error: 'Invalid credentials' }, 401);
  
  if (!user.passwordHash) {
    return c.json({ error: 'Please login using GitHub (Social Login).' }, 401);
  }

  if (!(await verifyPassword(password, user.passwordHash))) {
    return c.json({ error: 'Invalid credentials' }, 401);
  }

  if (!user.isVerified) {
    return c.json({ error: 'Please verify your email address before logging in.' }, 403);
  }

  const payload = { id: user.id, username: user.username, role: user.role, exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7 };
  const token = await sign(payload, getSecret(c), 'HS256');
  
  setCookie(c, 'auth_token', token, { httpOnly: true, secure: true, sameSite: 'Strict', path: '/' });
  return c.json({ id: user.id, username: user.username, role: user.role, points: user.points });
});


// ==========================================
// GITHUB OAUTH 2.0
// ==========================================

authRouter.get('/github/login', (c) => {
  const clientId = c.env.GITHUB_CLIENT_ID;
  if (!clientId) return c.redirect('/login?error=GitHub+OAuth+is+not+configured');

  const redirectUri = `${new URL(c.req.url).origin}/api/auth/github/callback`;
  const url = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=read:user user:email`;
  
  return c.redirect(url);
});

authRouter.get('/github/callback', async (c) => {
  const code = c.req.query('code');
  if (!code) return c.redirect('/login?error=oauth_missing_code');

  const clientId = c.env.GITHUB_CLIENT_ID;
  const clientSecret = c.env.GITHUB_CLIENT_SECRET;

  try {
    // 1. Exchange Code for Access Token
    const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({ client_id: clientId, client_secret: clientSecret, code })
    });
    const tokenData = await tokenRes.json() as any;
    if (tokenData.error) throw new Error(tokenData.error_description);
    const accessToken = tokenData.access_token;

    // 2. Fetch User Profile
    const userRes = await fetch('https://api.github.com/user', {
      headers: { 'Authorization': `Bearer ${accessToken}`, 'User-Agent': 'DevKit-Pro-App' }
    });
    const githubUser = await userRes.json() as any;

    // 3. Fetch User Emails (To ensure we get the primary verified email)
    const emailsRes = await fetch('https://api.github.com/user/emails', {
      headers: { 'Authorization': `Bearer ${accessToken}`, 'User-Agent': 'DevKit-Pro-App' }
    });
    const emails = await emailsRes.json() as any[];
    const primaryEmail = emails.find(e => e.primary && e.verified)?.email || emails[0]?.email;

    if (!primaryEmail) throw new Error('No verified email found on GitHub.');

    const db = drizzle(c.env.DB);
    
    // 4. Identify or Create User
    let user = await db.select().from(users).where(
      or(eq(users.githubId, githubUser.id.toString()), eq(users.email, primaryEmail))
    ).get();

    if (!user) {
      // Create new user flow
      const totalUsers = await db.select({ value: count() }).from(users).get();
      const isFirstUser = totalUsers?.value === 0;
      
      // Ensure username uniqueness
      let uniqueUsername = githubUser.login;
      let counter = 1;
      while (await db.select().from(users).where(eq(users.username, uniqueUsername)).get()) {
        uniqueUsername = `${githubUser.login}${counter}`;
        counter++;
      }

      const newUser = await db.insert(users).values({
        username: uniqueUsername,
        email: primaryEmail,
        githubId: githubUser.id.toString(),
        role: isFirstUser ? 'admin' : 'user',
        isVerified: true // OAuth inherently verifies email
        // passwordHash remains NULL
      }).returning();
      
      user = newUser[0];
    } else if (!user.githubId || !user.isVerified) {
      // Securely merge account if email existed but GitHub wasn't linked
      const updatedUser = await db.update(users)
        .set({ githubId: githubUser.id.toString(), isVerified: true })
        .where(eq(users.id, user.id)).returning();
      user = updatedUser[0];
    }

    // 5. Issue JWT Session
    const payload = { id: user.id, username: user.username, role: user.role, exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7 };
    const token = await sign(payload, getSecret(c), 'HS256');
    setCookie(c, 'auth_token', token, { httpOnly: true, secure: true, sameSite: 'Strict', path: '/' });
    
    return c.redirect('/');
  } catch (err: any) {
    return c.redirect(`/login?error=${encodeURIComponent(err.message || 'OAuth execution failed')}`);
  }
});


// ==========================================
// SESSION MANAGEMENT
// ==========================================

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
    const user = await db.select({ id: users.id, username: users.username, role: users.role, points: users.points }).from(users).where(eq(users.id, decoded.id)).get();
    if (!user) return c.json({ user: null });
    return c.json({ user });
  } catch {
    return c.json({ user: null });
  }
});

authRouter.get('/profile/:username', async (c) => {
  const db = drizzle(c.env.DB);
  const username = c.req.param('username');
  
  const user = await db.select({ id: users.id, username: users.username, role: users.role, points: users.points, createdAt: users.createdAt }).from(users).where(eq(users.username, username)).get();
  if (!user) return c.json({ error: 'User not found' }, 404);

  const userThreads = await db.select().from(threads).where(eq(threads.authorId, user.id)).orderBy(desc(threads.createdAt)).limit(10);
  const threadsCountResult = await db.select({ value: count() }).from(threads).where(eq(threads.authorId, user.id)).get();
  const repliesCountResult = await db.select({ value: count() }).from(replies).where(eq(replies.authorId, user.id)).get();

  return c.json({ user, stats: { threads: threadsCountResult?.value || 0, replies: repliesCountResult?.value || 0 }, recentThreads: userThreads });
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
