'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Check, Send } from 'lucide-react';
import type { ListingType } from '@/lib/types';
import { LEAD_SOURCES, submitLead, type PipelineType } from '@/lib/lead';
import { validationHandlers } from '@/lib/form-validation';

type Status = 'idle' | 'sending' | 'success' | 'error';

export default function InquiryForm({
  reference,
  listingType,
  propertyName,
}: {
  /** Property reference number, e.g. MH-1042 — sent as propertyId to GHL. */
  reference: string;
  /** Sale → buyer (vevo) pipeline; rent → tenant (berlo) pipeline. */
  listingType: ListingType;
  /** Localised property title, for the opportunity. */
  propertyName: string;
}) {
  const t = useTranslations('detail');
  const tl = useTranslations('lead');
  const tv = useTranslations('validation');
  const vh = validationHandlers(tv);
  const [status, setStatus] = useState<Status>('idle');

  const pipelineType: PipelineType = listingType === 'kiado' ? 'berlo' : 'vevo';

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus('sending');
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries()) as Record<string, string>;

    try {
      await submitLead({
        formType: 'property_inquiry',
        pipelineType,
        name: data.name,
        email: data.email,
        phone: data.phone,
        message: data.message ?? '',
        source: data.source || undefined,
        propertyId: reference,
        propertyName,
        propertyUrl: typeof window !== 'undefined' ? window.location.href : undefined,
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
      <input name="name" required {...vh} placeholder={`${t('inquiryName')} *`} className={field} />
      <input name="phone" type="tel" required {...vh} placeholder={`${t('inquiryPhone')} *`} className={field} />
      <input name="email" type="email" required {...vh} placeholder={`${t('inquiryEmail')} *`} className={field} />
      <textarea
        name="message"
        rows={3}
        placeholder={t('inquiryMessagePlaceholder')}
        className={field}
      />
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

/** Map a canonical source value to its localised label. */
export function sourceLabel(tl: (k: string) => string, value: string): string {
  switch (value) {
    case 'Google':
      return tl('sourceGoogle');
    case 'Facebook':
      return tl('sourceFacebook');
    case 'Instagram':
      return tl('sourceInstagram');
    case 'Ajánlás':
      return tl('sourceReferral');
    default:
      return tl('sourceOther');
  }
}
