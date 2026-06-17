import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import FavoritesClient from '@/components/FavoritesClient';

export function generateMetadata({ params: { locale } }: { params: { locale: string } }): Metadata {
  return {
    title: locale === 'hu' ? 'Kedvenceim' : 'My favorites',
    robots: { index: false, follow: true },
  };
}

export default function FavoritesPage({ params: { locale } }: { params: { locale: string } }) {
  setRequestLocale(locale);
  return <FavoritesClient />;
}
