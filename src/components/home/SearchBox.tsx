'use client';

import { useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { ChevronDown, MapPin, Search, X } from 'lucide-react';
import { useRouter } from '@/navigation';
import {
  ENERGY_RATINGS,
  HEATING_OPTIONS,
  PROPERTY_TYPES,
  ROOM_OPTIONS,
} from '@/lib/districts';
import { cn } from '@/lib/utils';
import LocationPicker from './LocationPicker';

/** "II. kerület" → "II." for compact chips. */
const shortDistrict = (label: string) => label.replace(/\s*kerület$/i, '');

type Txn = 'elado' | 'kiado';

/**
 * A collapsed single box that expands into two min/max inputs when clicked
 * (ingatlan.com style). Defined outside SearchBox so it keeps focus across the
 * parent's re-renders.
 */
function RangeField({
  open,
  setOpen,
  min,
  setMin,
  max,
  setMax,
  suffix,
  placeholder,
  fieldClass,
  label,
}: {
  open: boolean;
  setOpen: (v: boolean) => void;
  min: string;
  setMin: (v: string) => void;
  max: string;
  setMax: (v: string) => void;
  suffix: string;
  placeholder: string;
  fieldClass: string;
  label: string;
}) {
  const hasValue = Boolean(min || max);
  return (
    <div
      className="relative"
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node)) setOpen(false);
      }}
    >
      {open ? (
        <div className="flex items-center gap-1 rounded-sm border border-gold bg-navy-700 px-2 ring-1 ring-gold">
          <input
            autoFocus
            type="number"
            min={0}
            placeholder="min."
            aria-label={`${label} min.`}
            value={min}
            onChange={(e) => setMin(e.target.value)}
            className="w-full min-w-0 bg-transparent px-1 py-3 font-sans text-sm text-white placeholder:text-white/40 focus:outline-none"
          />
          <span className="shrink-0 text-white/40">–</span>
          <input
            type="number"
            min={0}
            placeholder="max."
            aria-label={`${label} max.`}
            value={max}
            onChange={(e) => setMax(e.target.value)}
            className="w-full min-w-0 bg-transparent px-1 py-3 font-sans text-sm text-white placeholder:text-white/40 focus:outline-none"
          />
          <span className="shrink-0 pr-1 font-sans text-xs text-white/45">{suffix}</span>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label={label}
          className={cn(fieldClass, 'flex items-center justify-between text-left')}
        >
          <span className={cn('truncate', hasValue ? 'text-white' : 'text-white/40')}>
            {hasValue ? `${min || 'min.'} – ${max || 'max.'}` : placeholder}
          </span>
          <span className="shrink-0 pl-2 font-sans text-xs text-white/45">{suffix}</span>
        </button>
      )}
    </div>
  );
}

export default function SearchBox() {
  const t = useTranslations('search');
  const tTypes = useTranslations('types');
  const tHeating = useTranslations('heating');
  const locale = useLocale();
  const router = useRouter();

  const [listingType, setListingType] = useState<Txn>('elado');
  const [type, setType] = useState('');
  const [selDistricts, setSelDistricts] = useState<string[]>([]);
  const [selCities, setSelCities] = useState<string[]>([]);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [priceMin, setPriceMin] = useState('');
  const [priceMax, setPriceMax] = useState('');
  const [sizeMin, setSizeMin] = useState('');
  const [sizeMax, setSizeMax] = useState('');
  const [priceOpen, setPriceOpen] = useState(false);
  const [sizeOpen, setSizeOpen] = useState(false);
  const [yearMin, setYearMin] = useState('');
  const [yearMax, setYearMax] = useState('');
  const [roomsMin, setRoomsMin] = useState(0);
  const [roomsMax, setRoomsMax] = useState(0);
  const [heating, setHeating] = useState<string[]>([]);
  const [energy, setEnergy] = useState<string[]>([]);
  const [garden, setGarden] = useState(false);
  const [parking, setParking] = useState(false);
  const [lift, setLift] = useState(false);
  const [balcony, setBalcony] = useState(false);
  const [ac, setAc] = useState(false);
  const [open, setOpen] = useState(false);

  const toggle = (arr: string[], v: string) =>
    arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v];

  const rent = listingType === 'kiado';
  const priceSuffix = rent ? (locale === 'hu' ? 'Ft / hó' : 'Ft / mo') : 'MFt';

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    params.set('listingType', listingType);
    if (type) params.set('type', type);
    if (selDistricts.length) params.set('districts', selDistricts.join(','));
    if (selCities.length) params.set('cities', selCities.join(','));
    if (priceMin) params.set('minPrice', priceMin);
    if (priceMax) params.set('maxPrice', priceMax);
    if (sizeMin) params.set('minSize', sizeMin);
    if (sizeMax) params.set('maxSize', sizeMax);
    if (yearMin) params.set('yearMin', yearMin);
    if (yearMax) params.set('yearMax', yearMax);
    if (roomsMin > 0) params.set('roomsMin', String(roomsMin));
    if (roomsMax > 0) params.set('roomsMax', String(roomsMax));
    if (heating.length) params.set('heating', heating.join(','));
    if (energy.length) params.set('energy', energy.join(','));
    if (garden) params.set('garden', '1');
    if (parking) params.set('parking', '1');
    if (lift) params.set('lift', '1');
    if (balcony) params.set('balcony', '1');
    if (ac) params.set('ac', '1');
    router.push(`/ingatlanok?${params.toString()}`);
  };

  // Shared field styling for the dark navy panel.
  const field =
    'w-full rounded-sm border border-white/15 bg-navy-700 px-3.5 py-3 font-sans text-sm text-white ' +
    'placeholder:text-white/40 focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold';
  const legend = 'mb-2 block font-sans text-xs font-medium uppercase tracking-wide text-white/55';
  const pill = (active: boolean) =>
    cn(
      'rounded-sm px-3 py-1.5 font-sans text-xs uppercase tracking-wide transition-colors',
      active ? 'bg-gold text-navy' : 'border border-white/20 text-white/70 hover:border-gold',
    );

  return (
    <form
      onSubmit={submit}
      className="w-full max-w-5xl rounded-sm border border-white/10 bg-navy-900/95 p-5 text-left shadow-luxe backdrop-blur-sm md:p-6"
    >
      {/* Transaction toggle */}
      <div className="mb-4 inline-flex gap-2">
        {(['elado', 'kiado'] as const).map((v) => (
          <button
            key={v}
            type="button"
            onClick={() => setListingType(v)}
            className={cn(
              'rounded-sm px-6 py-2 font-sans text-sm font-medium uppercase tracking-wide transition-colors',
              listingType === v
                ? 'bg-gold text-navy'
                : 'border border-white/20 text-white/70 hover:border-gold hover:text-white',
            )}
          >
            {v === 'elado' ? t('forSale') : t('forRent')}
          </button>
        ))}
      </div>

      {/* Main search row */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-[1fr_1.4fr_1fr_1fr_auto]">
        {/* Type */}
        <select
          aria-label={t('type')}
          className={field}
          value={type}
          onChange={(e) => setType(e.target.value)}
        >
          <option value="">{t('typeAny')}</option>
          {PROPERTY_TYPES.map((pt) => (
            <option key={pt} value={pt}>
              {tTypes(pt)}
            </option>
          ))}
        </select>

        {/* Location — opens the picker modal; selections show as chips */}
        <div
          role="button"
          tabIndex={0}
          aria-label={t('location')}
          onClick={() => setPickerOpen(true)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              setPickerOpen(true);
            }
          }}
          className={cn(field, 'flex min-h-[46px] cursor-pointer flex-wrap items-center gap-1.5')}
        >
          {selDistricts.length === 0 && selCities.length === 0 ? (
            <span className="flex items-center gap-2 text-white/40">
              <MapPin className="h-4 w-4 text-gold/70" />
              {t('locationPlaceholder')}
            </span>
          ) : (
            <>
              {selDistricts.map((l) => (
                <span
                  key={l}
                  className="inline-flex items-center gap-1 rounded-sm bg-gold/20 px-2 py-0.5 font-sans text-xs text-white"
                >
                  {shortDistrict(l)}
                  <button
                    type="button"
                    aria-label={`${shortDistrict(l)} ✕`}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelDistricts((p) => p.filter((x) => x !== l));
                    }}
                    className="text-white/60 transition-colors hover:text-gold"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
              {selCities.map((c) => (
                <span
                  key={c}
                  className="inline-flex items-center gap-1 rounded-sm bg-gold/20 px-2 py-0.5 font-sans text-xs text-white"
                >
                  {c}
                  <button
                    type="button"
                    aria-label={`${c} ✕`}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelCities((p) => p.filter((x) => x !== c));
                    }}
                    className="text-white/60 transition-colors hover:text-gold"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </>
          )}
        </div>

        {/* Price (click to expand min/max) */}
        <RangeField
          open={priceOpen}
          setOpen={setPriceOpen}
          min={priceMin}
          setMin={setPriceMin}
          max={priceMax}
          setMax={setPriceMax}
          suffix={priceSuffix}
          placeholder={t('pricePlaceholder')}
          fieldClass={field}
          label={t('pricePlaceholder')}
        />

        {/* Size (click to expand min/max) */}
        <RangeField
          open={sizeOpen}
          setOpen={setSizeOpen}
          min={sizeMin}
          setMin={setSizeMin}
          max={sizeMax}
          setMax={setSizeMax}
          suffix="m²"
          placeholder={t('sizePlaceholder')}
          fieldClass={field}
          label={t('sizePlaceholder')}
        />

        {/* Submit */}
        <button
          type="submit"
          className="flex items-center justify-center gap-2 rounded-sm bg-gold px-6 py-3 font-sans text-sm font-semibold uppercase tracking-wide text-navy transition-colors hover:bg-gold-light sm:col-span-2 lg:col-span-1"
        >
          <Search className="h-4 w-4" />
          {t('submit')}
        </button>
      </div>

      {/* Advanced search toggle */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="mt-4 inline-flex items-center gap-1.5 font-sans text-sm text-gold transition-colors hover:text-gold-light"
      >
        {t('advancedSearch')}
        <ChevronDown className={cn('h-4 w-4 transition-transform', open && 'rotate-180')} />
      </button>

      {/* Advanced panel */}
      {open && (
        <div className="mt-5 grid grid-cols-1 gap-6 border-t border-white/10 pt-6 sm:grid-cols-2">
          {/* Year built min / max */}
          <div>
            <span className={legend}>{t('yearBuilt')}</span>
            <div className="flex items-center gap-3">
              <input
                type="number"
                placeholder="1900"
                className={field}
                value={yearMin}
                onChange={(e) => setYearMin(e.target.value)}
              />
              <span className="text-white/40">–</span>
              <input
                type="number"
                placeholder="2025"
                className={field}
                value={yearMax}
                onChange={(e) => setYearMax(e.target.value)}
              />
            </div>
          </div>

          {/* Rooms min / max */}
          <div>
            <span className={legend}>{t('rooms')}</span>
            <div className="flex items-center gap-3">
              <select
                aria-label={t('roomsMin')}
                className={field}
                value={roomsMin || ''}
                onChange={(e) => setRoomsMin(Number(e.target.value) || 0)}
              >
                <option value="">{t('roomsMin')}</option>
                {ROOM_OPTIONS.map((r) => (
                  <option key={r} value={r}>
                    {r === 5 ? '5+' : r}
                  </option>
                ))}
              </select>
              <span className="text-white/40">–</span>
              <select
                aria-label={t('roomsMax')}
                className={field}
                value={roomsMax || ''}
                onChange={(e) => setRoomsMax(Number(e.target.value) || 0)}
              >
                <option value="">{t('roomsMax')}</option>
                {ROOM_OPTIONS.map((r) => (
                  <option key={r} value={r}>
                    {r === 5 ? '5+' : r}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Energy rating */}
          <div>
            <span className={legend}>{t('energy')}</span>
            <div className="flex flex-wrap gap-2">
              {ENERGY_RATINGS.map((er) => (
                <button
                  key={er}
                  type="button"
                  onClick={() => setEnergy((a) => toggle(a, er))}
                  className={pill(energy.includes(er))}
                >
                  {er}
                </button>
              ))}
            </div>
          </div>

          {/* Heating */}
          <div className="sm:col-span-2">
            <span className={legend}>{t('heating')}</span>
            <div className="flex flex-wrap gap-x-6 gap-y-2">
              {HEATING_OPTIONS.map((h) => (
                <label key={h} className="flex cursor-pointer items-center gap-2 font-sans text-sm text-white/80">
                  <input
                    type="checkbox"
                    checked={heating.includes(h)}
                    onChange={() => setHeating((a) => toggle(a, h))}
                    className="h-4 w-4 accent-gold"
                  />
                  {tHeating(h)}
                </label>
              ))}
            </div>
          </div>

          {/* Garden toggle */}
          <div>
            <span className={legend}>{t('garden')}</span>
            <div className="flex gap-2">
              <button type="button" onClick={() => setGarden(true)} className={pill(garden)}>
                {t('optHas')}
              </button>
              <button type="button" onClick={() => setGarden(false)} className={pill(!garden)}>
                {t('optAny')}
              </button>
            </div>
          </div>

          {/* Parking toggle */}
          <div>
            <span className={legend}>{t('parking')}</span>
            <div className="flex gap-2">
              <button type="button" onClick={() => setParking(true)} className={pill(parking)}>
                {t('optHas')}
              </button>
              <button type="button" onClick={() => setParking(false)} className={pill(!parking)}>
                {t('optAny')}
              </button>
            </div>
          </div>

          {/* Lift toggle */}
          <div>
            <span className={legend}>{t('lift')}</span>
            <div className="flex gap-2">
              <button type="button" onClick={() => setLift(true)} className={pill(lift)}>
                {t('optHas')}
              </button>
              <button type="button" onClick={() => setLift(false)} className={pill(!lift)}>
                {t('optAny')}
              </button>
            </div>
          </div>

          {/* Balcony toggle */}
          <div>
            <span className={legend}>{t('balcony')}</span>
            <div className="flex gap-2">
              <button type="button" onClick={() => setBalcony(true)} className={pill(balcony)}>
                {t('optHas')}
              </button>
              <button type="button" onClick={() => setBalcony(false)} className={pill(!balcony)}>
                {t('optAny')}
              </button>
            </div>
          </div>

          {/* Air conditioning toggle */}
          <div>
            <span className={legend}>{t('ac')}</span>
            <div className="flex gap-2">
              <button type="button" onClick={() => setAc(true)} className={pill(ac)}>
                {t('optHas')}
              </button>
              <button type="button" onClick={() => setAc(false)} className={pill(!ac)}>
                {t('optAny')}
              </button>
            </div>
          </div>
        </div>
      )}

      <LocationPicker
        open={pickerOpen}
        initialDistricts={selDistricts}
        initialCities={selCities}
        onApply={(d, c) => {
          setSelDistricts(d);
          setSelCities(c);
          setPickerOpen(false);
        }}
        onClose={() => setPickerOpen(false)}
      />
    </form>
  );
}
