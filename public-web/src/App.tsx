import {
  ArrowRight,
  Building2,
  CheckCircle2,
  GraduationCap,
  KeyRound,
  Mail,
  Store,
  Workflow,
} from 'lucide-react';
import { Button } from '@lingcoo/frame-ui/button';
import { Alert } from '@lingcoo/frame-ui/alert';
import { FormField } from '@lingcoo/frame-ui/form-field';
import { Input } from '@lingcoo/frame-ui/input';
import { useEffect, useState, type FormEvent } from 'react';

import { ArticleIndexPage, CmsContentPage } from './components/cms/CmsPages';
import { InquiryForm } from './components/InquiryForm';
import { Hero, Section } from './components/site/Layout';
import { SeoHead } from './components/site/SeoHead';
import { SiteShell, type PublicPresentation } from './components/site/SiteShell';
import { SystemPage } from './components/site/SystemStates';

async function authRequest(path: string, body: Record<string, unknown>) {
  const response = await fetch(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as { message?: string } | null;
    throw new Error(payload?.message ?? '安全操作失败，请稍后重试');
  }
}

function PublicAuthFlow({
  mode,
  presentation,
}: {
  mode: 'forgot' | 'reset' | 'invitation' | 'verify';
  presentation: PublicPresentation | null;
}) {
  const token = new URLSearchParams(window.location.search).get('token') ?? '';
  const invalidVerification = mode === 'verify' && !token;
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [busy, setBusy] = useState(mode === 'verify' && Boolean(token));
  const [message, setMessage] = useState(invalidVerification ? '验证链接缺少安全凭证。' : '');
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    if (mode !== 'verify' || !token) return;
    authRequest('/api/auth/email/verify', { token })
      .then(() => {
        setCompleted(true);
        setMessage('邮箱验证已完成。');
      })
      .catch((error) => setMessage(error instanceof Error ? error.message : '邮箱验证失败'))
      .finally(() => setBusy(false));
  }, [mode, token]);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setMessage('');
    try {
      if (mode === 'forgot') {
        await authRequest('/api/auth/password-reset/request', { email });
        setMessage('如果该邮箱对应可用账号，重置邮件将很快送达。');
      } else {
        await authRequest(
          mode === 'invitation'
            ? '/api/auth/invitations/accept'
            : '/api/auth/password-reset/complete',
          { token, newPassword, confirmPassword },
        );
        setCompleted(true);
        setMessage(mode === 'invitation' ? '账号已启用，可以登录管理后台。' : '密码已重置。');
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : '安全操作失败');
    } finally {
      setBusy(false);
    }
  }

  const title =
    mode === 'forgot'
      ? '找回账号密码'
      : mode === 'invitation'
        ? '接受账号邀请'
        : mode === 'verify'
          ? '验证账号邮箱'
          : '设置新的密码';
  const authLogoId = presentation?.squareLogoAssetId ?? presentation?.fullLogoAssetId;
  const authLogoUrl = authLogoId ? presentation?.assets[authLogoId]?.publicUrl : null;
  return (
    <main className="public-auth-screen">
      <SeoHead noIndex presentation={presentation} title={title} />
      <section className="public-auth-card">
        <a className="public-auth-brand" href="/">
          <span>{authLogoUrl ? <img alt="" src={authLogoUrl} /> : 'F'}</span>
          {presentation?.displayName ?? 'Lingcoo'}
        </a>
        <div className="public-auth-icon">
          {mode === 'forgot' ? <Mail size={20} /> : <KeyRound size={20} />}
        </div>
        <p className="cms-public-type">Account security</p>
        <h1>{title}</h1>
        <p className="public-auth-copy">
          {mode === 'forgot'
            ? '输入账号邮箱。为保护账号隐私，无论邮箱是否存在都会返回相同结果。'
            : mode === 'verify'
              ? '正在校验一次性邮箱验证链接。'
              : '安全链接只能使用一次；新密码至少需要 12 个字符。'}
        </p>
        {mode !== 'verify' && !completed ? (
          <form onSubmit={submit}>
            {mode === 'forgot' ? (
              <FormField label="账号邮箱" required>
                {({ controlId }) => (
                  <Input
                    autoComplete="email"
                    id={controlId}
                    onChange={(event) => setEmail(event.target.value)}
                    prefix={<Mail size={15} />}
                    required
                    type="email"
                    value={email}
                  />
                )}
              </FormField>
            ) : (
              <>
                <FormField label="新密码" required>
                  {({ controlId }) => (
                    <Input
                      autoComplete="new-password"
                      id={controlId}
                      minLength={12}
                      onChange={(event) => setNewPassword(event.target.value)}
                      required
                      type="password"
                      value={newPassword}
                    />
                  )}
                </FormField>
                <FormField label="确认新密码" required>
                  {({ controlId }) => (
                    <Input
                      autoComplete="new-password"
                      id={controlId}
                      minLength={12}
                      onChange={(event) => setConfirmPassword(event.target.value)}
                      required
                      type="password"
                      value={confirmPassword}
                    />
                  )}
                </FormField>
              </>
            )}
            <Button block loading={busy} size="lg" type="submit">
              {mode === 'forgot' ? '发送重置邮件' : '确认并继续'}
            </Button>
          </form>
        ) : null}
        {message ? (
          <Alert tone={completed || mode === 'forgot' ? 'success' : 'danger'}>{message}</Alert>
        ) : null}
        <a className="public-auth-login" href="/admin/">
          返回管理后台登录
        </a>
      </section>
    </main>
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

function App() {
  const [presentation, setPresentation] = useState<PublicPresentation | null>(null);

  useEffect(() => {
    fetch('/api/public/presentation')
      .then((response) => (response.ok ? response.json() : Promise.reject(new Error('failed'))))
      .then(({ presentation: result }: { presentation: PublicPresentation }) => {
        setPresentation(result);
        document.documentElement.style.setProperty('--site-primary', result.primaryColor);
        document.documentElement.style.setProperty('--site-secondary', result.secondaryColor);
        document.documentElement.style.setProperty('--site-accent', result.accentColor);
        const faviconUrl = result.faviconAssetId
          ? result.assets[result.faviconAssetId]?.publicUrl
          : null;
        if (faviconUrl) {
          let favicon = document.querySelector<HTMLLinkElement>('link[rel="icon"]');
          if (!favicon) {
            favicon = document.createElement('link');
            favicon.rel = 'icon';
            document.head.append(favicon);
          }
          favicon.href = faviconUrl;
        }
      })
      .catch(() => undefined);
  }, []);

  const pathParts = window.location.pathname.split('/').filter(Boolean);
  if (pathParts[0] === 'auth') {
    const mode =
      pathParts[1] === 'forgot-password'
        ? 'forgot'
        : pathParts[1] === 'reset-password'
          ? 'reset'
          : pathParts[1] === 'accept-invitation'
            ? 'invitation'
            : pathParts[1] === 'verify-email'
              ? 'verify'
              : null;
    if (mode) return <PublicAuthFlow mode={mode} presentation={presentation} />;
  }
  if (
    pathParts[0] === 'preview' &&
    pathParts[1] === 'content' &&
    pathParts[2] &&
    pathParts.length === 3
  ) {
    return (
      <CmsContentPage
        endpoint={'/api/cms/entries/' + pathParts[2] + '/preview'}
        presentation={presentation}
        preview
      />
    );
  }
  if (pathParts[0] === 'articles' && !pathParts[1]) {
    const requestedPage = Number(new URLSearchParams(window.location.search).get('page') || '1');
    const page = Number.isInteger(requestedPage) && requestedPage > 0 ? requestedPage : 1;
    return <ArticleIndexPage page={page} presentation={presentation} />;
  }
  if (
    (pathParts[0] === 'articles' || pathParts[0] === 'pages') &&
    pathParts[1] &&
    pathParts.length === 2
  ) {
    return (
      <CmsContentPage
        endpoint={'/api/public/cms/' + pathParts[0] + '/' + encodeURIComponent(pathParts[1])}
        presentation={presentation}
      />
    );
  }

  if (pathParts.length) return <SystemPage kind="404" presentation={presentation} />;

  return (
    <SiteShell headerOverlay headerTone="dark" presentation={presentation}>
      <SeoHead canonicalPath="/" presentation={presentation} />
      <Hero
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
          <div
            className="architecture-card official-product-panel"
            aria-label="Lingcoo 系统交付方式"
          >
            <div className="card-header">
              <span>delivery.model</span>
              <span className="live-indicator">self-hosted</span>
            </div>
            <div className="layer-stack">
              <div>
                <span>01</span>
                <strong>理解业务</strong>
                <small>角色 · 流程 · 数据</small>
              </div>
              <div>
                <span>02</span>
                <strong>组合能力</strong>
                <small>成熟底座 · 领域模块</small>
              </div>
              <div>
                <span>03</span>
                <strong>快速交付</strong>
                <small>单体部署 · 完整闭环</small>
              </div>
              <div>
                <span>04</span>
                <strong>持续演进</strong>
                <small>自有数据 · 可维护代码</small>
              </div>
            </div>
          </div>
        }
        description={
          <p>
            面向教育、零售和组织运营场景，设计轻量、自有、可快速部署的业务系统。
            从核心流程开始，逐步长成真正适合团队的数字基础设施。
          </p>
        }
        eyebrow="Lightweight industry systems"
        title={
          <>
            让复杂业务
            <em>成为清晰、可用的系统</em>
          </>
        }
      />

      <Section className="principles-section" spacing="sm">
        <div className="principles">
          <div>
            <CheckCircle2 size={20} />
            <span>围绕真实流程</span>
          </div>
          <div>
            <CheckCircle2 size={20} />
            <span>数据与部署自有</span>
          </div>
          <div>
            <CheckCircle2 size={20} />
            <span>轻量但具备完整边界</span>
          </div>
        </div>
      </Section>

      <Section className="architecture-section" id="solutions">
        <div className="section-heading">
          <p>Industry solutions</p>
          <h2>从行业共性出发，为具体业务落地</h2>
          <span>
            不堆叠脱离场景的功能。每套系统都从用户、流程和关键数据开始，并在可靠底座上快速交付。
          </span>
        </div>
        <div className="layer-cards">
          {solutions.map(({ icon: Icon, label, title, copy }, index) => (
            <article key={title}>
              <div className="card-number">0{index + 1}</div>
              <Icon size={21} />
              <small>{label}</small>
              <h3>{title}</h3>
              <p>{copy}</p>
            </article>
          ))}
        </div>
      </Section>

      <Section className="official-approach" id="approach" tone="raised">
        <div className="section-heading">
          <p>How we work</p>
          <h2>一条从业务判断到稳定运行的短路径</h2>
          <span>先交付最关键的业务闭环，再用清晰模块持续扩展，控制早期投入和长期维护成本。</span>
        </div>
        <div className="official-approach__steps">
          {[
            ['01', '业务梳理', '确认使用者、关键流程、数据边界和第一阶段非目标。'],
            ['02', '系统设计', '复用成熟基础能力，只为具体场景增加必要的领域模块。'],
            ['03', '部署交付', '以单体架构和容器化运行降低自部署、升级与排障成本。'],
            ['04', '持续迭代', '通过审计、监控、备份和版本化能力支撑长期使用。'],
          ].map(([number, title, copy]) => (
            <article key={number}>
              <span>{number}</span>
              <Workflow size={20} />
              <h3>{title}</h3>
              <p>{copy}</p>
            </article>
          ))}
        </div>
      </Section>

      <Section className="official-contact" id="contact">
        <div className="official-contact__layout">
          <div className="official-contact__intro">
            <p>Start a conversation</p>
            <h2>从一个需要真正解决的问题开始</h2>
            <span>
              告诉我们当前业务、使用对象和期望目标。我们会先判断是否适合轻量自部署方案，再讨论实现范围。
            </span>
            <a href="mailto:hello@lingcoo.com">hello@lingcoo.com</a>
          </div>
          <InquiryForm />
        </div>
      </Section>
    </SiteShell>
  );
}

export default App;
