// Domain types — mirror the planned Supabase `properties` schema.

export type Currency = 'HUF' | 'EUR';

export type PropertyType = 'lakás' | 'ház' | 'villa' | 'penthouse' | 'telek';

export type PropertyStatus = 'active' | 'hidden' | 'sold';

export type Condition = 'új' | 'felújított' | 'felújítandó';

// Transaction type: for sale / for rent
export type ListingType = 'elado' | 'kiado';

// Region bucket: Budapest (district-based) vs. countryside (free city/region)
export type Region = 'budapest' | 'videk';

// Heating system
export type HeatingType =
  | 'gaz'
  | 'tavfutes'
  | 'hoszivatyu'
  | 'elektromos'
  | 'kandallo'
  | 'egyeb';

// Energy performance rating
export type EnergyRating = 'AA' | 'A+' | 'A' | 'B' | 'C' | 'D' | 'E';

export interface Property {
  id: string;
  title_hu: string;
  title_en: string;
  description_hu: string;
  description_en: string;
  price: number;
  currency: Currency;
  size_m2: number;
  rooms: number;
  floor: number | null;
  listing_type: ListingType;
  region: Region;
  district: string; // Budapest kerület, e.g. "II. kerület" (empty for vidék)
  city: string | null; // city/region name for vidék, e.g. "Balaton (Tihany)"
  type: PropertyType;
  status: PropertyStatus;
  featured: boolean;
  images: string[];
  video_url: string | null;
  lat: number | null;
  lng: number | null;
  reference_number: string;
  year_built: number | null;
  parking: boolean;
  garden: boolean;
  heating: HeatingType;
  energy_rating: EnergyRating;
  condition: Condition;
  created_at: string; // ISO
}

export interface PropertyFilters {
  type?: PropertyType | '';
  listingType?: ListingType | '';
  region?: Region | '';
  city?: string;
  district?: string;
  minPrice?: number;
  maxPrice?: number;
  minSize?: number;
  maxSize?: number;
  rooms?: number;
  yearMin?: number;
  yearMax?: number;
  heating?: HeatingType[];
  energyRatings?: EnergyRating[];
  garden?: boolean;
  parking?: boolean;
  reference?: string;
  currency?: Currency;
}
