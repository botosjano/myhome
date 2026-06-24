'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Pencil, Plus, Star, Trash2 } from 'lucide-react';
import type { Property, PropertyStatus } from '@/lib/types';
import { deleteProperty, listProperties, toggleFeatured } from '@/lib/admin/store';
import { cn, formatPrice } from '@/lib/utils';
import StatusBadge, { STATUS_LABEL } from '@/components/admin/StatusBadge';

type Filter = 'all' | PropertyStatus;

export default function AdminPropertiesPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [filter, setFilter] = useState<Filter>('all');

  const reload = () => listProperties().then(setProperties);
  useEffect(() => {
    reload();
  }, []);

  const shown = useMemo(
    () => (filter === 'all' ? properties : properties.filter((p) => p.status === filter)),
    [properties, filter],
  );

  const onDelete = async (id: string, title: string) => {
    if (window.confirm(`Biztosan törli? „${title}”`)) {
      await deleteProperty(id);
      reload();
    }
  };

  const onToggleFeatured = async (id: string) => {
    await toggleFeatured(id);
    reload();
  };

  const filters: Filter[] = ['all', 'active', 'hidden', 'sold'];

  return (
    <div className="mx-auto max-w-6xl">
      <header className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl text-navy">Ingatlanok</h1>
          <p className="mt-1 font-sans text-sm text-navy/55">{properties.length} hirdetés a rendszerben</p>
        </div>
        <Link
          href="/admin/ingatlanok/uj"
          className="flex items-center gap-2 rounded-sm bg-gold px-5 py-2.5 font-sans text-sm font-semibold uppercase tracking-wide text-navy transition-colors hover:bg-gold-light"
        >
          <Plus className="h-4 w-4" />
          Új ingatlan
        </Link>
      </header>

      {/* Status filter */}
      <div className="mb-4 flex flex-wrap gap-2">
        {filters.map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            className={cn(
              'rounded-sm border px-3 py-1.5 font-sans text-xs uppercase tracking-wide transition-colors',
              filter === f ? 'border-gold bg-gold text-navy' : 'border-navy/15 text-navy/60 hover:border-gold',
            )}
          >
            {f === 'all' ? 'Mind' : STATUS_LABEL[f]}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-sm border border-navy/10 bg-white shadow-card">
        {shown.map((p) => (
          <div
            key={p.id}
            className="flex flex-wrap items-center gap-4 border-b border-navy/5 px-4 py-3 last:border-0"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={p.images[0]}
              alt={p.title_hu}
              className="h-14 w-20 shrink-0 rounded-sm object-cover"
            />
            <div className="min-w-0 flex-1">
              <p className="truncate font-serif text-base text-navy">{p.title_hu}</p>
              <p className="font-sans text-xs text-navy/50">
                {p.reference_number} · {formatPrice(p.price, p.currency, 'hu', p.listing_type)}
              </p>
            </div>

            <StatusBadge status={p.status} />

            <button
              type="button"
              onClick={() => onToggleFeatured(p.id)}
              aria-label="Kiemelés"
              title={p.featured ? 'Kiemelt' : 'Nem kiemelt'}
              className={cn(
                'rounded-sm p-2 transition-colors',
                p.featured ? 'text-gold' : 'text-navy/25 hover:text-gold',
              )}
            >
              <Star className={cn('h-4 w-4', p.featured && 'fill-gold')} />
            </button>

            <Link
              href={`/admin/ingatlanok/${p.id}/szerkeszt`}
              aria-label="Szerkesztés"
              className="rounded-sm p-2 text-navy/50 transition-colors hover:bg-navy/5 hover:text-navy"
            >
              <Pencil className="h-4 w-4" />
            </Link>
            <button
              type="button"
              onClick={() => onDelete(p.id, p.title_hu)}
              aria-label="Törlés"
              className="rounded-sm p-2 text-navy/50 transition-colors hover:bg-red-50 hover:text-red-600"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
        {shown.length === 0 && (
          <p className="px-5 py-10 text-center font-sans text-sm text-navy/45">
            Nincs a szűrőnek megfelelő ingatlan.
          </p>
        )}
      </div>
    </div>
  );
}
