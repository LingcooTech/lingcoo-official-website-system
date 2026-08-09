import { createAdminRegistry } from '@lingcootech/frame-admin';
import { createFrameAdminExtension } from '@lingcootech/frame-admin/defaults';
import { frameAdminManifest } from '@lingcootech/frame-admin/manifest';
import { createCmsAdminClient, createCmsAdminExtension } from '@lingcootech/frame-cms/admin';
import { cmsManifest } from '@lingcootech/frame-cms/contracts';
import {
  defineExtension,
  defineSystem,
  FRAME_VERSION,
  projectExtensionManifest,
} from '@lingcootech/frame-extension-sdk';
import { officialSiteAdminExtension } from '@lingcootech/official-site-extension/admin';
import { officialSiteManifest } from '@lingcootech/official-site-extension/contracts';
import { apiRequest } from '@lingcootech/frame-admin/defaults';

export type AdminAppContext = Record<string, never>;

const frameDefinition = defineExtension({
  manifest: {
    id: 'frame',
    version: FRAME_VERSION,
    apiVersion: '1',
    frame: `^${FRAME_VERSION}`,
    admin: frameAdminManifest,
  },
  admin: createFrameAdminExtension<AdminAppContext>(),
});

const cmsDefinition = defineExtension({
  manifest: projectExtensionManifest(cmsManifest, ['admin']),
  admin: createCmsAdminExtension<AdminAppContext>({ client: createCmsAdminClient(apiRequest) }),
});

const officialDefinition = defineExtension({
  manifest: projectExtensionManifest(officialSiteManifest, ['admin']),
  admin: officialSiteAdminExtension,
});

export const adminSystem = defineSystem({
  id: 'lingcoo-official-admin',
  version: '0.2.0',
  extensions: [frameDefinition, cmsDefinition, officialDefinition],
});

export const adminRegistry = createAdminRegistry<AdminAppContext>(adminSystem);
