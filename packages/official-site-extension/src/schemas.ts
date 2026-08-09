import { z } from 'zod';

const optionalContact = z
  .string()
  .trim()
  .max(254)
  .optional()
  .transform((value) => value || undefined);

export const createInquirySchema = z
  .object({
    name: z.string().trim().min(1).max(100),
    email: optionalContact.pipe(z.email().optional()),
    phone: optionalContact.pipe(z.string().max(50).optional()),
    organization: z
      .string()
      .trim()
      .max(200)
      .optional()
      .transform((value) => value || undefined),
    subject: z
      .string()
      .trim()
      .max(200)
      .optional()
      .transform((value) => value || undefined),
    message: z.string().trim().min(10).max(4000),
    sourcePath: z.string().trim().startsWith('/').max(500).default('/contact'),
    privacyConsent: z.literal(true),
    website: z.string().max(200).optional(),
  })
  .refine((input) => Boolean(input.email || input.phone), {
    message: '请至少填写邮箱或联系电话',
    path: ['email'],
  });

export const inquiryListSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(30),
  status: z.enum(['new', 'in_progress', 'resolved', 'archived']).optional(),
  search: z.string().trim().max(120).optional(),
});

export const inquiryParamsSchema = z.object({ inquiryId: z.uuid() });

export const updateInquirySchema = z
  .object({
    status: z.enum(['new', 'in_progress', 'resolved', 'archived']).optional(),
    assignedTo: z.uuid().nullable().optional(),
    internalNote: z.string().trim().max(4000).nullable().optional(),
  })
  .refine((input) => Object.values(input).some((value) => value !== undefined), {
    message: '至少需要更新一个字段',
  });

export type CreateInquiryInput = z.infer<typeof createInquirySchema>;
export type InquiryListInput = z.infer<typeof inquiryListSchema>;
export type UpdateInquiryInput = z.infer<typeof updateInquirySchema>;
