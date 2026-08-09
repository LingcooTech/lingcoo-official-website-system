import { type WebRouteContext, defineWebExtension } from '@lingcootech/frame-web';
import { Hero, Section } from '@lingcootech/frame-web/layout';
import type { PublicPresentation } from '@lingcootech/frame-web/presentation';
import { SeoHead } from '@lingcootech/frame-web/seo';
import { SiteShell } from '@lingcootech/frame-web/site';
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
  Send,
  Store,
  Workflow,
} from 'lucide-react';
import { useState, type FormEvent } from 'react';

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
        <span>我同意 LingcooTech 仅将以上信息用于本次咨询沟通和后续联系。</span>
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

function HomePage({ context }: WebRouteContext<OfficialWebContext>) {
  return (
    <SiteShell presentation={context.presentation} headerOverlay headerTone="dark">
      <SeoHead
        canonicalPath="/"
        description="面向教育、零售与组织运营场景的数字系统设计与交付。"
        presentation={context.presentation}
        title="让复杂系统，清晰生长"
      />
      <Hero
        eyebrow="LingcooTech · Product Engineering"
        title={
          <>
            让复杂系统，
            <br />
            清晰生长。
          </>
        }
        description="从稳定的 Frame 地基出发，为教育、零售与组织运营构建可拥有、可演进的数字系统。"
        actions={
          <>
            <Button asChild size="lg" trailingIcon={<ArrowRight size={16} />}>
              <a href="#contact">沟通项目</a>
            </Button>
            <Button asChild size="lg" variant="secondary">
              <a href="#solutions">查看解决方案</a>
            </Button>
          </>
        }
        aside={
          <div className="official-product-panel">
            <span>delivery.model</span>
            <strong>Frame + Domain Extension</strong>
            <ul>
              <li>
                <CheckCircle2 size={16} />
                独立仓库与部署
              </li>
              <li>
                <CheckCircle2 size={16} />
                版本化基础能力
              </li>
              <li>
                <CheckCircle2 size={16} />
                业务代码保持纯净
              </li>
            </ul>
          </div>
        }
      />
      <Section id="solutions" tone="raised">
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
      <Section id="approach" tone="base">
        <div className="official-approach">
          <div>
            <span>Approach</span>
            <h2>地基统一，业务独立</h2>
            <p>
              Frame 提供身份、权限、设置、审计、资产、通知、CMS
              与运行保障；每个应用只维护自己的领域扩展和交付节奏。
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
          </div>
          <InquiryForm />
        </div>
      </Section>
    </SiteShell>
  );
}

export const officialSiteWebExtension = defineWebExtension<OfficialWebContext>({
  routes: [{ id: 'official.home', component: HomePage }],
  seo: [
    {
      id: 'official.home',
      resolve: () => ({
        title: 'LingcooTech · 让复杂系统，清晰生长',
        description: '面向教育、零售与组织运营场景的数字系统设计与交付。',
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
