import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import { stateFromParams } from '@/lib/listing';
import { fetchActiveProperties } from '@/lib/properties';
import ListingClient from '@/components/listing/ListingClient';

type SearchParams = { [key: string]: string | string[] | undefined };

// CDN-cache the page; refresh property data in the background every 60s.
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
  searchParams,
}: {
  params: { locale: string };
  searchParams: SearchParams;
}) {
  setRequestLocale(locale);

  const get = (k: string): string | null => {
    const v = searchParams[k];
    if (typeof v === 'string') return v;
    if (Array.isArray(v)) return v[0] ?? null;
    return null;
  };

  const initialState = stateFromParams(get);
  const properties = await fetchActiveProperties();

  return <ListingClient initialState={initialState} properties={properties} />;
}
