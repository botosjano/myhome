'use client';

import { useTranslations } from 'next-intl';
import { X } from 'lucide-react';
import { DISTRICTS, PROPERTY_TYPES, ROOM_OPTIONS } from '@/lib/districts';
import {
  PRICE_MAX_MFT,
  PRICE_MIN_MFT,
  SIZE_MAX,
  SIZE_MIN,
  activeFilterCount,
  type ListingState,
} from '@/lib/listing';
import type { PropertyType } from '@/lib/types';
import { cn } from '@/lib/utils';
import DualRange from './DualRange';

export default function FilterSidebar({
  state,
  onChange,
  onClear,
}: {
  state: ListingState;
  onChange: (patch: Partial<ListingState>) => void;
  onClear: () => void;
}) {
  const t = useTranslations('listing');
  const tTypes = useTranslations('types');
  const count = activeFilterCount(state);

  const toggle = <T extends string>(arr: T[], value: T): T[] =>
    arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value];

  const seg = (active: boolean) =>
    cn(
      'flex-1 rounded-sm border px-2 py-1.5 font-sans text-xs uppercase tracking-wide transition-colors',
      active ? 'border-gold bg-gold text-navy' : 'border-navy/15 text-navy/60 hover:border-gold',
    );
  const legend = 'mb-3 font-sans text-xs font-semibold uppercase tracking-widest text-navy/50';

  const txnOpts = [
    { v: '', k: 'both' },
    { v: 'elado', k: 'forSale' },
    { v: 'kiado', k: 'forRent' },
  ] as const;
  const regionOpts = [
    { v: '', k: 'locAll' },
    { v: 'budapest', k: 'locBudapest' },
    { v: 'videk', k: 'locVidek' },
  ] as const;

  return (
    <div className="space-y-7">
      <div className="flex items-center justify-between">
        <h2 className="font-serif text-xl text-navy">{t('filters')}</h2>
        {count > 0 && (
          <button
            type="button"
            onClick={onClear}
            className="flex items-center gap-1 font-sans text-xs uppercase tracking-wide text-gold transition-colors hover:text-gold-dark"
          >
            <X className="h-3.5 w-3.5" />
            {t('clearFilters')}
          </button>
        )}
      </div>

      {/* Transaction type */}
      <div>
        <p className={legend}>{t('transaction')}</p>
        <div className="flex gap-2">
          {txnOpts.map((o) => (
            <button key={o.v || 'all'} type="button" onClick={() => onChange({ listingType: o.v })} className={seg(state.listingType === o.v)}>
              {t(o.k)}
            </button>
          ))}
        </div>
      </div>

      {/* Location / region */}
      <div>
        <p className={legend}>{t('location')}</p>
        <div className="flex gap-2">
          {regionOpts.map((o) => (
            <button
              key={o.v || 'all'}
              type="button"
              onClick={() => onChange({ region: o.v, ...(o.v === 'videk' ? { districts: [] } : { city: '' }) })}
              className={seg(state.region === o.v)}
            >
              {t(o.k)}
            </button>
          ))}
        </div>
      </div>

      {/* Property type */}
      <fieldset>
        <legend className={legend}>
          {t('type')}
        </legend>
        <div className="flex flex-wrap gap-2">
          {PROPERTY_TYPES.map((pt) => {
            const active = state.types.includes(pt);
            return (
              <button
                key={pt}
                type="button"
                onClick={() => onChange({ types: toggle<PropertyType>(state.types, pt) })}
                className={cn(
                  'rounded-sm border px-3 py-1.5 font-sans text-sm transition-colors',
                  active
                    ? 'border-gold bg-gold text-navy'
                    : 'border-navy/15 text-navy/70 hover:border-gold',
                )}
              >
                {tTypes(pt)}
              </button>
            );
          })}
        </div>
      </fieldset>

      {/* Price */}
      <div>
        <p className="mb-3 font-sans text-xs font-semibold uppercase tracking-widest text-navy/50">
          {t('priceRange')} (MFt)
        </p>
        <DualRange
          min={PRICE_MIN_MFT}
          max={PRICE_MAX_MFT}
          step={10}
          low={state.minPriceMft}
          high={state.maxPriceMft}
          onChange={(low, high) => onChange({ minPriceMft: low, maxPriceMft: high })}
          format={(v) => `${v} MFt`}
        />
      </div>

      {/* Size */}
      <div>
        <p className="mb-3 font-sans text-xs font-semibold uppercase tracking-widest text-navy/50">
          {t('sizeRange')}
        </p>
        <DualRange
          min={SIZE_MIN}
          max={SIZE_MAX}
          step={10}
          low={state.minSize}
          high={state.maxSize}
          onChange={(low, high) => onChange({ minSize: low, maxSize: high })}
          format={(v) => `${v} m²`}
        />
      </div>

      {/* Rooms */}
      <div>
        <p className="mb-3 font-sans text-xs font-semibold uppercase tracking-widest text-navy/50">
          {t('rooms')}
        </p>
        <div className="flex gap-2">
          {ROOM_OPTIONS.map((r) => {
            const active = state.rooms === r;
            return (
              <button
                key={r}
                type="button"
                onClick={() => onChange({ rooms: active ? 0 : r })}
                className={cn(
                  'h-10 flex-1 rounded-sm border font-sans text-sm transition-colors',
                  active ? 'border-gold bg-gold text-navy' : 'border-navy/15 text-navy/70 hover:border-gold',
                )}
              >
                {r === 5 ? '5+' : r}
              </button>
            );
          })}
        </div>
      </div>

      {/* Vidék → free-text city/region; otherwise Budapest districts */}
      {state.region === 'videk' ? (
        <div>
          <p className={legend}>{t('cityPlaceholder')}</p>
          <input
            type="text"
            placeholder={t('cityPlaceholder')}
            value={state.city}
            onChange={(e) => onChange({ city: e.target.value })}
            className="w-full rounded-sm border border-navy/15 px-3 py-2.5 font-sans text-sm text-navy focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold"
          />
        </div>
      ) : (
        <fieldset>
          <legend className={legend}>{t('district')}</legend>
          <div className="grid max-h-64 grid-cols-2 gap-x-4 gap-y-2 overflow-y-auto pr-1">
            {DISTRICTS.map((d) => {
              const active = state.districts.includes(d.label);
              return (
                <label
                  key={d.label}
                  className="flex cursor-pointer items-center gap-2 font-sans text-sm text-navy/80"
                >
                  <input
                    type="checkbox"
                    checked={active}
                    onChange={() => onChange({ districts: toggle(state.districts, d.label) })}
                    className="h-4 w-4 accent-gold"
                  />
                  {d.roman}
                </label>
              );
            })}
          </div>
        </fieldset>
      )}
    </div>
  );
}
