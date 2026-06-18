'use client';

import { useLocale, useTranslations } from 'next-intl';
import { X } from 'lucide-react';
import {
  DISTRICTS,
  ENERGY_RATINGS,
  HEATING_OPTIONS,
  PROPERTY_TYPES,
  ROOM_OPTIONS,
} from '@/lib/districts';
import {
  SIZE_MAX,
  SIZE_MIN,
  activeFilterCount,
  priceConfig,
  type ListingState,
} from '@/lib/listing';
import type { PropertyType } from '@/lib/types';
import { cn } from '@/lib/utils';

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
  const tHeating = useTranslations('heating');
  const locale = useLocale();
  const count = activeFilterCount(state);

  const numOr = (v: string, fallback: number) => {
    const n = Number(v);
    return v === '' || !Number.isFinite(n) ? fallback : n;
  };
  const yearStr = (v: number | null) => (v == null ? '' : String(v));
  const parseYear = (v: string) => {
    const n = Number(v);
    return v === '' || !Number.isFinite(n) ? null : n;
  };

  const rent = state.listingType === 'kiado';
  const pc = priceConfig(state.listingType);
  const priceUnit = rent ? (locale === 'hu' ? 'Ft / hó' : 'HUF / mo') : 'MFt';

  const toggle = <T extends string>(arr: T[], value: T): T[] =>
    arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value];

  const seg = (active: boolean) =>
    cn(
      'flex-1 rounded-sm border px-2 py-1.5 font-sans text-xs uppercase tracking-wide transition-colors',
      active ? 'border-gold bg-gold text-navy' : 'border-white/20 text-white/65 hover:border-gold',
    );
  const chipBtn = (active: boolean) =>
    cn(
      'rounded-sm border px-3 py-1.5 font-sans text-sm transition-colors',
      active ? 'border-gold bg-gold text-navy' : 'border-white/20 text-white/70 hover:border-gold',
    );
  const legend = 'mb-3 font-sans text-xs font-semibold uppercase tracking-widest text-white/55';
  const field =
    'w-full rounded-sm border border-white/15 bg-navy-700 px-3 py-2.5 font-sans text-sm text-white ' +
    'placeholder:text-white/40 focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold';
  const checkLabel = 'flex cursor-pointer items-center gap-2 font-sans text-sm text-white/80';

  const txnOpts = [
    { v: 'elado', k: 'forSale' },
    { v: 'kiado', k: 'forRent' },
    { v: '', k: 'both' },
  ] as const;
  const regionOpts = [
    { v: 'budapest', k: 'locBudapest' },
    { v: 'videk', k: 'locVidek' },
    { v: '', k: 'locAll' },
  ] as const;

  return (
    <div className="space-y-7 rounded-sm border border-white/10 bg-navy-900 p-5 text-white shadow-card">
      <div className="flex items-center justify-between">
        <h2 className="font-serif text-xl text-white">{t('filters')}</h2>
        {count > 0 && (
          <button
            type="button"
            onClick={onClear}
            className="flex items-center gap-1 font-sans text-xs uppercase tracking-wide text-gold transition-colors hover:text-gold-light"
          >
            <X className="h-3.5 w-3.5" />
            {t('clearFilters')}
          </button>
        )}
      </div>

      {/* Transaction type — labels omitted; the buttons are self-explanatory */}
      <div>
        <div className="flex gap-2">
          {txnOpts.map((o) => (
            <button
              key={o.v || 'all'}
              type="button"
              onClick={() => onChange({ listingType: o.v, minPrice: priceConfig(o.v).min, maxPrice: priceConfig(o.v).max })}
              className={seg(state.listingType === o.v)}
            >
              {t(o.k)}
            </button>
          ))}
        </div>
      </div>

      {/* Location / region — label omitted; the buttons are self-explanatory */}
      <div>
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
        <legend className={legend}>{t('type')}</legend>
        <div className="flex flex-wrap gap-2">
          {PROPERTY_TYPES.map((pt) => (
            <button
              key={pt}
              type="button"
              onClick={() => onChange({ types: toggle<PropertyType>(state.types, pt) })}
              className={chipBtn(state.types.includes(pt))}
            >
              {tTypes(pt)}
            </button>
          ))}
        </div>
      </fieldset>

      {/* Price — min / max (scale depends on sale vs rent) */}
      <div>
        <p className={legend}>
          {t('priceRange')} ({priceUnit})
        </p>
        <div className="flex items-center gap-3">
          <input
            type="number"
            min={0}
            placeholder={t('min')}
            value={state.minPrice > pc.min ? state.minPrice : ''}
            onChange={(e) => onChange({ minPrice: numOr(e.target.value, pc.min) })}
            className={field}
          />
          <span className="text-white/40">–</span>
          <input
            type="number"
            min={0}
            placeholder={t('max')}
            value={state.maxPrice < pc.max ? state.maxPrice : ''}
            onChange={(e) => onChange({ maxPrice: numOr(e.target.value, pc.max) })}
            className={field}
          />
        </div>
      </div>

      {/* Size — min / max */}
      <div>
        <p className={legend}>{t('sizeRange')}</p>
        <div className="flex items-center gap-3">
          <input
            type="number"
            min={0}
            placeholder={t('min')}
            value={state.minSize > SIZE_MIN ? state.minSize : ''}
            onChange={(e) => onChange({ minSize: numOr(e.target.value, SIZE_MIN) })}
            className={field}
          />
          <span className="text-white/40">–</span>
          <input
            type="number"
            min={0}
            placeholder={t('max')}
            value={state.maxSize < SIZE_MAX ? state.maxSize : ''}
            onChange={(e) => onChange({ maxSize: numOr(e.target.value, SIZE_MAX) })}
            className={field}
          />
        </div>
      </div>

      {/* Rooms */}
      <div>
        <p className={legend}>{t('rooms')}</p>
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
                  active ? 'border-gold bg-gold text-navy' : 'border-white/20 text-white/70 hover:border-gold',
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
            className={field}
          />
        </div>
      ) : (
        <fieldset>
          <legend className={legend}>{t('district')}</legend>
          <div
            className={cn(
              'grid max-h-64 grid-cols-2 gap-x-4 gap-y-2 overflow-y-auto pr-1',
              state.region === '' && 'pointer-events-none opacity-50',
            )}
          >
            {DISTRICTS.map((d) => {
              const active = state.districts.includes(d.label);
              return (
                <label
                  key={d.label}
                  className={cn(
                    'flex items-center gap-2 font-sans text-sm text-white/80',
                    state.region === '' ? 'cursor-default' : 'cursor-pointer',
                  )}
                >
                  <input
                    type="checkbox"
                    checked={active}
                    disabled={state.region === ''}
                    onChange={() => onChange({ districts: toggle(state.districts, d.label) })}
                    className="h-4 w-4 accent-gold"
                  />
                  {d.roman}
                </label>
              );
            })}
          </div>
          {state.region === '' && (
            <p className="mt-2 font-sans text-xs italic text-white/45">{t('districtBudapestOnly')}</p>
          )}
        </fieldset>
      )}

      {/* ── Advanced filters ─────────────────────────────── */}
      <div className="border-t border-white/10 pt-6">
        <p className="mb-5 font-serif text-lg text-white">{t('advancedTitle')}</p>

        {/* Year built */}
        <div className="mb-6">
          <p className={legend}>{t('yearBuilt')}</p>
          <div className="flex items-center gap-3">
            <input
              type="number"
              placeholder={t('yearFrom')}
              value={yearStr(state.yearMin)}
              onChange={(e) => onChange({ yearMin: parseYear(e.target.value) })}
              className={field}
            />
            <span className="text-white/40">–</span>
            <input
              type="number"
              placeholder={t('yearTo')}
              value={yearStr(state.yearMax)}
              onChange={(e) => onChange({ yearMax: parseYear(e.target.value) })}
              className={field}
            />
          </div>
        </div>

        {/* Heating */}
        <fieldset className="mb-6">
          <legend className={legend}>{t('heating')}</legend>
          <div className="grid grid-cols-2 gap-x-4 gap-y-2">
            {HEATING_OPTIONS.map((h) => (
              <label key={h} className={checkLabel}>
                <input
                  type="checkbox"
                  checked={state.heating.includes(h)}
                  onChange={() => onChange({ heating: toggle(state.heating, h) })}
                  className="h-4 w-4 accent-gold"
                />
                {tHeating(h)}
              </label>
            ))}
          </div>
        </fieldset>

        {/* Energy rating */}
        <div className="mb-6">
          <p className={legend}>{t('energy')}</p>
          <div className="flex flex-wrap gap-2">
            {ENERGY_RATINGS.map((er) => (
              <button
                key={er}
                type="button"
                onClick={() => onChange({ energyRatings: toggle(state.energyRatings, er) })}
                className={chipBtn(state.energyRatings.includes(er))}
              >
                {er}
              </button>
            ))}
          </div>
        </div>

        {/* Garden */}
        <div className="mb-6">
          <p className={legend}>{t('garden')}</p>
          <div className="flex gap-2">
            <button type="button" onClick={() => onChange({ garden: true })} className={seg(state.garden)}>
              {t('optYes')}
            </button>
            <button type="button" onClick={() => onChange({ garden: false })} className={seg(!state.garden)}>
              {t('optAny')}
            </button>
          </div>
        </div>

        {/* Parking */}
        <div>
          <p className={legend}>{t('parking')}</p>
          <div className="flex gap-2">
            <button type="button" onClick={() => onChange({ parking: true })} className={seg(state.parking)}>
              {t('optYes')}
            </button>
            <button type="button" onClick={() => onChange({ parking: false })} className={seg(!state.parking)}>
              {t('optAny')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
