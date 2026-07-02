import { locales } from '@/i18n';

const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://myhomebudapest.hu';

/**
 * Build `canonical` + hreflang `languages` alternates for a page.
 * `path` is the locale-less path, e.g. '' (home), '/ingatlanok', '/kapcsolat',
 * '/ingatlan/<slug>'. Produces `<link rel="alternate" hreflang="hu|en|x-default">`
 * so Google knows the HU and EN versions are the same page.
 */
export function seoAlternates(locale: string, path: string) {
  const languages: Record<string, string> = { 'x-default': `${BASE}/hu${path}` };
  for (const l of locales) languages[l] = `${BASE}/${l}${path}`;
  return { canonical: `${BASE}/${locale}${path}`, languages };
}
