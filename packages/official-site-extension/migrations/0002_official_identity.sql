UPDATE "presentation_profiles"
SET
  "display_name" = '灵可智能',
  "short_name" = 'LingcooTech',
  "slogan" = '让复杂系统，清晰生长',
  "seo_title" = '灵可智能 · 让复杂系统，清晰生长',
  "seo_description" = '灵可智能专注于企业数字系统、行业应用与软件产品的设计、开发和持续交付。',
  "header_navigation" = '[{"label":"首页","href":"/"},{"label":"服务","href":"#services"},{"label":"关于我们","href":"#about"},{"label":"联系我们","href":"#contact"}]'::jsonb,
  "footer_links" = '[{"label":"服务","href":"#services"},{"label":"关于我们","href":"#about"},{"label":"联系我们","href":"#contact"}]'::jsonb,
  "footer_copyright" = '© 2026 灵可智能',
  "filing_info" = '鲁ICP备2026041221号-1',
  "version" = "version" + 1,
  "updated_at" = now()
WHERE "id" = 'default';
