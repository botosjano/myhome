import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import { fetchActiveProperties } from '@/lib/properties';
import { seoAlternates } from '@/lib/seo';
import ListingClient from '@/components/listing/ListingClient';

// Statically generated (no searchParams — filtering is client-side), refreshed on
// demand when a listing changes (admin calls revalidateTag('properties')). The 1h
// revalidate is just a safety net.
export const revalidate = 3600;

export function generateMetadata({ params: { locale } }: { params: { locale: string } }): Metadata {
  return {
    title: locale === 'hu' ? 'Ingatlanok' : 'Properties',
    description:
      locale === 'hu'
        ? 'Diszkrét, off-market luxusingatlanok Budapesten — szűrhető portfólió.'
        : 'Discreet, off-market luxury real estate in Budapest — filterable portfolio.',
    alternates: seoAlternates(locale, '/ingatlanok'),
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
