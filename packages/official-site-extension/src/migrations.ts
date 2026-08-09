import { readFileSync } from 'node:fs';

import {
  defineMigrationExtension,
  defineMigrationSource,
} from '@lingcootech/frame-extension-sdk/migrations';
import { FRAME_VERSION } from '@lingcootech/frame-extension-sdk';

import { OFFICIAL_SITE_VERSION } from './contracts.js';

export const officialSiteMigrationSource = defineMigrationSource({
  id: 'official-site',
  version: OFFICIAL_SITE_VERSION,
  dependencies: [{ id: 'frame', version: `^${FRAME_VERSION}` }],
  migrations: [
    {
      id: '0001_initial.sql',
      sql: readFileSync(new URL('../migrations/0001_initial.sql', import.meta.url), 'utf8'),
    },
  ],
});

export const officialSiteMigrationExtension = defineMigrationExtension(officialSiteMigrationSource);
