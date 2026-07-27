import { ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';

import { site } from '@/content/site';
import Container from './Container';

export default function Footer() {
  const year = new Date().getFullYear();
  const { beian, contact } = site;
  const policeHref = beian.policeCode
    ? `${beian.policeUrl}#/query/webSearch?code=${beian.policeCode}`
    : beian.policeUrl;

  return (
    <footer className="border-t border-line bg-surface">
      <Container className="grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div className="lg:col-span-2">
          <div className="text-lg font-semibold tracking-tight">{site.name}</div>
          <p className="mt-3 max-w-sm text-sm leading-relaxed text-muted">{site.description}</p>
        </div>
        <div>
          <div className="text-sm font-medium">导航</div>
          <ul className="mt-4 space-y-2 text-sm text-muted">
            {site.nav.map((item) => (
              <li key={item.href}>
                <Link to={item.href} className="transition-colors hover:text-ink">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <div className="text-sm font-medium">联系</div>
          <ul className="mt-4 space-y-2 text-sm text-muted">
            <li>
              <a href={`mailto:${contact.email}`} className="transition-colors hover:text-ink">
                {contact.email}
              </a>
            </li>
            <li>{contact.phone}</li>
          </ul>
        </div>
      </Container>

      {/* 备案信息栏 —— 公安备案的核心承载，全站每页可见 */}
      <div className="border-t border-line">
        <Container className="flex flex-col items-center gap-3 py-6 text-xs text-muted md:flex-row md:justify-between">
          <p>
            © {year} {site.legalName || site.name}. 保留所有权利。
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
            {beian.icp ? (
              <a
                href={beian.icpUrl}
                target="_blank"
                rel="noreferrer"
                className="transition-colors hover:text-ink"
              >
                {beian.icp}
              </a>
            ) : (
              <span className="opacity-60">ICP 备案号 · 待填</span>
            )}
            {beian.police ? (
              <a
                href={policeHref}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 transition-colors hover:text-ink"
              >
                {/* TODO: 替换为公安部下发的官方备案徽标 PNG */}
                <ShieldCheck className="h-3.5 w-3.5" aria-hidden />
                {beian.police}
              </a>
            ) : (
              <span className="inline-flex items-center gap-1.5 opacity-60">
                <ShieldCheck className="h-3.5 w-3.5" aria-hidden />
                公安备案号 · 待填
              </span>
            )}
          </div>
        </Container>
      </div>
    </footer>
  );
}
