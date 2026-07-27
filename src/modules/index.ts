import { healthModule } from './health/index.js';

export interface AppModule {
  register: (app: import('fastify').FastifyInstance) => Promise<void> | void;
}

export const appModules: AppModule[] = [healthModule];
