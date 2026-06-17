import type { ListingType, Property, PropertyType, Region } from './types';
import { EUR_TO_HUF, priceInHuf } from './utils';

export type SortKey = 'newest' | 'priceAsc' | 'priceDesc';
export type ViewMode = 'list' | 'map';

export interface ListingState {
  listingType: ListingType | ''; // '' = both
  region: Region | ''; // '' = everywhere
  city: string; // free-text for vidék
  districts: string[];
  types: PropertyType[];
  minPriceMft: number;
  maxPriceMft: number;
  minSize: number;
  maxSize: number;
  rooms: number; // 0 = any, otherwise minimum
  reference: string;
  sort: SortKey;
  view: ViewMode;
}

// Slider bounds (price scale is MFt; EUR listings are converted for comparison).
export const PRICE_MIN_MFT = 0;
export const PRICE_MAX_MFT = 1800;
export const SIZE_MIN = 0;
export const SIZE_MAX = 1500;

const VALID_TYPES: PropertyType[] = ['lakás', 'ház', 'villa', 'penthouse', 'telek'];

export function defaultState(): ListingState {
  return {
    listingType: '',
    region: '',
    city: '',
    districts: [],
    types: [],
    minPriceMft: PRICE_MIN_MFT,
    maxPriceMft: PRICE_MAX_MFT,
    minSize: SIZE_MIN,
    maxSize: SIZE_MAX,
    rooms: 0,
    reference: '',
    sort: 'newest',
    view: 'list',
  };
}

function num(v: string | null | undefined): number | undefined {
  if (v == null || v === '') return undefined;
  const n = Number(v);
  return Number.isFinite(n) ? n : undefined;
}

function list(v: string | null | undefined): string[] {
  return v ? v.split(',').map((s) => s.trim()).filter(Boolean) : [];
}

/** Build listing state from URL search params (incl. the homepage search box). */
export function stateFromParams(get: (k: string) => string | null): ListingState {
  const s = defaultState();
  const currency = get('currency') === 'EUR' ? 'EUR' : 'HUF';

  // Transaction type
  const lt = get('listingType');
  if (lt === 'elado' || lt === 'kiado') s.listingType = lt;

  // Region + free-text city (vidék)
  const region = get('region');
  if (region === 'budapest' || region === 'videk') s.region = region;
  s.city = (get('city') ?? '').trim();

  // Districts: multi (`districts`) or the homepage single `district`.
  s.districts = list(get('districts'));
  const singleDistrict = get('district');
  if (singleDistrict && !s.districts.includes(singleDistrict)) s.districts.push(singleDistrict);

  // Types: multi or homepage single `type`.
  s.types = list(get('types')).filter((t): t is PropertyType => VALID_TYPES.includes(t as PropertyType));
  const singleType = get('type');
  if (singleType && VALID_TYPES.includes(singleType as PropertyType) && !s.types.includes(singleType as PropertyType)) {
    s.types.push(singleType as PropertyType);
  }

  // Price — homepage sends the value in the selected currency's display unit.
  const toMft = (v: number) => (currency === 'EUR' ? (v * EUR_TO_HUF) / 1_000_000 : v);
  const minP = num(get('minPrice'));
  const maxP = num(get('maxPrice'));
  if (minP != null) s.minPriceMft = Math.max(PRICE_MIN_MFT, Math.round(toMft(minP)));
  if (maxP != null) s.maxPriceMft = Math.min(PRICE_MAX_MFT, Math.round(toMft(maxP)));

  const minS = num(get('minSize'));
  const maxS = num(get('maxSize'));
  if (minS != null) s.minSize = Math.max(SIZE_MIN, minS);
  if (maxS != null) s.maxSize = Math.min(SIZE_MAX, maxS);

  const rooms = num(get('rooms'));
  if (rooms != null) s.rooms = rooms;

  s.reference = (get('reference') ?? '').trim();

  const sort = get('sort');
  if (sort === 'priceAsc' || sort === 'priceDesc' || sort === 'newest') s.sort = sort;
  if (get('view') === 'map') s.view = 'map';

  return s;
}

/** Serialise state to URL params, omitting defaults to keep URLs clean. */
export function paramsFromState(s: ListingState): URLSearchParams {
  const p = new URLSearchParams();
  if (s.listingType) p.set('listingType', s.listingType);
  if (s.region) p.set('region', s.region);
  if (s.city) p.set('city', s.city);
  if (s.districts.length) p.set('districts', s.districts.join(','));
  if (s.types.length) p.set('types', s.types.join(','));
  if (s.minPriceMft > PRICE_MIN_MFT) p.set('minPrice', String(s.minPriceMft));
  if (s.maxPriceMft < PRICE_MAX_MFT) p.set('maxPrice', String(s.maxPriceMft));
  if (s.minSize > SIZE_MIN) p.set('minSize', String(s.minSize));
  if (s.maxSize < SIZE_MAX) p.set('maxSize', String(s.maxSize));
  if (s.rooms > 0) p.set('rooms', String(s.rooms));
  if (s.reference) p.set('reference', s.reference);
  if (s.sort !== 'newest') p.set('sort', s.sort);
  if (s.view !== 'list') p.set('view', s.view);
  return p;
}

export function applyState(properties: Property[], s: ListingState): Property[] {
  const minHuf = s.minPriceMft * 1_000_000;
  const maxHuf = s.maxPriceMft * 1_000_000;

  const filtered = properties.filter((p) => {
    if (p.status !== 'active') return false;
    if (s.listingType && p.listing_type !== s.listingType) return false;
    if (s.region && p.region !== s.region) return false;
    if (s.region === 'videk' && s.city && !(p.city ?? '').toLowerCase().includes(s.city.toLowerCase()))
      return false;
    // District filter applies only to Budapest listings.
    if (s.region !== 'videk' && s.districts.length && !s.districts.includes(p.district)) return false;
    if (s.types.length && !s.types.includes(p.type)) return false;
    const huf = priceInHuf(p.price, p.currency);
    if (huf < minHuf || huf > maxHuf) return false;
    if (p.size_m2 < s.minSize || p.size_m2 > s.maxSize) return false;
    if (s.rooms > 0 && p.rooms < s.rooms) return false;
    if (s.reference && !p.reference_number.toLowerCase().includes(s.reference.toLowerCase())) return false;
    return true;
  });

  return filtered.sort((a, b) => {
    if (s.sort === 'priceAsc') return priceInHuf(a.price, a.currency) - priceInHuf(b.price, b.currency);
    if (s.sort === 'priceDesc') return priceInHuf(b.price, b.currency) - priceInHuf(a.price, a.currency);
    return +new Date(b.created_at) - +new Date(a.created_at);
  });
}

export function activeFilterCount(s: ListingState): number {
  let n = 0;
  if (s.listingType) n += 1;
  if (s.region) n += 1;
  if (s.city) n += 1;
  if (s.region !== 'videk' && s.districts.length) n += s.districts.length;
  if (s.types.length) n += s.types.length;
  if (s.minPriceMft > PRICE_MIN_MFT || s.maxPriceMft < PRICE_MAX_MFT) n += 1;
  if (s.minSize > SIZE_MIN || s.maxSize < SIZE_MAX) n += 1;
  if (s.rooms > 0) n += 1;
  if (s.reference) n += 1;
  return n;
}
