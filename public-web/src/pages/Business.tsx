import { Boxes, GraduationCap, Layers, Sparkles } from 'lucide-react';

import Container from '@/components/Container';
import Seo from '@/components/Seo';
import { site } from '@/content/site';

const iconMap = {
  layers: Layers,
  boxes: Boxes,
  'graduation-cap': GraduationCap,
  sparkles: Sparkles,
} as const;

export default function Business() {
  return (
    <>
      <Seo title="业务" />
      <section className="border-b border-line">
        <Container className="py-20 md:py-28">
          <h1 className="text-3xl font-semibold tracking-tight md:text-5xl">业务</h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-ink-soft">
            我们围绕数字产品与系统，提供从设计、研发到交付的一体化能力。
          </p>
        </Container>
      </section>
      <section>
        <Container className="py-16 md:py-24">
          <div className="grid gap-px overflow-hidden rounded-2xl border border-line bg-line md:grid-cols-2">
            {site.business.map((item) => {
              const Icon = iconMap[item.icon];
              return (
                <div key={item.title} className="bg-surface p-8 md:p-10">
                  <Icon className="h-6 w-6" strokeWidth={1.5} />
                  <h2 className="mt-5 text-lg font-medium">{item.title}</h2>
                  <p className="mt-2 leading-relaxed text-muted">{item.description}</p>
                </div>
              );
            })}
          </div>
        </Container>
      </section>
    </>
  );
}
