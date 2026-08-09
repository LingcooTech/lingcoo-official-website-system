import assert from 'node:assert/strict';
import test from 'node:test';

import { FRAME_VERSION } from '@lingcootech/frame-extension-sdk';

import { officialSiteManifest } from '../src/contracts.js';
import { officialSiteMigrationSource } from '../src/migrations.js';
import { createInquirySchema, updateInquirySchema } from '../src/schemas.js';

test('official website stays a domain extension on the installed Frame version', () => {
  assert.equal(officialSiteManifest.frame, `^${FRAME_VERSION}`);
  assert.deepEqual(officialSiteManifest.dependencies, [
    { id: 'frame', version: `^${FRAME_VERSION}` },
  ]);
  assert.deepEqual(officialSiteManifest.migrations.migrations, [{ id: '0001_initial.sql' }]);
  assert.match(
    officialSiteMigrationSource.migrations[0]?.sql ?? '',
    /CREATE TABLE IF NOT EXISTS "inquiries"/,
  );
  assert.doesNotMatch(
    officialSiteMigrationSource.migrations[0]?.sql ?? '',
    /CREATE TABLE IF NOT EXISTS "accounts"/,
  );
});

test('public inquiries require consent, a contact method and a useful message', () => {
  const valid = createInquirySchema.parse({
    name: '测试客户',
    email: 'client@example.com',
    message: '我们希望建设一个新的业务运营系统。',
    privacyConsent: true,
  });
  assert.equal(valid.email, 'client@example.com');
  assert.equal(valid.sourcePath, '/contact');

  assert.equal(
    createInquirySchema.safeParse({
      name: '测试客户',
      message: '我们希望建设一个新的业务运营系统。',
      privacyConsent: true,
    }).success,
    false,
  );
  assert.equal(
    createInquirySchema.safeParse({
      name: '测试客户',
      phone: '13800000000',
      message: '太短',
      privacyConsent: true,
    }).success,
    false,
  );
});

test('inquiry updates reject empty changes', () => {
  assert.equal(updateInquirySchema.safeParse({}).success, false);
  assert.deepEqual(updateInquirySchema.parse({ status: 'in_progress' }), {
    status: 'in_progress',
  });
});
