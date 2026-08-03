import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import test from 'node:test';

import { and, eq } from 'drizzle-orm';

import { buildApp } from '../src/app.js';
import {
  accountRoles,
  accounts,
  auditLogs,
  inquiries,
  outboxEvents,
  passwordCredentials,
  roles,
} from '../src/db/schema.js';
import { loadEnv } from '../src/lib/env.js';
import { hashPassword } from '../src/lib/password.js';
import { createInquirySchema } from '../src/modules/inquiries/schemas.js';

test('public inquiry schema requires consent and at least one contact method', () => {
  const valid = {
    name: '测试联系人',
    email: 'contact@example.test',
    message: '我们希望建设一套完整的业务运营系统。',
    privacyConsent: true,
  };
  assert.equal(createInquirySchema.safeParse(valid).success, true);
  assert.equal(createInquirySchema.safeParse({ ...valid, email: '' }).success, false);
  assert.equal(createInquirySchema.safeParse({ ...valid, privacyConsent: false }).success, false);
  assert.equal(createInquirySchema.safeParse({ ...valid, website: 'spam.example' }).success, true);
});

test('honeypot submissions are accepted without touching the database', async () => {
  const app = await buildApp(
    loadEnv({
      NODE_ENV: 'test',
      APP_NAME: 'lingcoo-official-website-system',
      LOG_LEVEL: 'silent',
      DATABASE_URL: 'postgres://lingcoo:lingcoo@127.0.0.1:1/unused',
    }),
  );
  const response = await app.inject({
    method: 'POST',
    url: '/api/public/inquiries',
    payload: {
      name: 'Automated Form',
      email: 'bot@example.test',
      message: 'This submission should be discarded without a database query.',
      privacyConsent: true,
      website: 'https://spam.example',
    },
  });
  assert.equal(response.statusCode, 202);
  assert.deepEqual(response.json(), { accepted: true });
  await app.close();
});

const databaseUrl = process.env.DATABASE_URL;

function sessionCookie(response: { headers: Record<string, string | string[] | undefined> }) {
  const header = response.headers['set-cookie'];
  const value = Array.isArray(header) ? header[0] : header;
  assert.ok(value);
  return value.split(';', 1)[0];
}

test(
  'inquiry submission creates a private workflow with audit and outbox records',
  { skip: !databaseUrl },
  async () => {
    const app = await buildApp(
      loadEnv({
        NODE_ENV: 'test',
        APP_NAME: 'lingcoo-official-website-system',
        APP_VERSION: 'test',
        LOG_LEVEL: 'silent',
        DATABASE_URL: databaseUrl,
        AUTH_JWT_SECRET: 'official-inquiry-test-secret-with-32-characters',
      }),
    );
    const marker = randomUUID();
    const email = `inquiry-owner-${marker}@example.test`;
    const password = 'Official-inquiry-owner-2026!';
    const [ownerRole] = await app.db
      .select({ id: roles.id })
      .from(roles)
      .where(eq(roles.code, 'owner'));
    assert.ok(ownerRole);
    const [account] = await app.db
      .insert(accounts)
      .values({ email, displayName: 'Inquiry Owner' })
      .returning({ id: accounts.id });
    await app.db
      .insert(passwordCredentials)
      .values({ accountId: account.id, passwordHash: await hashPassword(password) });
    await app.db.insert(accountRoles).values({ accountId: account.id, roleId: ownerRole.id });

    const unauthorized = await app.inject({ method: 'GET', url: '/api/inquiries' });
    assert.equal(unauthorized.statusCode, 401);

    const submitted = await app.inject({
      method: 'POST',
      url: '/api/public/inquiries',
      payload: {
        name: '王老师',
        email: `lead-${marker}@example.test`,
        organization: '示例教育机构',
        subject: `教育运营系统 ${marker}`,
        message: '希望统一招生、排课、签到和消课流程，并支持私有部署。',
        sourcePath: '/#contact',
        privacyConsent: true,
        website: '',
      },
    });
    assert.equal(submitted.statusCode, 202);
    assert.deepEqual(submitted.json(), { accepted: true });

    const [created] = await app.db
      .select()
      .from(inquiries)
      .where(eq(inquiries.subject, `教育运营系统 ${marker}`));
    assert.ok(created);
    assert.equal(created.status, 'new');
    assert.equal(created.privacyConsent, true);

    const login = await app.inject({
      method: 'POST',
      url: '/api/auth/login',
      payload: { email, password },
    });
    assert.equal(login.statusCode, 200);
    const cookie = sessionCookie(login);
    const list = await app.inject({
      method: 'GET',
      url: `/api/inquiries?search=${marker}`,
      headers: { cookie },
    });
    assert.equal(list.statusCode, 200);
    assert.equal(list.json().total, 1);
    assert.equal(list.json().items[0].id, created.id);

    const updated = await app.inject({
      method: 'PATCH',
      url: `/api/inquiries/${created.id}`,
      headers: { cookie },
      payload: { status: 'resolved', internalNote: '已完成首次需求沟通。' },
    });
    assert.equal(updated.statusCode, 200);
    assert.equal(updated.json().inquiry.status, 'resolved');
    assert.ok(updated.json().inquiry.handledAt);

    const [createdAudit, updatedAudit, event] = await Promise.all([
      app.db
        .select({ id: auditLogs.id })
        .from(auditLogs)
        .where(and(eq(auditLogs.resourceId, created.id), eq(auditLogs.action, 'inquiry.created'))),
      app.db
        .select({ id: auditLogs.id })
        .from(auditLogs)
        .where(and(eq(auditLogs.resourceId, created.id), eq(auditLogs.action, 'inquiry.updated'))),
      app.db
        .select({ payload: outboxEvents.payload })
        .from(outboxEvents)
        .where(eq(outboxEvents.aggregateId, created.id)),
    ]);
    assert.equal(createdAudit.length, 1);
    assert.equal(updatedAudit.length, 1);
    assert.deepEqual(event[0]?.payload, { inquiryId: created.id });

    await app.db.delete(outboxEvents).where(eq(outboxEvents.aggregateId, created.id));
    await app.db.delete(auditLogs).where(eq(auditLogs.resourceId, created.id));
    await app.db.delete(inquiries).where(eq(inquiries.id, created.id));
    await app.db.delete(accounts).where(eq(accounts.id, account.id));
    await app.close();
  },
);
