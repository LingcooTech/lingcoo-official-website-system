import type { Database } from '@lingcootech/frame-database';
import {
  accountRoles,
  accounts,
  auditLogs,
  outboxEvents,
  rolePermissions,
} from '@lingcootech/frame-database/schema';
import { and, count, desc, eq, ilike, or } from 'drizzle-orm';

import { inquiries } from './schema.js';
import type { CreateInquiryInput, InquiryListInput, UpdateInquiryInput } from './schemas.js';

function notFound(message: string): Error & { statusCode: number } {
  return Object.assign(new Error(message), { name: 'NotFoundError', statusCode: 404 });
}

function invalid(message: string): Error & { statusCode: number } {
  return Object.assign(new Error(message), { name: 'ValidationError', statusCode: 422 });
}

export class InquiryService {
  constructor(private readonly db: Database) {}

  async create(input: CreateInquiryInput) {
    return this.db.transaction(async (transaction) => {
      const [created] = await transaction
        .insert(inquiries)
        .values({
          name: input.name,
          email: input.email?.toLowerCase(),
          phone: input.phone,
          organization: input.organization,
          subject: input.subject,
          message: input.message,
          sourcePath: input.sourcePath,
          privacyConsent: input.privacyConsent,
        })
        .returning({ id: inquiries.id });
      await transaction.insert(auditLogs).values({
        action: 'inquiry.created',
        resourceType: 'inquiry',
        resourceId: created.id,
        metadata: { sourcePath: input.sourcePath },
      });
      await transaction.insert(outboxEvents).values({
        topic: 'inquiry.created',
        aggregateType: 'inquiry',
        aggregateId: created.id,
        payload: { inquiryId: created.id },
        dedupeKey: `inquiry.created:${created.id}`,
      });
      return created;
    });
  }

  async list(input: InquiryListInput) {
    const filters = [];
    if (input.status) filters.push(eq(inquiries.status, input.status));
    if (input.search) {
      const pattern = `%${input.search}%`;
      filters.push(
        or(
          ilike(inquiries.name, pattern),
          ilike(inquiries.email, pattern),
          ilike(inquiries.phone, pattern),
          ilike(inquiries.organization, pattern),
          ilike(inquiries.subject, pattern),
        )!,
      );
    }
    const where = filters.length ? and(...filters) : undefined;
    const offset = (input.page - 1) * input.pageSize;
    const [items, totalRows] = await Promise.all([
      this.db
        .select({
          inquiry: inquiries,
          assigneeEmail: accounts.email,
          assigneeName: accounts.displayName,
        })
        .from(inquiries)
        .leftJoin(accounts, eq(inquiries.assignedTo, accounts.id))
        .where(where)
        .orderBy(desc(inquiries.createdAt))
        .limit(input.pageSize)
        .offset(offset),
      this.db.select({ count: count() }).from(inquiries).where(where),
    ]);
    return {
      items: items.map(({ inquiry, assigneeEmail, assigneeName }) => ({
        ...inquiry,
        assignee: inquiry.assignedTo
          ? { id: inquiry.assignedTo, email: assigneeEmail, displayName: assigneeName }
          : null,
      })),
      total: Number(totalRows[0]?.count ?? 0),
      page: input.page,
      pageSize: input.pageSize,
    };
  }

  async get(inquiryId: string) {
    const [item] = await this.db
      .select()
      .from(inquiries)
      .where(eq(inquiries.id, inquiryId))
      .limit(1);
    if (!item) throw notFound('联系线索不存在');
    return item;
  }

  async listAssignees() {
    return this.db
      .selectDistinct({ id: accounts.id, email: accounts.email, displayName: accounts.displayName })
      .from(accounts)
      .innerJoin(accountRoles, eq(accountRoles.accountId, accounts.id))
      .innerJoin(rolePermissions, eq(rolePermissions.roleId, accountRoles.roleId))
      .where(
        and(eq(accounts.status, 'active'), eq(rolePermissions.permissionCode, 'inquiries.read')),
      )
      .orderBy(accounts.displayName);
  }

  async update(inquiryId: string, input: UpdateInquiryInput, actorId: string) {
    const current = await this.get(inquiryId);
    if (input.assignedTo) {
      const [assignee] = await this.db
        .select({ id: accounts.id })
        .from(accounts)
        .where(and(eq(accounts.id, input.assignedTo), eq(accounts.status, 'active')))
        .limit(1);
      if (!assignee) throw invalid('指定的负责人不存在或已停用');
    }
    return this.db.transaction(async (transaction) => {
      const [updated] = await transaction
        .update(inquiries)
        .set({
          ...(input.status !== undefined ? { status: input.status } : {}),
          ...(input.assignedTo !== undefined ? { assignedTo: input.assignedTo } : {}),
          ...(input.internalNote !== undefined ? { internalNote: input.internalNote } : {}),
          ...(input.status === 'resolved'
            ? { handledAt: new Date(), handledBy: actorId }
            : input.status !== undefined
              ? { handledAt: null, handledBy: null }
              : {}),
          updatedAt: new Date(),
        })
        .where(eq(inquiries.id, inquiryId))
        .returning();
      await transaction.insert(auditLogs).values({
        action: 'inquiry.updated',
        resourceType: 'inquiry',
        resourceId: inquiryId,
        actorId,
        metadata: {
          previousStatus: current.status,
          status: updated.status,
          assignmentChanged: input.assignedTo !== undefined,
          noteChanged: input.internalNote !== undefined,
        },
      });
      return updated;
    });
  }
}
