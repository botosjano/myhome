'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useTranslations } from 'next-intl';
import { Check, MapPin, Search, X } from 'lucide-react';
import {
  BUDA_DISTRICTS,
  DISTRICTS,
  PEST_DISTRICTS,
  VIDEK_LOCATIONS,
} from '@/lib/districts';
import { cn } from '@/lib/utils';
import BudapestMap from './BudapestMap';

type Tab = 'budapest' | 'videk';

const labelsFor = (arabics: readonly number[]) =>
  DISTRICTS.filter((d) => arabics.includes(d.arabic)).map((d) => d.label);

export default function LocationPicker({
  open,
  initialDistricts,
  initialCities,
  onApply,
  onClose,
}: {
  open: boolean;
  initialDistricts: string[];
  initialCities: string[];
  onApply: (districts: string[], cities: string[]) => void;
  onClose: () => void;
}) {
  const t = useTranslations('locpicker');
  const [tab, setTab] = useState<Tab>('budapest');
  const [query, setQuery] = useState('');
  const [districts, setDistricts] = useState<string[]>(initialDistricts);
  const [cities, setCities] = useState<string[]>(initialCities);

  // Re-seed local state each time the modal is (re)opened.
  useEffect(() => {
    if (open) {
      setDistricts(initialDistricts);
      setCities(initialCities);
      setQuery('');
    }
  }, [open, initialDistricts, initialCities]);

  // Close on Escape.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  const toggle = (arr: string[], v: string) =>
    arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v];

  const q = query.trim().toLowerCase();
  const filteredDistricts = DISTRICTS.filter(
    (d) =>
      !q ||
      d.label.toLowerCase().includes(q) ||
      d.roman.toLowerCase().includes(q) ||
      d.area_hu.toLowerCase().includes(q),
  );
  const filteredCities = VIDEK_LOCATIONS.filter((c) => !q || c.toLowerCase().includes(q));

  // Quick group select: toggle the whole side on/off.
  const selectGroup = (arabics: readonly number[]) => {
    const groupLabels = labelsFor(arabics);
    const allOn = groupLabels.every((l) => districts.includes(l));
    setDistricts((prev) =>
      allOn
        ? prev.filter((l) => !groupLabels.includes(l))
        : Array.from(new Set([...prev, ...groupLabels])),
    );
  };
  const groupActive = (arabics: readonly number[]) =>
    labelsFor(arabics).every((l) => districts.includes(l));

  const count = districts.length + cities.length;

  const tabBtn = (active: boolean) =>
    cn(
      'flex-1 rounded-sm px-4 py-2 font-sans text-sm font-medium uppercase tracking-wide transition-colors',
      active ? 'bg-gold text-navy' : 'text-white/65 hover:text-white',
    );
  const chip = (active: boolean) =>
    cn(
      'rounded-sm border px-3 py-1.5 font-sans text-xs uppercase tracking-wide transition-colors',
      active ? 'border-gold bg-gold text-navy' : 'border-white/20 text-white/70 hover:border-gold',
    );

  return createPortal(
    <div className="fixed inset-0 z-[80] flex items-start justify-center overflow-y-auto p-4 sm:items-center">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-navy/70 backdrop-blur-sm" onClick={onClose} />

      {/* Dialog */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label={t('title')}
        className="relative z-10 w-full max-w-2xl overflow-hidden rounded-sm border border-white/10 bg-navy-900 shadow-luxe"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
          <h2 className="font-serif text-2xl text-white">{t('title')}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label={t('cancel')}
            className="text-white/60 transition-colors hover:text-gold"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="px-6 py-5">
          {/* Search */}
          <div className="relative mb-4">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
            <input
              type="text"
              autoFocus
              placeholder={tab === 'budapest' ? t('searchPlaceholderBp') : t('searchPlaceholderVidek')}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full rounded-sm border border-white/15 bg-navy-700 py-3 pl-10 pr-3 font-sans text-sm text-white placeholder:text-white/40 focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold"
            />
          </div>

          {/* Tabs */}
          <div className="mb-5 flex gap-1 rounded-sm bg-navy-700 p-1">
            <button type="button" onClick={() => setTab('budapest')} className={tabBtn(tab === 'budapest')}>
              {t('tabBudapest')}
            </button>
            <button type="button" onClick={() => setTab('videk')} className={tabBtn(tab === 'videk')}>
              {t('tabVidek')}
            </button>
          </div>

          {/* Panel */}
          <div className="max-h-[46vh] overflow-y-auto pr-1">
            {tab === 'budapest' ? (
              <div className="grid gap-6 sm:grid-cols-[1fr_auto]">
                {/* Left: quick toggles + district grid */}
                <div>
                  <div className="mb-4 flex flex-wrap gap-2">
                    <button type="button" onClick={() => selectGroup(BUDA_DISTRICTS)} className={chip(groupActive(BUDA_DISTRICTS))}>
                      {t('budaSide')}
                    </button>
                    <button type="button" onClick={() => selectGroup(PEST_DISTRICTS)} className={chip(groupActive(PEST_DISTRICTS))}>
                      {t('pestSide')}
                    </button>
                    <button
                      type="button"
                      onClick={() => selectGroup(DISTRICTS.map((d) => d.arabic))}
                      className={chip(groupActive(DISTRICTS.map((d) => d.arabic)))}
                    >
                      {t('allBudapest')}
                    </button>
                  </div>

                  {filteredDistricts.length === 0 ? (
                    <p className="font-sans text-sm italic text-white/45">{t('noResults')}</p>
                  ) : (
                    <div className="grid grid-cols-2 gap-x-5 gap-y-2 sm:grid-cols-3">
                      {filteredDistricts.map((d) => (
                        <label
                          key={d.label}
                          className="flex cursor-pointer items-center gap-2 font-sans text-sm text-white/80"
                        >
                          <input
                            type="checkbox"
                            checked={districts.includes(d.label)}
                            onChange={() => setDistricts((p) => toggle(p, d.label))}
                            className="h-4 w-4 accent-gold"
                          />
                          {d.roman}
                        </label>
                      ))}
                    </div>
                  )}
                </div>

                {/* Right: schematic map */}
                <div className="hidden w-56 shrink-0 sm:block">
                  <BudapestMap
                    selected={districts}
                    onToggle={(l) => setDistricts((p) => toggle(p, l))}
                  />
                </div>
              </div>
            ) : (
              <div>
                <p className="mb-3 font-sans text-xs font-semibold uppercase tracking-widest text-white/45">
                  {t('videkLegend')}
                </p>
                {filteredCities.length === 0 ? (
                  <p className="font-sans text-sm italic text-white/45">{t('noResults')}</p>
                ) : (
                  <div className="grid grid-cols-2 gap-x-5 gap-y-2 sm:grid-cols-3">
                    {filteredCities.map((c) => (
                      <label key={c} className="flex cursor-pointer items-center gap-2 font-sans text-sm text-white/80">
                        <input
                          type="checkbox"
                          checked={cities.includes(c)}
                          onChange={() => setCities((p) => toggle(p, c))}
                          className="h-4 w-4 accent-gold"
                        />
                        {c}
                      </label>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-3 border-t border-white/10 bg-navy-800 px-6 py-4">
          <div className="flex items-center gap-3">
            {count > 0 && (
              <>
                <span className="flex items-center gap-1.5 font-sans text-xs text-white/55">
                  <MapPin className="h-3.5 w-3.5 text-gold" />
                  {t('selected', { count })}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setDistricts([]);
                    setCities([]);
                  }}
                  className="font-sans text-xs uppercase tracking-wide text-gold transition-colors hover:text-gold-light"
                >
                  {t('clear')}
                </button>
              </>
            )}
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-sm border border-white/20 px-5 py-2.5 font-sans text-sm font-medium uppercase tracking-wide text-white/80 transition-colors hover:border-white/40"
            >
              {t('cancel')}
            </button>
            <button
              type="button"
              onClick={() => onApply(districts, cities)}
              className="flex items-center gap-2 rounded-sm bg-gold px-6 py-2.5 font-sans text-sm font-semibold uppercase tracking-wide text-navy transition-colors hover:bg-gold-light"
            >
              <Check className="h-4 w-4" />
              {t('confirm')}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
