import { getTranslations } from 'next-intl/server';
import type { Property } from '@/lib/types';
import { formatPrice, formatSize, isLand, localizedType, locationLabel } from '@/lib/utils';

/**
 * Print-only, single-page A4 property sheet (navy/gold). Hidden on screen
 * (`hidden print:block`); the rest of the detail page is `print:hidden`, so the
 * browser's "Save as PDF" produces this elegant one-pager.
 */
export default async function PrintSheet({
  property,
  locale,
}: {
  property: Property;
  locale: string;
}) {
  const t = await getTranslations('detail');
  const tTypes = await getTranslations('types');
  const tCond = await getTranslations('conditions');
  const tHeating = await getTranslations('heating');

  const isHu = locale === 'hu';
  const title = isHu ? property.title_hu : property.title_en;
  const description = isHu ? property.description_hu : property.description_en;
  const floorLabel =
    property.floor == null ? '—' : property.floor === 0 ? t('floorGround') : `${property.floor}.`;
  const location =
    property.region === 'budapest' ? `${locationLabel(property)}, Budapest` : locationLabel(property);

  const stats: Array<[string, string]> = [
    [t('size'), formatSize(property.size_m2, locale)],
    ...(!isLand(property.type) ? ([[t('rooms'), String(property.rooms)]] as [string, string][]) : []),
    ...(!isLand(property.type) ? ([[t('floor'), floorLabel]] as [string, string][]) : []),
    [property.region === 'videk' ? t('location') : t('district'), locationLabel(property)],
    [t('type'), tTypes(property.type)],
    ...(property.year_built ? ([[t('yearBuilt'), String(property.year_built)]] as [string, string][]) : []),
    [t('parking'), property.parking ? t('yes') : t('no')],
    [t('condition'), tCond(property.condition)],
    [t('heating'), tHeating(property.heating)],
    [t('energy'), property.energy_rating],
  ];

  return (
    <div className="print-sheet hidden text-navy print:block">
      {/* Header: title block + logo */}
      <div className="flex items-start justify-between border-b-2 border-gold pb-4">
        <div className="pr-6">
          <p className="font-sans text-[10px] uppercase tracking-[0.2em] text-gold-dark">
            {localizedType(property.type, locale)} · {t('reference')} {property.reference_number}
          </p>
          <h1 className="mt-1 font-serif text-[26px] leading-tight text-navy">{title}</h1>
          <p className="mt-1 font-sans text-sm text-navy/70">{location}</p>
        </div>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo.png" alt="My Home Budapest" className="h-20 w-20 shrink-0 object-contain" />
      </div>

      {/* Price */}
      <p className="mt-3 font-serif text-[28px] font-semibold text-navy">
        {formatPrice(property.price, property.currency, locale, property.listing_type)}
      </p>

      {/* Main photo */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={property.images[0]}
        alt={title}
        className="mt-3 h-[80mm] w-full rounded-sm object-cover"
      />

      {/* Key stats grid */}
      <div className="mt-5 grid grid-cols-4 gap-x-5 gap-y-3 border-y border-navy/15 py-4">
        {stats.map(([label, value]) => (
          <div key={label}>
            <p className="font-sans text-[9px] uppercase tracking-wide text-navy/45">{label}</p>
            <p className="mt-0.5 font-serif text-sm text-navy">{value}</p>
          </div>
        ))}
      </div>

      {/* Short description */}
      <p className="mt-4 line-clamp-6 whitespace-pre-line font-sans text-[11px] leading-relaxed text-navy/75">
        {description}
      </p>

      {/* Contact footer */}
      <div className="mt-6 flex items-center justify-between border-t border-gold pt-3 font-sans text-[11px] text-navy/80">
        <span>myhome@olahkrisztina.hu</span>
        <span className="font-semibold uppercase tracking-widest text-gold-dark">My Home Budapest</span>
        <span>myhomebudapest.hu</span>
      </div>
    </div>
  );
}
