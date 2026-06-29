import type { MetadataRoute } from 'next';
import { locales } from '@/i18n';
import { MOCK_PROPERTIES } from '@/lib/mock-data';
import { propertySlug } from '@/lib/utils';

const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://myhomebudapest.hu';

export default function sitemap(): MetadataRoute.Sitemap {
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

    for (const p of MOCK_PROPERTIES) {
      if (p.status !== 'active') continue;
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
