import type { FastifyInstance } from 'fastify';

export const healthModule = {
  register(app: FastifyInstance) {
    app.get('/health', async () => ({
      status: 'ok',
      name: app.appEnv.APP_NAME,
      version: app.appEnv.APP_VERSION,
      uptime: Math.round(process.uptime()),
    }));
  },
};
