import { and, eq } from 'drizzle-orm';

import type { Database } from '../../db/client.js';
import { accountRoles, accounts, rolePermissions } from '../../db/schema.js';
import type { OutboxSubscriberRegistry } from '../jobs/registry.js';
import type { NotificationService } from '../notifications/service.js';

export function registerInquiryPolicies(
  registry: OutboxSubscriberRegistry,
  notifications: NotificationService,
  db: Database,
): void {
  registry.subscribe('inquiry.created', async (event) => {
    const inquiryId = typeof event.payload.inquiryId === 'string' ? event.payload.inquiryId : '';
    if (!inquiryId) throw new Error('inquiry.created event is missing inquiryId');
    const recipients = await db
      .selectDistinct({ accountId: accounts.id })
      .from(accounts)
      .innerJoin(accountRoles, eq(accountRoles.accountId, accounts.id))
      .innerJoin(rolePermissions, eq(rolePermissions.roleId, accountRoles.roleId))
      .where(
        and(eq(accounts.status, 'active'), eq(rolePermissions.permissionCode, 'inquiries.read')),
      );
    for (const recipient of recipients) {
      await notifications.create({
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
      });
    }
  });
}
