import { cmsManifest } from '@lingcootech/frame-cms/contracts';
import { createCmsWebClient, createCmsWebExtension } from '@lingcootech/frame-cms/web';
import {
  defineExtension,
  defineSystem,
  FRAME_VERSION,
  projectExtensionManifest,
} from '@lingcootech/frame-extension-sdk';
import { createWebRegistry, defineWebExtension } from '@lingcootech/frame-web';
import { frameWebManifest } from '@lingcootech/frame-web/manifest';
import type { PublicPresentation } from '@lingcootech/frame-web/presentation';
import { officialSiteManifest } from '@lingcootech/official-site-extension/contracts';
import {
  officialSiteWebExtension,
  type OfficialWebContext,
} from '@lingcootech/official-site-extension/web';

import { AuthRoute } from './auth-route';

export interface PublicWebContext extends OfficialWebContext {
  presentation: PublicPresentation | null;
}

const frameDefinition = defineExtension({
  manifest: {
    id: 'frame',
    version: FRAME_VERSION,
    apiVersion: '1',
    frame: `^${FRAME_VERSION}`,
    web: frameWebManifest,
  },
  web: defineWebExtension<PublicWebContext>({
    routes: [{ id: 'frame.auth', component: AuthRoute }],
  }),
});

const cmsDefinition = defineExtension({
  manifest: projectExtensionManifest(cmsManifest, ['web']),
  web: createCmsWebExtension<PublicWebContext>({
    client: createCmsWebClient((path, init) => fetch(path, init)),
    resolvePresentation: (context) => context.presentation,
  }),
});

const officialDefinition = defineExtension({
  manifest: projectExtensionManifest(officialSiteManifest, ['web']),
  web: officialSiteWebExtension,
});

export const webSystem = defineSystem({
  id: 'lingcoo-official-web',
  version: '0.2.0',
  extensions: [frameDefinition, cmsDefinition, officialDefinition],
});

export const webRegistry = createWebRegistry<PublicWebContext>(webSystem);
