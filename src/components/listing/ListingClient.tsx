'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { LayoutGrid, Map as MapIcon, SlidersHorizontal, X } from 'lucide-react';
import type { Property } from '@/lib/types';
import {
  applyState,
  activeFilterCount,
  defaultState,
  paramsFromState,
  stateFromParams,
  type ListingState,
  type SortKey,
} from '@/lib/listing';
import { cn } from '@/lib/utils';
import PropertyCard from '../PropertyCard';
import FilterSidebar from './FilterSidebar';
import PropertyMap from './PropertyMap';

const PAGE_SIZE = 6;

export default function ListingClient({ properties }: { properties: Property[] }) {
  const t = useTranslations('listing');
  const [state, setState] = useState<ListingState>(defaultState);
  const [visible, setVisible] = useState(PAGE_SIZE);
  const [drawer, setDrawer] = useState(false);
  const firstSync = useRef(true);

  const results = useMemo(() => applyState(properties, state), [state, properties]);

  // Hydrate the filter state from the URL on mount (kept client-side so the page
  // stays statically generated and CDN-fast).
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setState(stateFromParams((k) => params.get(k)));
  }, []);

  // Keep the URL in sync (shareable) without a full navigation. Skip the first
  // run so we don't wipe the params before the mount effect has read them.
  useEffect(() => {
    if (firstSync.current) {
      firstSync.current = false;
      return;
    }
    const qs = paramsFromState(state).toString();
    const url = qs ? `?${qs}` : window.location.pathname;
    window.history.replaceState(null, '', url);
  }, [state]);

  // Reset pagination whenever the result set changes.
  useEffect(() => {
    setVisible(PAGE_SIZE);
  }, [results]);

  const patch = (p: Partial<ListingState>) => setState((s) => ({ ...s, ...p }));
  const clear = () =>
    setState((s) => ({ ...defaultState(), sort: s.sort, view: s.view }));

  const count = activeFilterCount(state);
  const shown = results.slice(0, visible);

  return (
    <div className="bg-white pt-24">
      {/* Header */}
      <div className="border-b border-navy/10 bg-cream">
        <div className="mx-auto max-w-7xl px-5 py-10 lg:px-8">
          <p className="eyebrow mb-2">{t('subtitle')}</p>
          <h1 className="font-serif text-3xl text-navy sm:text-4xl">{t('title')}</h1>
        </div>
      </div>

      <div className="mx-auto max-w-7xl gap-10 px-5 py-10 lg:flex lg:px-8">
        {/* Desktop sidebar */}
        <aside className="hidden w-72 shrink-0 lg:block">
          <div className="sticky top-24">
            <FilterSidebar state={state} onChange={patch} onClear={clear} />
          </div>
        </aside>

        <div className="min-w-0 flex-1">
          {/* Toolbar */}
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setDrawer(true)}
                className="flex items-center gap-2 rounded-sm border border-navy/15 px-3 py-2 font-sans text-sm text-navy lg:hidden"
              >
                <SlidersHorizontal className="h-4 w-4" />
                {t('filters')}
                {count > 0 && (
                  <span className="ml-1 rounded-full bg-gold px-1.5 text-xs text-navy">{count}</span>
                )}
              </button>
              <p className="font-sans text-sm text-navy/60">
                {results.length > 0 ? t('results', { count: results.length }) : t('resultsNone')}
              </p>
            </div>

            <div className="flex items-center gap-3">
              {/* Sort */}
              <select
                value={state.sort}
                onChange={(e) => patch({ sort: e.target.value as SortKey })}
                aria-label={t('sortLabel')}
                className="rounded-sm border border-navy/15 bg-white px-3 py-2 font-sans text-sm text-navy focus:border-gold focus:outline-none"
              >
                <option value="newest">{t('sortNewest')}</option>
                <option value="priceAsc">{t('sortPriceAsc')}</option>
                <option value="priceDesc">{t('sortPriceDesc')}</option>
              </select>

              {/* View toggle */}
              <div className="flex overflow-hidden rounded-sm border border-navy/15">
                {(['list', 'map'] as const).map((v) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => patch({ view: v })}
                    aria-pressed={state.view === v}
                    className={cn(
                      'flex items-center gap-1.5 px-3 py-2 font-sans text-sm transition-colors',
                      state.view === v ? 'bg-navy text-white' : 'bg-white text-navy/60 hover:text-navy',
                    )}
                  >
                    {v === 'list' ? <LayoutGrid className="h-4 w-4" /> : <MapIcon className="h-4 w-4" />}
                    {v === 'list' ? t('viewList') : t('viewMap')}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Results */}
          {state.view === 'map' ? (
            <PropertyMap properties={results} />
          ) : results.length === 0 ? (
            <div className="rounded-sm border border-navy/10 bg-cream py-20 text-center">
              <p className="font-serif text-xl text-navy">{t('resultsNone')}</p>
              <p className="mt-2 font-sans text-sm text-navy/60">{t('emptyHint')}</p>
            </div>
          ) : (
            <>
              <div className="grid gap-7 sm:grid-cols-2 xl:grid-cols-3">
                {shown.map((p, i) => (
                  <PropertyCard key={p.id} property={p} index={i} />
                ))}
              </div>
              {visible < results.length && (
                <div className="mt-10 text-center">
                  <button
                    type="button"
                    onClick={() => setVisible((v) => v + PAGE_SIZE)}
                    className="btn-outline !text-navy !border-navy/30 hover:!bg-navy hover:!text-white"
                  >
                    {t('loadMore')}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Mobile filter drawer */}
      {drawer && (
        <div className="fixed inset-0 z-[60] lg:hidden">
          <div className="absolute inset-0 bg-navy/50" onClick={() => setDrawer(false)} />
          <div className="absolute inset-y-0 left-0 w-[85%] max-w-sm overflow-y-auto bg-navy-900 p-4 shadow-luxe">
            <div className="mb-4 flex justify-end">
              <button type="button" onClick={() => setDrawer(false)} aria-label="Close" className="text-white">
                <X className="h-6 w-6" />
              </button>
            </div>
            <FilterSidebar state={state} onChange={patch} onClear={clear} />
            <button type="button" onClick={() => setDrawer(false)} className="btn-gold mt-8 w-full">
              {t('applyFilters')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
