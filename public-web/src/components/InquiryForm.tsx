import { Alert } from '@lingcoo/frame-ui/alert';
import { Button } from '@lingcoo/frame-ui/button';
import { Checkbox } from '@lingcoo/frame-ui/checkbox';
import { FormField } from '@lingcoo/frame-ui/form-field';
import { Input } from '@lingcoo/frame-ui/input';
import { Textarea } from '@lingcoo/frame-ui/textarea';
import { Send } from 'lucide-react';
import { useState, type FormEvent } from 'react';

type SubmitState = 'idle' | 'submitting' | 'success' | 'error';

export function InquiryForm() {
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
          {({ controlId }) => <Input autoComplete="name" id={controlId} name="name" required />}
        </FormField>
        <FormField label="公司或机构">
          {({ controlId }) => (
            <Input autoComplete="organization" id={controlId} name="organization" />
          )}
        </FormField>
        <FormField description="邮箱或电话至少填写一项" label="工作邮箱">
          {({ controlId }) => (
            <Input autoComplete="email" id={controlId} name="email" type="email" />
          )}
        </FormField>
        <FormField label="联系电话">
          {({ controlId }) => <Input autoComplete="tel" id={controlId} name="phone" />}
        </FormField>
      </div>
      <FormField label="希望解决的问题">
        {({ controlId }) => <Input id={controlId} name="subject" />}
      </FormField>
      <FormField label="项目情况" required>
        {({ controlId }) => (
          <Textarea
            id={controlId}
            minLength={10}
            name="message"
            placeholder="请简单描述当前业务、使用对象、主要问题和期望上线时间。"
            required
            rows={6}
          />
        )}
      </FormField>
      <div aria-hidden className="inquiry-form__honeypot">
        <label>
          网站
          <input autoComplete="off" name="website" tabIndex={-1} />
        </label>
      </div>
      <label className="inquiry-form__consent">
        <Checkbox checked={consent} onCheckedChange={(checked) => setConsent(checked === true)} />
        <span>我同意 Lingcoo 仅将以上信息用于本次咨询沟通和后续联系。</span>
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
