import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import { fetchActiveProperties } from '@/lib/properties';
import ListingClient from '@/components/listing/ListingClient';

// CDN-cache the page; refresh property data in the background every 60s.
// No searchParams here on purpose — filtering is client-side, so this page stays
// statically generated (instant from CDN) instead of rendering per request.
export const revalidate = 60;

export function generateMetadata({ params: { locale } }: { params: { locale: string } }): Metadata {
  return {
    title: locale === 'hu' ? 'Ingatlanok' : 'Properties',
    description:
      locale === 'hu'
        ? 'Diszkrét, off-market luxusingatlanok Budapesten — szűrhető portfólió.'
        : 'Discreet, off-market luxury real estate in Budapest — filterable portfolio.',
  };
}

export default async function PropertiesPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  setRequestLocale(locale);
  const properties = await fetchActiveProperties();

  return <ListingClient properties={properties} />;
}
