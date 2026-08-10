import { FRAME_VERSION, type ExtensionManifest } from '@lingcootech/frame-extension-sdk';

export const OFFICIAL_SITE_VERSION = '0.3.0';

export const officialSiteManifest = {
  id: 'official-site',
  version: OFFICIAL_SITE_VERSION,
  apiVersion: '1',
  frame: `^${FRAME_VERSION}`,
  dependencies: [{ id: 'frame', version: `^${FRAME_VERSION}` }],
  permissions: ['inquiries.read', 'inquiries.write'],
  server: {
    routes: [
      { method: 'POST', path: '/api/public/inquiries' },
      { method: 'GET', path: '/api/inquiries' },
      { method: 'GET', path: '/api/inquiries/assignees' },
      { method: 'GET', path: '/api/inquiries/:inquiryId' },
      { method: 'PATCH', path: '/api/inquiries/:inquiryId' },
    ],
  },
  worker: { subscriptions: ['inquiry.created'] },
  migrations: {
    sourceId: 'official-site',
    migrations: [{ id: '0001_initial.sql' }, { id: '0002_official_identity.sql' }],
  },
  admin: {
    routes: [
      {
        id: 'official.home',
        path: '/',
        title: '官网运营',
        description: '官网内容、联系线索与运行状态概览。',
        permission: 'admin.access',
      },
      {
        id: 'official.inquiries',
        path: '/inquiries/*',
        title: '联系线索',
        description: '查看并跟进官网访问者提交的项目咨询。',
        permission: 'inquiries.read',
      },
    ],
    navigation: [
      {
        id: 'official.home',
        routeId: 'official.home',
        href: '/',
        label: '官网概览',
        group: '官网运营',
        order: 10,
      },
      {
        id: 'official.inquiries',
        routeId: 'official.inquiries',
        href: '/inquiries',
        label: '联系线索',
        group: '官网运营',
        order: 20,
      },
    ],
  },
  web: {
    routes: [{ id: 'official.home', path: '/' }],
    seo: [{ id: 'official.home', routeId: 'official.home' }],
    sitemap: [{ id: 'official.home' }],
  },
} as const satisfies ExtensionManifest;
