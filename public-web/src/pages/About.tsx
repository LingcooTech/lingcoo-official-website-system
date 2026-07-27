import Container from '@/components/Container';
import Seo from '@/components/Seo';
import { site } from '@/content/site';

export default function About() {
  return (
    <>
      <Seo title="关于我们" description={`关于 ${site.name}`} />
      <section className="border-b border-line">
        <Container className="py-20 md:py-28">
          <h1 className="text-3xl font-semibold tracking-tight md:text-5xl">关于我们</h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-ink-soft">{site.description}</p>
        </Container>
      </section>
      <section>
        <Container className="grid gap-12 py-20 md:grid-cols-2 md:py-28">
          <div>
            <h2 className="text-xl font-medium">我们的理念</h2>
            <p className="mt-4 leading-relaxed text-muted">
              （公司愿景与价值观 · 待填）我们相信好的产品源于对细节的克制与对用户的尊重，
              以长期主义打磨每一个交付。
            </p>
          </div>
          <div>
            <h2 className="text-xl font-medium">我们的方式</h2>
            <p className="mt-4 leading-relaxed text-muted">
              （团队方法论 · 待填）从需求到交付，我们坚持统一的工程标准与一致的设计语言，
              让系统可持续演进。
            </p>
          </div>
        </Container>
      </section>
    </>
  );
}
