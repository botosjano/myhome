import type {
  EnergyRating,
  HeatingType,
  ListingType,
  Property,
  PropertyType,
  Region,
} from './types';
import { ENERGY_RATINGS, HEATING_OPTIONS } from './districts';
import { EUR_TO_HUF, priceInHuf } from './utils';

export type SortKey = 'newest' | 'priceAsc' | 'priceDesc';
export type ViewMode = 'list' | 'map';

export interface ListingState {
  listingType: ListingType | ''; // '' = both
  region: Region | ''; // '' = everywhere
  city: string; // free-text for vidék (sidebar input)
  cities: string[]; // structured vidék picks (location picker)
  districts: string[];
  types: PropertyType[];
  minPrice: number; // in the active price scale (see priceConfig)
  maxPrice: number;
  minSize: number;
  maxSize: number;
  rooms: number; // 0 = any, otherwise minimum
  yearMin: number | null; // construction year (null = no bound)
  yearMax: number | null;
  heating: HeatingType[];
  energyRatings: EnergyRating[];
  garden: boolean; // true = must have a garden; false = any
  parking: boolean; // true = must have parking; false = any
  reference: string;
  sort: SortKey;
  view: ViewMode;
}

// Price slider scales: sale is in MFt; rent (kiadó) is monthly HUF.
export const SALE_PRICE = { min: 0, max: 1800, step: 10 }; // MFt
export const RENT_PRICE = { min: 0, max: 3_000_000, step: 50_000 }; // HUF / month
export const SIZE_MIN = 0;
export const SIZE_MAX = 1500;

/** Slider bounds for the current transaction type. */
export function priceConfig(listingType: ListingType | '') {
  return listingType === 'kiado' ? RENT_PRICE : SALE_PRICE;
}

/** Convert a slider value to HUF for comparison (rent is already HUF). */
function priceToHuf(value: number, listingType: ListingType | ''): number {
  return listingType === 'kiado' ? value : value * 1_000_000;
}

const VALID_TYPES: PropertyType[] = ['lakás', 'ház', 'villa', 'penthouse', 'telek'];
const VALID_HEATING = HEATING_OPTIONS as readonly string[];
const VALID_ENERGY = ENERGY_RATINGS as readonly string[];

export function defaultState(): ListingState {
  return {
    listingType: '',
    region: '',
    city: '',
    cities: [],
    districts: [],
    types: [],
    minPrice: SALE_PRICE.min,
    maxPrice: SALE_PRICE.max,
    minSize: SIZE_MIN,
    maxSize: SIZE_MAX,
    rooms: 0,
    yearMin: null,
    yearMax: null,
    heating: [],
    energyRatings: [],
    garden: false,
    parking: false,
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
  s.cities = list(get('cities'));

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

  // Price — defaults to the active scale's full range; homepage sends sale
  // values in the selected currency's display unit (MFt, or EUR converted).
  const cfg = priceConfig(s.listingType);
  s.minPrice = cfg.min;
  s.maxPrice = cfg.max;
  const toScale = (v: number) =>
    s.listingType === 'kiado' ? v : currency === 'EUR' ? (v * EUR_TO_HUF) / 1_000_000 : v;
  const minP = num(get('minPrice'));
  const maxP = num(get('maxPrice'));
  if (minP != null) s.minPrice = Math.max(cfg.min, Math.round(toScale(minP)));
  if (maxP != null) s.maxPrice = Math.min(cfg.max, Math.round(toScale(maxP)));

  const minS = num(get('minSize'));
  const maxS = num(get('maxSize'));
  if (minS != null) s.minSize = Math.max(SIZE_MIN, minS);
  if (maxS != null) s.maxSize = Math.min(SIZE_MAX, maxS);

  const rooms = num(get('rooms'));
  if (rooms != null) s.rooms = rooms;

  // Construction year
  const yMin = num(get('yearMin'));
  const yMax = num(get('yearMax'));
  if (yMin != null) s.yearMin = yMin;
  if (yMax != null) s.yearMax = yMax;

  // Heating + energy rating (comma-separated multi-select)
  s.heating = list(get('heating')).filter((h): h is HeatingType => VALID_HEATING.includes(h));
  s.energyRatings = list(get('energy')).filter((e): e is EnergyRating => VALID_ENERGY.includes(e));

  // Garden / parking toggles (presence = required)
  if (get('garden') === '1') s.garden = true;
  if (get('parking') === '1') s.parking = true;

  s.reference = (get('reference') ?? '').trim();

  const sort = get('sort');
  if (sort === 'priceAsc' || sort === 'priceDesc' || sort === 'newest') s.sort = sort;
  if (get('view') === 'map') s.view = 'map';

  return s;
}

/** Serialise state to URL params, omitting defaults to keep URLs clean. */
export function paramsFromState(s: ListingState): URLSearchParams {
  const p = new URLSearchParams();
  const cfg = priceConfig(s.listingType);
  if (s.listingType) p.set('listingType', s.listingType);
  if (s.region) p.set('region', s.region);
  if (s.city) p.set('city', s.city);
  if (s.cities.length) p.set('cities', s.cities.join(','));
  if (s.districts.length) p.set('districts', s.districts.join(','));
  if (s.types.length) p.set('types', s.types.join(','));
  if (s.minPrice > cfg.min) p.set('minPrice', String(s.minPrice));
  if (s.maxPrice < cfg.max) p.set('maxPrice', String(s.maxPrice));
  if (s.minSize > SIZE_MIN) p.set('minSize', String(s.minSize));
  if (s.maxSize < SIZE_MAX) p.set('maxSize', String(s.maxSize));
  if (s.rooms > 0) p.set('rooms', String(s.rooms));
  if (s.yearMin != null) p.set('yearMin', String(s.yearMin));
  if (s.yearMax != null) p.set('yearMax', String(s.yearMax));
  if (s.heating.length) p.set('heating', s.heating.join(','));
  if (s.energyRatings.length) p.set('energy', s.energyRatings.join(','));
  if (s.garden) p.set('garden', '1');
  if (s.parking) p.set('parking', '1');
  if (s.reference) p.set('reference', s.reference);
  if (s.sort !== 'newest') p.set('sort', s.sort);
  if (s.view !== 'list') p.set('view', s.view);
  return p;
}

export function applyState(properties: Property[], s: ListingState): Property[] {
  const minHuf = priceToHuf(s.minPrice, s.listingType);
  const maxHuf = priceToHuf(s.maxPrice, s.listingType);

  const filtered = properties.filter((p) => {
    if (p.status !== 'active') return false;
    if (s.listingType && p.listing_type !== s.listingType) return false;
    if (s.region && p.region !== s.region) return false;
    // Unified location selection — districts (Budapest), cities (curated vidék
    // picks) and the free-text city box are OR-matched. Works region-independent
    // so the homepage picker can mix Budapest + vidék in one query.
    const hasLocation = s.districts.length > 0 || s.cities.length > 0 || Boolean(s.city);
    if (hasLocation) {
      const cityHay = (p.city ?? '').toLowerCase();
      const districtMatch = s.districts.length > 0 && s.districts.includes(p.district);
      const citiesMatch = s.cities.some((c) => cityHay.includes(c.toLowerCase()));
      const freeMatch = s.city
        ? `${p.district} ${p.city ?? ''}`.toLowerCase().includes(s.city.toLowerCase())
        : false;
      if (!(districtMatch || citiesMatch || freeMatch)) return false;
    }
    if (s.types.length && !s.types.includes(p.type)) return false;
    const huf = priceInHuf(p.price, p.currency);
    if (huf < minHuf || huf > maxHuf) return false;
    if (p.size_m2 < s.minSize || p.size_m2 > s.maxSize) return false;
    if (s.rooms > 0 && p.rooms < s.rooms) return false;
    if (s.yearMin != null && (p.year_built == null || p.year_built < s.yearMin)) return false;
    if (s.yearMax != null && (p.year_built == null || p.year_built > s.yearMax)) return false;
    if (s.heating.length && !s.heating.includes(p.heating)) return false;
    if (s.energyRatings.length && !s.energyRatings.includes(p.energy_rating)) return false;
    if (s.garden && !p.garden) return false;
    if (s.parking && !p.parking) return false;
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
  const cfg = priceConfig(s.listingType);
  let n = 0;
  if (s.listingType) n += 1;
  if (s.region) n += 1;
  if (s.city) n += 1;
  if (s.cities.length) n += s.cities.length;
  if (s.districts.length) n += s.districts.length;
  if (s.types.length) n += s.types.length;
  if (s.minPrice > cfg.min || s.maxPrice < cfg.max) n += 1;
  if (s.minSize > SIZE_MIN || s.maxSize < SIZE_MAX) n += 1;
  if (s.rooms > 0) n += 1;
  if (s.yearMin != null || s.yearMax != null) n += 1;
  if (s.heating.length) n += s.heating.length;
  if (s.energyRatings.length) n += s.energyRatings.length;
  if (s.garden) n += 1;
  if (s.parking) n += 1;
  if (s.reference) n += 1;
  return n;
}
