import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import { fetchActiveProperties } from '@/lib/properties';
import FavoritesClient from '@/components/FavoritesClient';

export const revalidate = 60;

export function generateMetadata({ params: { locale } }: { params: { locale: string } }): Metadata {
  return {
    title: locale === 'hu' ? 'Kedvenceim' : 'My favorites',
    robots: { index: false, follow: true },
  };
}

export default async function FavoritesPage({ params: { locale } }: { params: { locale: string } }) {
  setRequestLocale(locale);
  const properties = await fetchActiveProperties();
  return <FavoritesClient properties={properties} />;
}
