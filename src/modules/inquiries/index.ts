import type { AppModule } from '../types.js';
import {
  createInquirySchema,
  inquiryListSchema,
  inquiryParamsSchema,
  updateInquirySchema,
} from './schemas.js';
import { InquiryService } from './service.js';

export const inquiriesModule: AppModule = {
  name: 'inquiries',
  register(app) {
    const service = new InquiryService(app.db);

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
      async (request) => ({
        inquiry: await service.update(
          inquiryParamsSchema.parse(request.params).inquiryId,
          updateInquirySchema.parse(request.body),
          request.auth!.accountId,
        ),
      }),
    );
  },
};
