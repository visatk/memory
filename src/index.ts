import { Hono } from 'hono';
import { secureHeaders } from 'hono/secure-headers';
import { authRouter } from './routes/auth';
import { forumRouter } from './routes/forum';
import { toolsRouter } from './routes/tools'; // <-- Import the new tools router

const app = new Hono();

app.use('*', secureHeaders());

// Mount Modular Routers
app.route('/api/auth', authRouter);
app.route('/api/forum', forumRouter);
app.route('/api/tools', toolsRouter); // <-- Mount it

export default { fetch: app.fetch };
