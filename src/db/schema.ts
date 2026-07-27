import { boolean, pgTable, text, timestamp, uuid, varchar } from 'drizzle-orm/pg-core';

/**
 * 官网内容模型（v2 使用）。v1 静态站不查库，但提前建模让 v2 后台落地成为小步增量。
 * 页面级"区块编排"（page-composer 风格）暂不建模，待 v2 需要时再加。
 */

// 站点设置（单例）：页脚备案号 + 公司基础信息 + 联系方式
export const siteSettings = pgTable('site_settings', {
  id: varchar('id', { length: 32 }).primaryKey().default('singleton'),
  companyName: varchar('company_name', { length: 200 }),
  icpNumber: varchar('icp_number', { length: 100 }),
  publicSecurityNumber: varchar('public_security_number', { length: 100 }),
  contactEmail: varchar('contact_email', { length: 200 }),
  contactPhone: varchar('contact_phone', { length: 50 }),
  contactAddress: text('contact_address'),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

// 新闻 / 公告
export const posts = pgTable('posts', {
  id: uuid('id').primaryKey().defaultRandom(),
  slug: varchar('slug', { length: 200 }).notNull().unique(),
  title: varchar('title', { length: 300 }).notNull(),
  excerpt: text('excerpt'),
  body: text('body'),
  status: varchar('status', { length: 20 }).notNull().default('draft'),
  publishedAt: timestamp('published_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

// 联系 / 商务合作表单提交
export const contactSubmissions = pgTable('contact_submissions', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 100 }).notNull(),
  email: varchar('email', { length: 200 }),
  phone: varchar('phone', { length: 50 }),
  company: varchar('company', { length: 200 }),
  message: text('message').notNull(),
  handled: boolean('handled').notNull().default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

// 后台管理员账户（v2 登录）
export const adminUsers = pgTable('admin_users', {
  id: uuid('id').primaryKey().defaultRandom(),
  username: varchar('username', { length: 100 }).notNull().unique(),
  passwordHash: varchar('password_hash', { length: 200 }).notNull(),
  displayName: varchar('display_name', { length: 100 }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});
