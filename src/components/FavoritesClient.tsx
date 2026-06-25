'use client';

import { useTranslations } from 'next-intl';
import { Heart } from 'lucide-react';
import { Link } from '@/navigation';
import type { Property } from '@/lib/types';
import { useFavorites } from '@/lib/useFavorites';
import PropertyCard from './PropertyCard';

export default function FavoritesClient({ properties }: { properties: Property[] }) {
  const t = useTranslations('favoritesPage');
  const { ids, ready } = useFavorites();

  // Preserve the order in which items were favorited.
  const favorites = ready
    ? ids.map((id) => properties.find((p) => p.id === id)).filter(Boolean)
    : [];

  return (
    <div className="bg-white pt-24">
      <div className="border-b border-navy/10 bg-cream">
        <div className="mx-auto max-w-7xl px-5 py-10 lg:px-8">
          <p className="eyebrow mb-2">{t('subtitle')}</p>
          <h1 className="font-serif text-3xl text-navy sm:text-4xl">{t('title')}</h1>
          {ready && favorites.length > 0 && (
            <p className="mt-2 font-sans text-sm text-navy/60">{t('count', { count: favorites.length })}</p>
          )}
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-5 py-10 lg:px-8">
        {/* Avoid hydration flash: render nothing until localStorage is read */}
        {!ready ? null : favorites.length === 0 ? (
          <div className="flex flex-col items-center rounded-sm border border-navy/10 bg-cream py-20 text-center">
            <Heart className="mb-4 h-10 w-10 text-gold" />
            <p className="font-serif text-xl text-navy">{t('empty')}</p>
            <p className="mx-auto mt-2 max-w-md px-6 font-sans text-sm text-navy/60">{t('emptyHint')}</p>
            <Link href="/ingatlanok" className="btn-gold mt-8">
              {t('browse')}
            </Link>
          </div>
        ) : (
          <div className="grid gap-7 sm:grid-cols-2 xl:grid-cols-3">
            {favorites.map((p, i) => (
              <PropertyCard key={p!.id} property={p!} index={i} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
