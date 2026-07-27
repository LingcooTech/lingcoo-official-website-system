import { Mail, MapPin, Phone } from 'lucide-react';
import { useState, type FormEvent } from 'react';

import Container from '@/components/Container';
import Seo from '@/components/Seo';
import { site } from '@/content/site';

type Status = 'idle' | 'submitting' | 'ok' | 'error';

export default function Contact() {
  const [status, setStatus] = useState<Status>('idle');

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus('submitting');
    const form = event.currentTarget;
    const payload = Object.fromEntries(new FormData(form).entries());
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('request failed');
      setStatus('ok');
      form.reset();
    } catch {
      // v1 尚未接入后端 /api/contact，降级为引导邮件联系。
      setStatus('error');
    }
  }

  const fieldClass =
    'w-full rounded-lg border border-line bg-surface px-4 py-3 text-sm outline-none transition-colors focus:border-ink';

  return (
    <>
      <Seo title="联系我们" />
      <section className="border-b border-line">
        <Container className="py-20 md:py-28">
          <h1 className="text-3xl font-semibold tracking-tight md:text-5xl">联系我们</h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-ink-soft">
            无论是合作洽谈还是产品咨询，欢迎与我们联系。
          </p>
        </Container>
      </section>
      <section>
        <Container className="grid gap-12 py-16 md:grid-cols-2 md:py-24">
          <div className="space-y-6">
            <a
              href={`mailto:${site.contact.email}`}
              className="flex items-center gap-4 transition-opacity hover:opacity-70"
            >
              <Mail className="h-5 w-5 text-muted" strokeWidth={1.5} />
              {site.contact.email}
            </a>
            <div className="flex items-center gap-4">
              <Phone className="h-5 w-5 text-muted" strokeWidth={1.5} />
              {site.contact.phone}
            </div>
            <div className="flex items-center gap-4">
              <MapPin className="h-5 w-5 text-muted" strokeWidth={1.5} />
              {site.contact.address}
            </div>
          </div>

          <form onSubmit={onSubmit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <input name="name" required placeholder="您的称呼" className={fieldClass} />
              <input name="phone" placeholder="联系电话" className={fieldClass} />
            </div>
            <input name="email" type="email" placeholder="邮箱" className={fieldClass} />
            <textarea name="message" required rows={4} placeholder="想聊些什么？" className={fieldClass} />
            <button
              type="submit"
              disabled={status === 'submitting'}
              className="inline-flex items-center rounded-full bg-accent px-6 py-3 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {status === 'submitting' ? '提交中…' : '发送'}
            </button>
            {status === 'ok' && (
              <p className="text-sm text-ink-soft">已收到，我们会尽快联系你。</p>
            )}
            {status === 'error' && (
              <p className="text-sm text-muted">
                提交通道尚未开通，请直接邮件联系 {site.contact.email}。
              </p>
            )}
          </form>
        </Container>
      </section>
    </>
  );
}
