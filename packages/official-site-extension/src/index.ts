import { defineExtension } from '@lingcootech/frame-extension-sdk';

import { officialSiteManifest } from './contracts.js';
import { officialSiteMigrationExtension } from './migrations.js';
import { officialSiteServerExtension } from './server.js';
import { officialSiteWorkerExtension } from './worker.js';

export const officialSiteExtension = defineExtension({
  manifest: officialSiteManifest,
  server: officialSiteServerExtension,
  worker: officialSiteWorkerExtension,
  migrations: officialSiteMigrationExtension,
});

export { officialSiteManifest } from './contracts.js';
