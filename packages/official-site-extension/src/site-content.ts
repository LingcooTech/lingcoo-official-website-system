import type { PublicNavigationItem, PublicPresentation } from '@lingcootech/frame-web/presentation';

export const OFFICIAL_SITE_NAME = '灵可智能';
export const OFFICIAL_SITE_ENGLISH_NAME = 'LingcooTech';
export const OFFICIAL_SITE_SLOGAN = '让复杂系统，清晰生长';
export const OFFICIAL_SITE_LEGAL_ENTITY = '青岛市市北区灵可天成智能科技工作室（个体工商户）';
export const OFFICIAL_SITE_ICP_NUMBER = '鲁ICP备2026041221号-1';
export const OFFICIAL_SITE_ICP_URL = 'https://beian.miit.gov.cn/';

export const officialHeaderNavigation = [
  { label: '首页', href: '/' },
  { label: '服务', href: '#services' },
  { label: '关于我们', href: '#about' },
  { label: '联系我们', href: '#contact' },
] as const satisfies readonly PublicNavigationItem[];

export const officialFooterNavigation = [
  { label: '服务', href: '#services' },
  { label: '关于我们', href: '#about' },
  { label: '联系我们', href: '#contact' },
] as const satisfies readonly PublicNavigationItem[];

export const officialFallbackPresentation = {
  displayName: OFFICIAL_SITE_NAME,
  shortName: OFFICIAL_SITE_ENGLISH_NAME,
  slogan: OFFICIAL_SITE_SLOGAN,
  fullLogoAssetId: null,
  squareLogoAssetId: null,
  darkLogoAssetId: null,
  faviconAssetId: null,
  socialImageAssetId: null,
  primaryColor: '#16362c',
  secondaryColor: '#d7eee4',
  accentColor: '#1f7a5a',
  contactEmail: 'hello@lingcoo.com',
  contactPhone: null,
  contactAddress: null,
  publicUrl: 'https://www.lingcoo.com',
  seoTitle: `${OFFICIAL_SITE_NAME} · ${OFFICIAL_SITE_SLOGAN}`,
  seoDescription: '灵可智能专注于企业数字系统、行业应用与软件产品的设计、开发和持续交付。',
  headerNavigation: officialHeaderNavigation,
  footerLinks: officialFooterNavigation,
  footerCopyright: `© 2026 ${OFFICIAL_SITE_NAME}`,
  filingInfo: OFFICIAL_SITE_ICP_NUMBER,
  assets: {},
} as const satisfies PublicPresentation;

export function resolveOfficialPresentation(
  presentation: PublicPresentation | null,
): PublicPresentation {
  return {
    ...officialFallbackPresentation,
    ...(presentation ?? {}),
    displayName: OFFICIAL_SITE_NAME,
    shortName: OFFICIAL_SITE_ENGLISH_NAME,
    slogan: OFFICIAL_SITE_SLOGAN,
    headerNavigation: officialHeaderNavigation,
    footerLinks: officialFooterNavigation,
    footerCopyright: `© 2026 ${OFFICIAL_SITE_NAME}`,
    filingInfo: OFFICIAL_SITE_ICP_NUMBER,
  };
}
