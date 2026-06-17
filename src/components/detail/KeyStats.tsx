'use client';

import { useLocale, useTranslations } from 'next-intl';
import type { Property } from '@/lib/types';
import { formatPrice, formatSize } from '@/lib/utils';

export default function KeyStats({ property }: { property: Property }) {
  const t = useTranslations('detail');
  const tTypes = useTranslations('types');
  const tCond = useTranslations('conditions');
  const locale = useLocale();

  const floorLabel =
    property.floor == null ? '—' : property.floor === 0 ? t('floorGround') : `${property.floor}.`;

  const rows: Array<[string, string]> = [
    [t('size'), formatSize(property.size_m2, locale)],
    ...(property.type !== 'telek'
      ? ([[t('rooms'), String(property.rooms)]] as Array<[string, string]>)
      : []),
    ...(property.type !== 'telek' ? ([[t('floor'), floorLabel]] as Array<[string, string]>) : []),
    [t('district'), property.district],
    [t('type'), tTypes(property.type)],
    [t('reference'), property.reference_number],
    ...(property.year_built ? ([[t('yearBuilt'), String(property.year_built)]] as Array<[string, string]>) : []),
    [t('parking'), property.parking ? t('yes') : t('no')],
    [t('condition'), tCond(property.condition)],
  ];

  return (
    <div className="rounded-sm border border-navy/10 bg-white p-6 shadow-card">
      <p className="eyebrow mb-1">{t('price')}</p>
      <p className="font-serif text-3xl font-semibold text-navy">
        {formatPrice(property.price, property.currency, locale)}
      </p>

      <dl className="mt-6 divide-y divide-navy/10">
        {rows.map(([label, value]) => (
          <div key={label} className="flex items-center justify-between py-2.5">
            <dt className="font-sans text-sm text-navy/55">{label}</dt>
            <dd className="font-sans text-sm font-medium text-navy">{value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
