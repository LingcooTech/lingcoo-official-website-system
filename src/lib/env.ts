import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  APP_NAME: z.string().default('lingcoo-official-website'),
  APP_VERSION: z.string().default('development'),
  API_HOST: z.string().default('0.0.0.0'),
  API_PORT: z.coerce.number().int().positive().default(8090),
  CORS_ORIGIN: z.string().default('http://localhost:5173,http://localhost:5174'),
  JWT_SECRET: z.string().min(12).default('change-me-in-production'),
  DATABASE_URL: z
    .string()
    .default('postgres://lingcoo:lingcoo_password@localhost:5432/lingcoo'),
  LOG_LEVEL: z.string().default('info'),

  // 域名绑定：交付到正式服务器后由安装脚本锁定为 lingcoo.com。
  FD_DOMAIN_BINDING_SOURCE: z.string().default('none'),
  FD_BOUND_HOST: z.string().optional(),

  // 官网前台对外基础 URL（用于站点地图 / 分享链接等）。
  PUBLIC_WEB_BASE_URL: z.string().default('http://localhost:5174'),
});

export type AppEnv = z.infer<typeof envSchema>;

export function loadEnv(): AppEnv {
  return envSchema.parse(process.env);
}
