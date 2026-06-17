// Domain types — mirror the planned Supabase `properties` schema.

export type Currency = 'HUF' | 'EUR';

export type PropertyType = 'lakás' | 'ház' | 'villa' | 'penthouse' | 'telek';

export type PropertyStatus = 'active' | 'hidden' | 'sold';

export type Condition = 'új' | 'felújított' | 'felújítandó';

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
  district: string; // e.g. "II. kerület"
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
  condition: Condition;
  created_at: string; // ISO
}

export interface PropertyFilters {
  type?: PropertyType | '';
  district?: string;
  minPrice?: number;
  maxPrice?: number;
  minSize?: number;
  maxSize?: number;
  rooms?: number;
  reference?: string;
  currency?: Currency;
}
