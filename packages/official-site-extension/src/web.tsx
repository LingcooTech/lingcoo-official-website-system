import { type WebRouteContext, defineWebExtension } from '@lingcootech/frame-web';
import { Container, Hero, Section } from '@lingcootech/frame-web/layout';
import type { PublicPresentation } from '@lingcootech/frame-web/presentation';
import { SeoHead } from '@lingcootech/frame-web/seo';
import { SiteBrand, SiteHeader } from '@lingcootech/frame-web/site';
import { Alert } from '@lingcootech/frame-ui/alert';
import { Button } from '@lingcootech/frame-ui/button';
import { Checkbox } from '@lingcootech/frame-ui/checkbox';
import { FormField } from '@lingcootech/frame-ui/form-field';
import { Input } from '@lingcootech/frame-ui/input';
import { Textarea } from '@lingcootech/frame-ui/textarea';
import {
  ArrowRight,
  Building2,
  CheckCircle2,
  GraduationCap,
  Mail,
  Send,
  Store,
  Workflow,
} from 'lucide-react';
import { useState, type FormEvent, type ReactNode } from 'react';

import {
  OFFICIAL_SITE_ENGLISH_NAME,
  OFFICIAL_SITE_ICP_NUMBER,
  OFFICIAL_SITE_ICP_URL,
  OFFICIAL_SITE_LEGAL_ENTITY,
  OFFICIAL_SITE_NAME,
  OFFICIAL_SITE_PUBLIC_SECURITY_NUMBER,
  OFFICIAL_SITE_PUBLIC_SECURITY_URL,
  officialFooterNavigation,
  officialHeaderNavigation,
  resolveOfficialPresentation,
} from './site-content.js';

export interface OfficialWebContext {
  presentation: PublicPresentation | null;
}

type SubmitState = 'idle' | 'submitting' | 'success' | 'error';

function InquiryForm() {
  const [state, setState] = useState<SubmitState>('idle');
  const [consent, setConsent] = useState(false);
  const [error, setError] = useState('');

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    setState('submitting');
    setError('');
    const values = Object.fromEntries(new FormData(form).entries());
    try {
      const response = await fetch('/api/public/inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...values,
          privacyConsent: consent,
          sourcePath: window.location.pathname,
        }),
      });
      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as { message?: string } | null;
        throw new Error(payload?.message ?? '提交失败，请稍后重试');
      }
      form.reset();
      setConsent(false);
      setState('success');
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : '提交失败，请稍后重试');
      setState('error');
    }
  }

  return (
    <form className="inquiry-form" onSubmit={submit}>
      <div className="inquiry-form__grid">
        <FormField label="您的称呼" required>
          {({ controlId }) => <Input id={controlId} name="name" autoComplete="name" required />}
        </FormField>
        <FormField label="公司或机构">
          {({ controlId }) => (
            <Input id={controlId} name="organization" autoComplete="organization" />
          )}
        </FormField>
        <FormField label="工作邮箱" description="邮箱或电话至少填写一项">
          {({ controlId }) => (
            <Input id={controlId} name="email" autoComplete="email" type="email" />
          )}
        </FormField>
        <FormField label="联系电话">
          {({ controlId }) => <Input id={controlId} name="phone" autoComplete="tel" />}
        </FormField>
      </div>
      <FormField label="希望解决的问题">
        {({ controlId }) => <Input id={controlId} name="subject" />}
      </FormField>
      <FormField label="项目情况" required>
        {({ controlId }) => (
          <Textarea
            id={controlId}
            name="message"
            minLength={10}
            rows={6}
            required
            placeholder="请简单描述当前业务、使用对象、主要问题和期望上线时间。"
          />
        )}
      </FormField>
      <div className="inquiry-form__honeypot" aria-hidden>
        <label>
          网站
          <input name="website" autoComplete="off" tabIndex={-1} />
        </label>
      </div>
      <label className="inquiry-form__consent">
        <Checkbox checked={consent} onCheckedChange={(checked) => setConsent(checked === true)} />
        <span>我同意灵可智能仅将以上信息用于本次咨询沟通和后续联系。</span>
      </label>
      <Button
        disabled={!consent}
        loading={state === 'submitting'}
        size="lg"
        trailingIcon={<Send size={16} />}
        type="submit"
      >
        提交咨询
      </Button>
      {state === 'success' ? <Alert tone="success">信息已收到，我们会尽快与您联系。</Alert> : null}
      {state === 'error' ? <Alert tone="danger">{error}</Alert> : null}
    </form>
  );
}

const solutions = [
  {
    icon: GraduationCap,
    label: 'Education',
    title: '教育运营系统',
    copy: '围绕招生、学员、排课、签到和消课建立连续的机构运营流程。',
  },
  {
    icon: Store,
    label: 'Retail',
    title: '零售经营系统',
    copy: '连接商品、库存、订单、会员和门店，保留数据与部署的自主权。',
  },
  {
    icon: Building2,
    label: 'Operations',
    title: '组织业务系统',
    copy: '根据真实工作流构建轻量业务平台，不让团队被通用软件的边界反向塑造。',
  },
];

function OfficialFooter({ presentation }: { presentation: PublicPresentation }) {
  return (
    <footer className="official-footer">
      <Container>
        <div className="official-footer__main">
          <div className="official-footer__brand">
            <SiteBrand presentation={presentation} />
            <p>专注于企业数字系统、行业应用与软件产品的设计、开发和持续交付。</p>
          </div>
          <nav aria-label="页脚导航" className="official-footer__navigation">
            {officialFooterNavigation.map((item) => (
              <a href={item.href} key={item.href}>
                {item.label}
              </a>
            ))}
          </nav>
          <div className="official-footer__contact">
            <span>联系我们</span>
            <a href="mailto:hello@lingcoo.com">
              <Mail aria-hidden size={16} />
              hello@lingcoo.com
            </a>
          </div>
        </div>
        <div className="official-footer__legal">
          <span>© 2026 {OFFICIAL_SITE_NAME}</span>
          <span>{OFFICIAL_SITE_LEGAL_ENTITY}</span>
          <a href={OFFICIAL_SITE_ICP_URL} rel="noreferrer" target="_blank">
            {OFFICIAL_SITE_ICP_NUMBER}
          </a>
          <a href={OFFICIAL_SITE_PUBLIC_SECURITY_URL} rel="noreferrer" target="_blank">
            {OFFICIAL_SITE_PUBLIC_SECURITY_NUMBER}
          </a>
        </div>
      </Container>
    </footer>
  );
}

function OfficialSiteShell({
  children,
  presentation,
}: {
  children: ReactNode;
  presentation: PublicPresentation;
}) {
  return (
    <div className="public-site-shell public-site-shell--dark">
      <a className="site-skip-link" href="#main-content">
        跳至主要内容
      </a>
      <SiteHeader
        adminHref={null}
        navigation={officialHeaderNavigation}
        overlay
        presentation={presentation}
        tone="dark"
      />
      <main id="main-content">{children}</main>
      <OfficialFooter presentation={presentation} />
    </div>
  );
}

function HomePage({ context }: WebRouteContext<OfficialWebContext>) {
  const presentation = resolveOfficialPresentation(context.presentation);
  return (
    <OfficialSiteShell presentation={presentation}>
      <SeoHead
        canonicalPath="/"
        description="灵可智能专注于企业数字系统、行业应用与软件产品的设计、开发和持续交付。"
        presentation={presentation}
        title="灵可智能 · 让复杂系统，清晰生长"
      />
      <Hero
        eyebrow={`${OFFICIAL_SITE_NAME} · ${OFFICIAL_SITE_ENGLISH_NAME}`}
        title={
          <>
            让复杂系统，
            <br />
            清晰生长。
          </>
        }
        description="从稳定的软件地基出发，为教育、零售与组织运营构建可拥有、可演进的数字系统。"
        actions={
          <>
            <Button asChild size="lg" trailingIcon={<ArrowRight size={16} />}>
              <a href="#contact">沟通项目</a>
            </Button>
            <Button asChild size="lg" variant="secondary">
              <a className="official-hero-secondary" href="#services">
                了解我们的服务
              </a>
            </Button>
          </>
        }
        aside={
          <div className="official-product-panel">
            <span>Product engineering</span>
            <strong>从需求到可持续运行</strong>
            <ul>
              <li>
                <CheckCircle2 size={16} />
                独立部署
              </li>
              <li>
                <CheckCircle2 size={16} />
                数据自主
              </li>
              <li>
                <CheckCircle2 size={16} />
                持续升级
              </li>
            </ul>
          </div>
        }
      />
      <Section id="services" tone="raised">
        <div className="official-section-heading">
          <span>Solutions</span>
          <h2>围绕真实工作流交付系统</h2>
          <p>不把业务塞进通用模板，而是在可靠技术地基上建立清晰的领域模型。</p>
        </div>
        <div className="official-solution-grid">
          {solutions.map(({ icon: Icon, label, title, copy }) => (
            <article key={label}>
              <Icon size={24} />
              <span>{label}</span>
              <h3>{title}</h3>
              <p>{copy}</p>
            </article>
          ))}
        </div>
      </Section>
      <Section id="about" tone="base">
        <div className="official-approach">
          <div>
            <span>About us</span>
            <h2>从可靠地基出发，长期建设数字产品</h2>
            <p>
              灵可智能位于山东青岛，专注于企业数字系统、行业应用与软件产品的设计、开发和持续交付。
              我们以稳定的技术底座承载不同业务，让产品能够独立部署、持续升级并长期演进。
            </p>
          </div>
          <Workflow size={72} />
        </div>
      </Section>
      <Section id="contact" tone="dark">
        <div className="official-contact-grid">
          <div>
            <span>Start a conversation</span>
            <h2>说说你正在解决的问题</h2>
            <p>
              介绍业务场景、使用对象和期望上线时间，我们会从边界、风险与最小可交付范围开始讨论。
            </p>
            <a className="official-contact-email" href="mailto:hello@lingcoo.com">
              <Mail aria-hidden size={17} />
              hello@lingcoo.com
            </a>
          </div>
          <InquiryForm />
        </div>
      </Section>
    </OfficialSiteShell>
  );
}

export const officialSiteWebExtension = defineWebExtension<OfficialWebContext>({
  routes: [{ id: 'official.home', component: HomePage }],
  seo: [
    {
      id: 'official.home',
      resolve: () => ({
        title: '灵可智能 · 让复杂系统，清晰生长',
        description: '灵可智能专注于企业数字系统、行业应用与软件产品的设计、开发和持续交付。',
        canonicalPath: '/',
      }),
    },
  ],
  sitemap: [
    {
      id: 'official.home',
      collect: () => [{ path: '/', changeFrequency: 'weekly', priority: 1 }],
    },
  ],
});
