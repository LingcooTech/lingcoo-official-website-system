CREATE TABLE IF NOT EXISTS "inquiries" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "name" text NOT NULL,
  "email" text,
  "phone" text,
  "organization" text,
  "subject" text,
  "message" text NOT NULL,
  "status" text DEFAULT 'new' NOT NULL,
  "source_path" text DEFAULT '/contact' NOT NULL,
  "privacy_consent" boolean NOT NULL,
  "assigned_to" uuid REFERENCES "accounts" ("id") ON DELETE SET NULL,
  "internal_note" text,
  "handled_at" timestamp with time zone,
  "handled_by" uuid REFERENCES "accounts" ("id") ON DELETE SET NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT "inquiries_status_check" CHECK ("status" IN ('new', 'in_progress', 'resolved', 'archived')),
  CONSTRAINT "inquiries_contact_check" CHECK ("email" IS NOT NULL OR "phone" IS NOT NULL)
);

CREATE INDEX IF NOT EXISTS "inquiries_status_created_idx"
  ON "inquiries" ("status", "created_at" DESC);
CREATE INDEX IF NOT EXISTS "inquiries_assigned_status_idx"
  ON "inquiries" ("assigned_to", "status");

INSERT INTO "permissions" ("code", "name", "description") VALUES
  ('inquiries.read', '查看联系线索', '读取官网访问者提交的联系与合作线索'),
  ('inquiries.write', '处理联系线索', '分配、跟进和更新官网联系线索')
ON CONFLICT ("code") DO NOTHING;

INSERT INTO "role_permissions" ("role_id", "permission_code")
SELECT role.id, permission.code
FROM "roles" role
JOIN "permissions" permission ON permission.code IN ('inquiries.read', 'inquiries.write')
WHERE role.code IN ('owner', 'administrator', 'operator')
ON CONFLICT DO NOTHING;

INSERT INTO "presentation_profiles" (
  "id", "display_name", "short_name", "slogan", "primary_color", "secondary_color",
  "accent_color", "contact_email", "public_url", "seo_title", "seo_description",
  "header_navigation", "footer_links", "footer_copyright", "version"
) VALUES (
  'default',
  'Lingcoo',
  'Lingcoo',
  '让复杂系统，清晰生长',
  '#16362c',
  '#d7eee4',
  '#1f7a5a',
  'hello@lingcoo.com',
  'https://www.lingcoo.com',
  'Lingcoo · 轻量、自有、可持续演进的数字系统',
  'Lingcoo 面向教育、零售与组织运营场景，设计并交付轻量、自有、可快速部署的数字系统。',
  '[{"label":"解决方案","href":"/#solutions"},{"label":"方法","href":"/#approach"},{"label":"内容","href":"/articles"},{"label":"联系","href":"/#contact"}]'::jsonb,
  '[{"label":"解决方案","href":"/#solutions"},{"label":"内容","href":"/articles"},{"label":"联系我们","href":"/#contact"}]'::jsonb,
  '© 2026 Lingcoo',
  1
)
ON CONFLICT ("id") DO NOTHING;
