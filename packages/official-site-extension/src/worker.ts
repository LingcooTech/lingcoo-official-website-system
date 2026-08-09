import type { Database } from '@lingcootech/frame-database';
import {
  accountRoles,
  accounts,
  notifications,
  rolePermissions,
} from '@lingcootech/frame-database/schema';
import { defineWorkerExtension } from '@lingcootech/frame-extension-sdk/worker';
import { and, eq } from 'drizzle-orm';

export const officialSiteWorkerExtension = defineWorkerExtension<unknown, Database>({
  register({ database, subscribe }) {
    subscribe('inquiry.created', async (event) => {
      const inquiryId = typeof event.payload.inquiryId === 'string' ? event.payload.inquiryId : '';
      if (!inquiryId) throw new Error('inquiry.created event is missing inquiryId');
      const recipients = await database
        .selectDistinct({ accountId: accounts.id })
        .from(accounts)
        .innerJoin(accountRoles, eq(accountRoles.accountId, accounts.id))
        .innerJoin(rolePermissions, eq(rolePermissions.roleId, accountRoles.roleId))
        .where(
          and(eq(accounts.status, 'active'), eq(rolePermissions.permissionCode, 'inquiries.read')),
        );
      for (const recipient of recipients) {
        await database
          .insert(notifications)
          .values({
            recipientAccountId: recipient.accountId,
            category: 'inquiry',
            level: 'info',
            title: '收到新的官网联系线索',
            body: '官网刚刚收到一条新的联系或合作咨询，请及时查看并安排跟进。',
            ctaLabel: '查看联系线索',
            ctaUrl: '/admin/inquiries',
            sourceEventId: event.eventId,
            sourceEventName: event.topic,
            dedupeKey: `event:${event.eventId}:${recipient.accountId}`,
            metadata: { inquiryId },
          })
          .onConflictDoNothing();
      }
    });
  },
});
