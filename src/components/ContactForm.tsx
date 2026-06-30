'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Check, Send } from 'lucide-react';
import { LEAD_SOURCES, submitLead, type PipelineType } from '@/lib/lead';
import { validationHandlers } from '@/lib/form-validation';
import { sourceLabel } from '@/components/detail/InquiryForm';

type Status = 'idle' | 'sending' | 'success' | 'error';

const INTENTS: { value: PipelineType; key: string }[] = [
  { value: 'vevo', key: 'intentVevo' },
  { value: 'berlo', key: 'intentBerlo' },
  { value: 'elado', key: 'intentElado' },
  { value: 'berbeado', key: 'intentBerbeado' },
];

/** General (non-property) contact form for the /kapcsolat page. */
export default function ContactForm() {
  const t = useTranslations('detail');
  const tc = useTranslations('contact');
  const tl = useTranslations('lead');
  const tv = useTranslations('validation');
  const vh = validationHandlers(tv);
  const [status, setStatus] = useState<Status>('idle');

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus('sending');
    const formEl = e.currentTarget;
    const data = Object.fromEntries(new FormData(formEl).entries()) as Record<string, string>;

    try {
      await submitLead({
        formType: 'contact',
        pipelineType: data.pipelineType as PipelineType,
        name: data.name,
        email: data.email,
        phone: data.phone,
        message: data.message ?? '',
        source: data.source || undefined,
      });
      setStatus('success');
      formEl.reset();
    } catch {
      setStatus('error');
    }
  };

  const field =
    'w-full rounded-sm border border-navy/15 bg-white px-3.5 py-3 font-sans text-sm text-navy ' +
    'focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold';

  if (status === 'success') {
    return (
      <div className="rounded-sm border border-gold/40 bg-gold/10 p-8 text-center">
        <Check className="mx-auto mb-3 h-9 w-9 text-gold" />
        <p className="font-sans text-sm text-navy">{t('inquirySuccess')}</p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <input name="name" required {...vh} placeholder={`${t('inquiryName')} *`} className={field} />
        <input name="phone" type="tel" required {...vh} placeholder={`${t('inquiryPhone')} *`} className={field} />
      </div>
      <input name="email" type="email" required {...vh} placeholder={`${t('inquiryEmail')} *`} className={field} />
      <div className="grid gap-3 sm:grid-cols-2">
        <select name="pipelineType" required {...vh} defaultValue="" className={field} aria-label={tl('intentLabel')}>
          <option value="" disabled>
            {`${tl('intentLabel')} *`}
          </option>
          {INTENTS.map(({ value, key }) => (
            <option key={value} value={value}>
              {tl(key)}
            </option>
          ))}
        </select>
        <select name="source" required {...vh} defaultValue="" className={field} aria-label={tl('sourceLabel')}>
          <option value="" disabled>
            {`${tl('sourceLabel')} *`}
          </option>
          {LEAD_SOURCES.map((value) => (
            <option key={value} value={value}>
              {sourceLabel(tl, value)}
            </option>
          ))}
        </select>
      </div>
      <textarea
        name="message"
        rows={5}
        required
        {...vh}
        placeholder={`${tc('messagePlaceholder')} *`}
        className={field}
      />
      {status === 'error' && <p className="font-sans text-xs text-red-600">{t('inquiryError')}</p>}
      <button type="submit" disabled={status === 'sending'} className="btn-gold w-full disabled:opacity-60">
        <Send className="h-4 w-4" />
        {status === 'sending' ? t('inquirySending') : t('inquirySubmit')}
      </button>
      <p className="font-sans text-[11px] leading-snug text-navy/45">{t('inquiryPrivacy')}</p>
    </form>
  );
}
