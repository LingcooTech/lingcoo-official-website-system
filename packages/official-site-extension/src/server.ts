import type { Database } from '@lingcootech/frame-database';
import { defineServerExtension } from '@lingcootech/frame-extension-sdk/server';
import type { FastifyInstance, FastifyRequest } from 'fastify';

import {
  createInquirySchema,
  inquiryListSchema,
  inquiryParamsSchema,
  updateInquirySchema,
} from './schemas.js';
import { InquiryService } from './service.js';

export interface OfficialSiteApp extends FastifyInstance {
  db: Database;
  requirePermission(permission: string): (request: FastifyRequest) => Promise<void>;
  publicSiteRegistry: {
    registerSitemapCollector(
      id: string,
      collector: () => Promise<readonly { path: string }[]>,
    ): void;
  };
}

export const officialSiteServerExtension = defineServerExtension<OfficialSiteApp>({
  register({ app }) {
    const service = new InquiryService(app.db);
    app.publicSiteRegistry.registerSitemapCollector('official-site.static', async () => [
      { path: '/' },
    ]);

    app.post(
      '/api/public/inquiries',
      { config: { rateLimit: { max: 5, timeWindow: '15 minutes' } } },
      async (request, reply) => {
        const input = createInquirySchema.parse(request.body);
        if (input.website) return reply.code(202).send({ accepted: true });
        await service.create(input);
        return reply.code(202).send({ accepted: true });
      },
    );
    app.get(
      '/api/inquiries',
      { preHandler: app.requirePermission('inquiries.read') },
      async (request) => service.list(inquiryListSchema.parse(request.query)),
    );
    app.get(
      '/api/inquiries/assignees',
      { preHandler: app.requirePermission('inquiries.read') },
      async () => ({ items: await service.listAssignees() }),
    );
    app.get(
      '/api/inquiries/:inquiryId',
      { preHandler: app.requirePermission('inquiries.read') },
      async (request) => ({
        inquiry: await service.get(inquiryParamsSchema.parse(request.params).inquiryId),
      }),
    );
    app.patch(
      '/api/inquiries/:inquiryId',
      { preHandler: app.requirePermission('inquiries.write') },
      async (request) => {
        const auth = (request as FastifyRequest & { auth: { accountId: string } | null }).auth;
        if (!auth) {
          throw Object.assign(new Error('Authentication required'), { statusCode: 401 });
        }
        return {
          inquiry: await service.update(
            inquiryParamsSchema.parse(request.params).inquiryId,
            updateInquirySchema.parse(request.body),
            auth.accountId,
          ),
        };
      },
    );
  },
});
