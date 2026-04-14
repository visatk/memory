import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

export const threads = sqliteTable('threads', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  title: text('title').notNull(),
  content: text('content').notNull(),
  author: text('author').notNull().default('Anonymous Developer'),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`(strftime('%s', 'now'))`),
});

export const replies = sqliteTable('replies', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  threadId: integer('thread_id')
    .notNull()
    .references(() => threads.id, { onDelete: 'cascade' }),
  content: text('content').notNull(),
  author: text('author').notNull().default('Anonymous Developer'),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`(strftime('%s', 'now'))`),
});
