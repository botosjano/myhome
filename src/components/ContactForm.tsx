'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Check, Send } from 'lucide-react';
import { createInquiry } from '@/lib/admin/store';

type Status = 'idle' | 'sending' | 'success' | 'error';

/** General (non-property) contact form for the /kapcsolat page. */
export default function ContactForm() {
  const t = useTranslations('detail');
  const tc = useTranslations('contact');
  const [status, setStatus] = useState<Status>('idle');

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus('sending');
    const formEl = e.currentTarget;
    const data = Object.fromEntries(new FormData(formEl).entries());

    try {
      const res = await fetch('/api/inquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, propertyId: '', reference: '' }),
      });
      if (!res.ok) throw new Error('Request failed');
      await createInquiry({
        name: String(data.name ?? ''),
        email: String(data.email ?? ''),
        phone: String(data.phone ?? ''),
        message: String(data.message ?? ''),
        property_id: null,
        property_ref: null,
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
        <input name="name" required placeholder={t('inquiryName')} className={field} />
        <input name="phone" type="tel" required placeholder={t('inquiryPhone')} className={field} />
      </div>
      <input name="email" type="email" required placeholder={t('inquiryEmail')} className={field} />
      <textarea
        name="message"
        rows={5}
        required
        placeholder={tc('messagePlaceholder')}
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
