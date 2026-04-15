import { Hono } from 'hono';
import { secureHeaders } from 'hono/secure-headers';
import { authRouter } from './server/routes/auth';
import { forumRouter } from './server/routes/forum';

const app = new Hono();
app.use('*', secureHeaders());

// Mount Modular Routers
app.route('/api/auth', authRouter);
app.route('/api/forum', forumRouter);

export default { fetch: app.fetch };
