import type { AppEnv } from '../lib/env.js';
import type { Db } from '../db/client.js';

declare module 'fastify' {
  interface FastifyInstance {
    db: Db;
    appEnv: AppEnv;
  }
}

export {};
