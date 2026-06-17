'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Search } from 'lucide-react';
import { useRouter } from '@/navigation';
import { DISTRICTS, PROPERTY_TYPES, ROOM_OPTIONS } from '@/lib/districts';
import type { Currency } from '@/lib/types';
import { cn } from '@/lib/utils';

export default function SearchBox() {
  const t = useTranslations('search');
  const tTypes = useTranslations('types');
  const router = useRouter();

  const [currency, setCurrency] = useState<Currency>('HUF');
  const [values, setValues] = useState<Record<string, string>>({});

  const set = (k: string, v: string) => setValues((p) => ({ ...p, [k]: v }));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    Object.entries(values).forEach(([k, v]) => {
      if (v) params.set(k, v);
    });
    params.set('currency', currency);
    router.push(`/ingatlanok?${params.toString()}`);
  };

  const field =
    'w-full rounded-sm border border-navy/15 bg-white px-3 py-2.5 font-sans text-sm text-navy ' +
    'focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold';
  const label = 'mb-1.5 block font-sans text-xs font-medium uppercase tracking-wide text-navy/60';

  return (
    <form
      onSubmit={submit}
      className="w-full max-w-5xl rounded-sm bg-white/95 p-6 shadow-luxe backdrop-blur-sm md:p-8"
    >
      <div className="mb-5 flex items-center justify-between">
        <h2 className="font-serif text-xl text-navy">{t('title')}</h2>
        {/* Currency toggle */}
        <div className="flex overflow-hidden rounded-sm border border-navy/15">
          {(['HUF', 'EUR'] as const).map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setCurrency(c)}
              className={cn(
                'px-3 py-1 font-sans text-xs font-medium uppercase tracking-wide transition-colors',
                currency === c ? 'bg-gold text-navy' : 'bg-white text-navy/50 hover:text-navy',
              )}
            >
              {c === 'HUF' ? 'MFt' : 'EUR'}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <label className={label}>{t('type')}</label>
          <select className={field} value={values.type ?? ''} onChange={(e) => set('type', e.target.value)}>
            <option value="">{t('typeAny')}</option>
            {PROPERTY_TYPES.map((pt) => (
              <option key={pt} value={pt}>
                {tTypes(pt)}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className={label}>{t('district')}</label>
          <select
            className={field}
            value={values.district ?? ''}
            onChange={(e) => set('district', e.target.value)}
          >
            <option value="">{t('districtAny')}</option>
            {DISTRICTS.map((d) => (
              <option key={d.label} value={d.label}>
                {d.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className={label}>
            {t('minPrice')} ({currency === 'HUF' ? 'MFt' : 'EUR'})
          </label>
          <input
            type="number"
            min={0}
            className={field}
            value={values.minPrice ?? ''}
            onChange={(e) => set('minPrice', e.target.value)}
          />
        </div>

        <div>
          <label className={label}>
            {t('maxPrice')} ({currency === 'HUF' ? 'MFt' : 'EUR'})
          </label>
          <input
            type="number"
            min={0}
            className={field}
            value={values.maxPrice ?? ''}
            onChange={(e) => set('maxPrice', e.target.value)}
          />
        </div>

        <div>
          <label className={label}>{t('minSize')}</label>
          <input
            type="number"
            min={0}
            className={field}
            value={values.minSize ?? ''}
            onChange={(e) => set('minSize', e.target.value)}
          />
        </div>

        <div>
          <label className={label}>{t('maxSize')}</label>
          <input
            type="number"
            min={0}
            className={field}
            value={values.maxSize ?? ''}
            onChange={(e) => set('maxSize', e.target.value)}
          />
        </div>

        <div>
          <label className={label}>{t('rooms')}</label>
          <select className={field} value={values.rooms ?? ''} onChange={(e) => set('rooms', e.target.value)}>
            <option value="">{t('roomsAny')}</option>
            {ROOM_OPTIONS.map((r) => (
              <option key={r} value={r}>
                {r === 5 ? t('roomsPlus', { count: 5 }) : r}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className={label}>{t('reference')}</label>
          <input
            type="text"
            placeholder={t('referencePlaceholder')}
            className={field}
            value={values.reference ?? ''}
            onChange={(e) => set('reference', e.target.value)}
          />
        </div>
      </div>

      <div className="mt-6 flex justify-center">
        <button type="submit" className="btn-gold w-full sm:w-auto">
          <Search className="h-4 w-4" />
          {t('submit')}
        </button>
      </div>
    </form>
  );
}
