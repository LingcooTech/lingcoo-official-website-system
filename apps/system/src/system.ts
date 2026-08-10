import { frameCoreExtension } from '@lingcootech/frame/extensions';
import { frameCmsExtension } from '@lingcootech/frame/cms';
import { defineSystem } from '@lingcootech/frame-extension-sdk';
import { officialSiteExtension } from '@lingcootech/official-site-extension';

export const officialSystem = defineSystem({
  id: 'lingcoo-official-website',
  version: '0.3.0',
  extensions: [frameCoreExtension, frameCmsExtension, officialSiteExtension],
});
