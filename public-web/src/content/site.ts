/**
 * 官网内容集中配置（v1 硬编码）。
 * 备案号、公司信息、联系方式、业务介绍都在这里改；v2 迁移到自建后台后由 API 提供。
 *
 * ⚠️ 待填项已用「待填」标注 —— 上线备案前请补全。
 */

export interface NavItem {
  label: string;
  href: string;
}

export interface BusinessItem {
  title: string;
  description: string;
  icon: 'layers' | 'boxes' | 'graduation-cap' | 'sparkles';
}

export const site = {
  name: 'Lingcoo',
  // 营业执照 / 备案主体全称，用于页脚版权与法务信息
  legalName: '（公司主体全称 · 待填）',
  domain: 'lingcoo.com',
  tagline: '把复杂留给我们，把简单交给你',
  description:
    'Lingcoo 是一家专注于数字产品与系统的科技公司，为客户提供从设计到交付的一体化解决方案。',

  nav: [
    { label: '关于', href: '/about' },
    { label: '业务', href: '/business' },
    { label: '联系', href: '/contact' },
  ] satisfies NavItem[],

  contact: {
    email: 'hello@lingcoo.com',
    phone: '（联系电话 · 待填）',
    address: '（公司地址 · 待填）',
  },

  // 页脚备案信息 —— 备案通过后填写并同步上线
  beian: {
    // 例：京ICP备2026XXXXXX号-1
    icp: '',
    icpUrl: 'https://beian.miit.gov.cn/',
    // 例：京公网安备 11010XXXXXXXXXX号
    police: '',
    policeUrl: 'https://beian.mps.gov.cn/',
    // 纯数字备案编号，用于拼接查询链接（备案通过后由公安平台提供）
    policeCode: '',
  },

  business: [
    {
      title: '产品与平台',
      description: '从 0 到 1 打造可持续演进的数字产品，覆盖 Web、小程序与后台系统。',
      icon: 'layers',
    },
    {
      title: '零售与电商',
      description: '面向单店与连锁的私有部署零售电商系统，买家端、商家后台与业务中台一体化。',
      icon: 'boxes',
    },
    {
      title: '教育与运营',
      description: '为培训机构提供招生、排课、签到、消课的一体化运营系统。',
      icon: 'graduation-cap',
    },
  ] satisfies BusinessItem[],

  copyrightStartYear: 2026,
};

export type Site = typeof site;
