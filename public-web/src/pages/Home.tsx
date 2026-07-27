import { ArrowRight, Boxes, GraduationCap, Layers, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

import Container from '@/components/Container';
import Seo from '@/components/Seo';
import { site, type BusinessItem } from '@/content/site';

const iconMap = {
  layers: Layers,
  boxes: Boxes,
  'graduation-cap': GraduationCap,
  sparkles: Sparkles,
} as const;

function BusinessCard({ item }: { item: BusinessItem }) {
  const Icon = iconMap[item.icon];
  return (
    <div className="rounded-2xl border border-line bg-surface p-8 transition-shadow hover:shadow-sm">
      <Icon className="h-6 w-6 text-ink" strokeWidth={1.5} />
      <h3 className="mt-5 text-lg font-medium">{item.title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-muted">{item.description}</p>
    </div>
  );
}

export default function Home() {
  return (
    <>
      <Seo />
      {/* Hero */}
      <section className="border-b border-line">
        <Container className="py-24 md:py-36">
          <p className="text-sm font-medium tracking-widest text-muted uppercase">{site.domain}</p>
          <h1 className="mt-6 max-w-3xl text-4xl leading-tight font-semibold tracking-tight text-balance md:text-6xl">
            {site.tagline}
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-ink-soft">{site.description}</p>
          <div className="mt-10 flex flex-wrap items-center gap-4">
            <Link
              to="/business"
              className="inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3 text-sm font-medium text-white transition-opacity hover:opacity-90"
            >
              了解业务
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 rounded-full border border-line px-6 py-3 text-sm font-medium text-ink transition-colors hover:bg-paper"
            >
              联系我们
            </Link>
          </div>
        </Container>
      </section>

      {/* Business */}
      <section>
        <Container className="py-20 md:py-28">
          <div className="max-w-2xl">
            <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">我们做什么</h2>
            <p className="mt-3 text-muted">围绕数字产品与系统，提供从设计、研发到交付的一体化能力。</p>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {site.business.map((item) => (
              <BusinessCard key={item.title} item={item} />
            ))}
          </div>
        </Container>
      </section>

      {/* CTA */}
      <section className="border-t border-line bg-surface">
        <Container className="flex flex-col items-start justify-between gap-6 py-16 md:flex-row md:items-center">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">有项目想聊聊？</h2>
            <p className="mt-2 text-muted">告诉我们你的想法，我们会尽快回复。</p>
          </div>
          <Link
            to="/contact"
            className="inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3 text-sm font-medium text-white transition-opacity hover:opacity-90"
          >
            联系我们
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Container>
      </section>
    </>
  );
}
