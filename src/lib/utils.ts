import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { Currency, Property, PropertyType } from './types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Format a price in HUF (as MFt) or EUR with locale-aware grouping. */
export function formatPrice(price: number, currency: Currency, locale: string): string {
  if (currency === 'HUF') {
    const mft = price / 1_000_000;
    const num = new Intl.NumberFormat(locale === 'hu' ? 'hu-HU' : 'en-US', {
      maximumFractionDigits: mft % 1 === 0 ? 0 : 1,
    }).format(mft);
    return `${num} MFt`;
  }
  return new Intl.NumberFormat(locale === 'hu' ? 'hu-HU' : 'en-US', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0,
  }).format(price);
}

/**
 * Approximate FX rate used ONLY for the mock phase so that mixed-currency
 * listings can be filtered/sorted on a single price scale. Replace with a live
 * rate (or store everything in one base currency) once the backend is wired.
 */
export const EUR_TO_HUF = 400;

/** Normalise any listing's price to HUF for cross-currency compare/sort. */
export function priceInHuf(price: number, currency: Currency): number {
  return currency === 'EUR' ? price * EUR_TO_HUF : price;
}

export function formatSize(size: number, locale: string): string {
  return `${new Intl.NumberFormat(locale === 'hu' ? 'hu-HU' : 'en-US').format(size)} m²`;
}

/** Build the SEO-friendly detail URL slug: [reference]-[district]-[type]. */
export function propertySlug(p: Pick<Property, 'reference_number' | 'district' | 'type'>): string {
  const district = p.district.replace(/\.\s*/g, '').replace(/\s+/g, '-').toLowerCase();
  return `${p.reference_number}-${district}-${p.type}`.toLowerCase();
}

export function localizedType(type: PropertyType, locale: string): string {
  const en: Record<PropertyType, string> = {
    lakás: 'apartment',
    ház: 'house',
    villa: 'villa',
    penthouse: 'penthouse',
    telek: 'plot',
  };
  return locale === 'hu' ? type : en[type];
}
