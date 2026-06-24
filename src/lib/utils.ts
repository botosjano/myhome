import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { LAND_TYPES } from './districts';
import type { Currency, ListingType, Property, PropertyType } from './types';

/** Land-like types (plot, development site) have no rooms/floor. */
export function isLand(type: PropertyType): boolean {
  return (LAND_TYPES as readonly string[]).includes(type);
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format a price. Sale prices show as MFt (HUF) or €. Rent prices (listingType
 * = 'kiado') show the full monthly amount with a "/hó" (HU) or "/mo" (EN) suffix.
 */
export function formatPrice(
  price: number,
  currency: Currency,
  locale: string,
  listingType?: ListingType,
): string {
  const loc = locale === 'hu' ? 'hu-HU' : 'en-US';

  if (listingType === 'kiado') {
    const perMonth = locale === 'hu' ? ' / hó' : ' / mo';
    const amount =
      currency === 'HUF'
        ? `${new Intl.NumberFormat(loc).format(price)} Ft`
        : new Intl.NumberFormat(loc, { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(price);
    return `${amount}${perMonth}`;
  }

  if (currency === 'HUF') {
    const mft = price / 1_000_000;
    const num = new Intl.NumberFormat(loc, {
      maximumFractionDigits: mft % 1 === 0 ? 0 : 1,
    }).format(mft);
    return `${num} MFt`;
  }
  return new Intl.NumberFormat(loc, {
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

/** Card/detail location label: Budapest district, or city/region for vidék. */
export function locationLabel(
  p: Pick<Property, 'region' | 'district' | 'city'>,
): string {
  return p.region === 'videk' ? (p.city ?? '') : p.district;
}

/** Build the SEO-friendly detail URL slug: [reference]-[location]-[type]. */
export function propertySlug(
  p: Pick<Property, 'reference_number' | 'district' | 'type' | 'region' | 'city'>,
): string {
  const loc = locationLabel(p)
    .replace(/[().]/g, '')
    .replace(/\s+/g, '-')
    .toLowerCase();
  return `${p.reference_number}-${loc}-${p.type}`
    .replace(/[().]/g, '')
    .replace(/\s+/g, '-')
    .toLowerCase();
}

export function localizedType(type: PropertyType, locale: string): string {
  const en: Record<PropertyType, string> = {
    lakás: 'apartment',
    ház: 'house',
    villa: 'villa',
    penthouse: 'penthouse',
    telek: 'plot',
    nyaraló: 'holiday home',
    iroda: 'office',
    üzlethelyiség: 'retail unit',
    'fejlesztési terület': 'development site',
  };
  return locale === 'hu' ? type : en[type];
}
