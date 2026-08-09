import { accounts } from '@lingcootech/frame-database/schema';
import { boolean, index, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

export const inquiries = pgTable(
  'inquiries',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    name: text('name').notNull(),
    email: text('email'),
    phone: text('phone'),
    organization: text('organization'),
    subject: text('subject'),
    message: text('message').notNull(),
    status: text('status').notNull().default('new'),
    sourcePath: text('source_path').notNull().default('/contact'),
    privacyConsent: boolean('privacy_consent').notNull(),
    assignedTo: uuid('assigned_to').references(() => accounts.id, { onDelete: 'set null' }),
    internalNote: text('internal_note'),
    handledAt: timestamp('handled_at', { withTimezone: true }),
    handledBy: uuid('handled_by').references(() => accounts.id, { onDelete: 'set null' }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index('inquiries_status_created_idx').on(table.status, table.createdAt),
    index('inquiries_assigned_status_idx').on(table.assignedTo, table.status),
  ],
);
