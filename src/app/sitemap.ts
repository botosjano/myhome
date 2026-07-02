import type { MetadataRoute } from 'next';
import { locales } from '@/i18n';
import { fetchActiveProperties } from '@/lib/properties';
import { propertySlug } from '@/lib/utils';

const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://myhomebudapest.hu';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Real, active listings from Supabase (falls back to mock if unconfigured).
  const properties = await fetchActiveProperties();
  const entries: MetadataRoute.Sitemap = [];

  for (const locale of locales) {
    entries.push(
      { url: `${BASE}/${locale}`, changeFrequency: 'weekly', priority: 1 },
      { url: `${BASE}/${locale}/ingatlanok`, changeFrequency: 'daily', priority: 0.9 },
      { url: `${BASE}/${locale}/kapcsolat`, changeFrequency: 'monthly', priority: 0.5 },
      {
        url: `${BASE}/${locale}/${locale === 'hu' ? 'adatkezeles' : 'privacy-policy'}`,
        changeFrequency: 'yearly',
        priority: 0.2,
      },
    );

    for (const p of properties) {
      entries.push({
        url: `${BASE}/${locale}/ingatlan/${propertySlug(p)}`,
        lastModified: new Date(p.created_at),
        changeFrequency: 'weekly',
        priority: 0.8,
      });
    }
  }

  return entries;
}
