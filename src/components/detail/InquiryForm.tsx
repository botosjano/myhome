'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Check, Send } from 'lucide-react';
import { createInquiry } from '@/lib/admin/store';

type Status = 'idle' | 'sending' | 'success' | 'error';

export default function InquiryForm({
  propertyId,
  reference,
}: {
  propertyId: string;
  reference: string;
}) {
  const t = useTranslations('detail');
  const [status, setStatus] = useState<Status>('idle');

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus('sending');
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries());

    try {
      const res = await fetch('/api/inquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, propertyId, reference }),
      });
      if (!res.ok) throw new Error('Request failed');
      // Mirror the inquiry into the admin store (mock; replace with DB later).
      await createInquiry({
        name: String(data.name ?? ''),
        email: String(data.email ?? ''),
        phone: String(data.phone ?? ''),
        message: String(data.message ?? ''),
        property_id: propertyId,
        property_ref: reference,
      });
      setStatus('success');
      form.reset();
    } catch {
      setStatus('error');
    }
  };

  const field =
    'w-full rounded-sm border border-navy/15 bg-white px-3 py-2.5 font-sans text-sm text-navy ' +
    'focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold';

  if (status === 'success') {
    return (
      <div className="rounded-sm border border-gold/40 bg-gold/10 p-6 text-center">
        <Check className="mx-auto mb-3 h-8 w-8 text-gold" />
        <p className="font-sans text-sm text-navy">{t('inquirySuccess')}</p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <h3 className="font-serif text-lg text-navy">{t('inquiryTitle')}</h3>
      <input name="name" required placeholder={t('inquiryName')} className={field} />
      <input name="phone" type="tel" required placeholder={t('inquiryPhone')} className={field} />
      <input name="email" type="email" required placeholder={t('inquiryEmail')} className={field} />
      <textarea
        name="message"
        rows={3}
        placeholder={t('inquiryMessagePlaceholder')}
        className={field}
      />
      {status === 'error' && (
        <p className="font-sans text-xs text-red-600">{t('inquiryError')}</p>
      )}
      <button type="submit" disabled={status === 'sending'} className="btn-gold w-full disabled:opacity-60">
        <Send className="h-4 w-4" />
        {status === 'sending' ? t('inquirySending') : t('inquirySubmit')}
      </button>
      <p className="font-sans text-[11px] leading-snug text-navy/45">{t('inquiryPrivacy')}</p>
    </form>
  );
}
