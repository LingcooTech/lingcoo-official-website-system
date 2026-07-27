import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';
import sensible from '@fastify/sensible';
import fastifyStatic from '@fastify/static';
import Fastify from 'fastify';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { ZodError } from 'zod';

import { createDb } from './db/client.js';
import { isRequestHostAllowed } from './lib/domain-binding.js';
import type { AppEnv } from './lib/env.js';
import { appModules } from './modules/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CSP_DIRECTIVES = {
  defaultSrc: ["'self'"],
  scriptSrc: ["'self'", "'unsafe-inline'"],
  styleSrc: ["'self'", "'unsafe-inline'"],
  imgSrc: ["'self'", 'data:', 'blob:', 'https:'],
  fontSrc: ["'self'", 'data:', 'https:'],
  connectSrc: ["'self'", 'https:'],
};

function resolveRuntimePath(...segments: string[]): string {
  return path.resolve(__dirname, '..', ...segments);
}

function parseCorsOrigin(value: string): string[] | boolean {
  const items = value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
  return items.length > 0 ? items : true;
}

export async function buildApp(env: AppEnv) {
  const app = Fastify({
    logger: { level: env.LOG_LEVEL },
    trustProxy: true,
  });

  const { db, pool } = createDb(env.DATABASE_URL);
  app.decorate('db', db);
  app.decorate('appEnv', env);
  app.addHook('onClose', async () => {
    await pool.end();
  });

  await app.register(sensible);
  await app.register(cors, {
    origin: parseCorsOrigin(env.CORS_ORIGIN),
    credentials: true,
  });
  await app.register(helmet, {
    contentSecurityPolicy: { directives: CSP_DIRECTIVES },
  });
  await app.register(rateLimit, {
    max: 300,
    timeWindow: '1 minute',
  });

  // 生产环境把部署绑定到 lingcoo.com；未绑定时放行。
  app.addHook('onRequest', async (request, reply) => {
    if (
      !isRequestHostAllowed({
        bindingSource: env.FD_DOMAIN_BINDING_SOURCE,
        boundHost: env.FD_BOUND_HOST,
        requestHost: request.headers.host,
      })
    ) {
      return reply.code(421).send({
        error: 'MisdirectedRequest',
        message: '当前域名未绑定到此部署',
      });
    }
  });

  for (const appModule of appModules) {
    await app.register(appModule.register);
  }

  // 单进程同时静态托管后台（/admin/）与官网前台（/）。构建产物存在时才挂载。
  const adminDist = resolveRuntimePath('admin-ui/dist');
  if (existsSync(adminDist)) {
    await app.register(fastifyStatic, {
      root: adminDist,
      prefix: '/admin/',
      decorateReply: false,
    });
  }

  const publicDist = resolveRuntimePath('public-web/dist');
  if (existsSync(publicDist)) {
    await app.register(fastifyStatic, {
      root: publicDist,
      prefix: '/',
    });
  }

  app.setErrorHandler((error, request, reply) => {
    request.log.error({ err: error }, 'request failed');

    if (error instanceof ZodError) {
      return reply.status(400).send({
        error: 'ValidationError',
        details: error.flatten(),
      });
    }

    const statusCode =
      typeof (error as { statusCode?: number }).statusCode === 'number'
        ? (error as { statusCode: number }).statusCode
        : 500;

    const normalizedError = error instanceof Error ? error : new Error('Internal Server Error');
    return reply.status(statusCode).send({
      error: normalizedError.name || 'Error',
      message: statusCode >= 500 ? '服务器开小差了，请稍后再试' : '操作失败',
    });
  });

  app.setNotFoundHandler((request, reply) => {
    if (request.method !== 'GET') {
      return reply.status(404).send({ error: 'NotFound', message: '接口不存在' });
    }

    if (request.url.startsWith('/admin') && existsSync(adminDist)) {
      return reply.sendFile('index.html', adminDist);
    }

    const apiPrefixes = ['/v1/', '/api/', '/health', '/ready'];
    if (apiPrefixes.some((prefix) => request.url.startsWith(prefix))) {
      return reply.status(404).send({ error: 'NotFound', message: '接口不存在' });
    }

    // SSG 已为每个路由预渲染 HTML；此处兜底 SPA fallback。
    if (existsSync(publicDist)) {
      return reply.sendFile('index.html', publicDist);
    }

    return reply.status(404).send({ error: 'NotFound', message: '页面不存在' });
  });

  return app;
}
