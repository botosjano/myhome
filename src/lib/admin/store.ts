'use client';

import type { Inquiry, Property, PropertyStatus } from '../types';
import { MOCK_PROPERTIES } from '../mock-data';

/**
 * Admin data store — mock implementation backed by localStorage, seeded from the
 * mock catalogue on first run. Every method is async and returns plain data, so
 * a Supabase-backed implementation can replace this module 1:1 later.
 */

const PKEY = 'mh_admin_properties_v1';
const IKEY = 'mh_admin_inquiries_v1';

export type PropertyDraft = Omit<Property, 'id'>;

// ── Seed data ──────────────────────────────────────────────────────────────
const SEED_INQUIRIES: Inquiry[] = [
  {
    id: 'q1',
    created_at: '2026-06-17T14:20:00Z',
    name: 'Kovács Andrea',
    email: 'andrea.kovacs@example.com',
    phone: '+36 30 123 4567',
    property_id: 'p1',
    property_ref: 'MH-1042',
    message: 'Érdeklődöm a várnegyedi penthouse iránt, mikor lehetne megtekinteni?',
    read: false,
  },
  {
    id: 'q2',
    created_at: '2026-06-16T09:05:00Z',
    name: 'Nagy Péter',
    email: 'p.nagy@example.com',
    phone: '+36 20 987 6543',
    property_id: 'p2',
    property_ref: 'MH-1043',
    message: 'A rózsadombi villa ára tárgyalható? Készpénzes vevő vagyok.',
    read: false,
  },
  {
    id: 'q3',
    created_at: '2026-06-14T18:42:00Z',
    name: 'Tóth Eszter',
    email: 'eszter.toth@example.com',
    phone: '+36 70 222 3344',
    property_id: 'p11',
    property_ref: 'MH-1052',
    message: 'A tihanyi villát hosszú távra is kiadnák, vagy csak eladó?',
    read: true,
  },
  {
    id: 'q4',
    created_at: '2026-06-12T11:15:00Z',
    name: 'Szabó Gábor',
    email: 'gabor.szabo@example.com',
    phone: '+36 30 555 7788',
    property_id: 'p4',
    property_ref: 'MH-1045',
    message: 'Hegyvidéki házak iránt érdeklődöm, kérek egy visszahívást.',
    read: true,
  },
  {
    id: 'q5',
    created_at: '2026-06-10T08:30:00Z',
    name: 'Horváth Júlia',
    email: 'julia.horvath@example.com',
    phone: '+36 20 444 1122',
    property_id: null,
    property_ref: null,
    message: 'Általános érdeklődés: van-e 200 m² feletti, új építésű lakásuk az V. kerületben?',
    read: true,
  },
];

// ── Low-level helpers ──────────────────────────────────────────────────────
function read<T>(key: string, seed: T[]): T[] {
  if (typeof window === 'undefined') return seed;
  const raw = window.localStorage.getItem(key);
  if (!raw) {
    window.localStorage.setItem(key, JSON.stringify(seed));
    return seed;
  }
  try {
    return JSON.parse(raw) as T[];
  } catch {
    return seed;
  }
}

function write<T>(key: string, list: T[]): void {
  if (typeof window !== 'undefined') window.localStorage.setItem(key, JSON.stringify(list));
}

function genId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.floor(performance.now())}`;
}

// ── Properties ─────────────────────────────────────────────────────────────
export async function listProperties(): Promise<Property[]> {
  return read<Property>(PKEY, MOCK_PROPERTIES);
}

export async function getProperty(id: string): Promise<Property | undefined> {
  return read<Property>(PKEY, MOCK_PROPERTIES).find((p) => p.id === id);
}

export async function createProperty(draft: PropertyDraft): Promise<Property> {
  const list = read<Property>(PKEY, MOCK_PROPERTIES);
  const property: Property = { ...draft, id: genId('p') };
  write(PKEY, [property, ...list]);
  return property;
}

export async function updateProperty(id: string, draft: PropertyDraft): Promise<void> {
  const list = read<Property>(PKEY, MOCK_PROPERTIES).map((p) =>
    p.id === id ? { ...draft, id } : p,
  );
  write(PKEY, list);
}

export async function deleteProperty(id: string): Promise<void> {
  write(
    PKEY,
    read<Property>(PKEY, MOCK_PROPERTIES).filter((p) => p.id !== id),
  );
}

export async function setPropertyStatus(id: string, status: PropertyStatus): Promise<void> {
  write(
    PKEY,
    read<Property>(PKEY, MOCK_PROPERTIES).map((p) => (p.id === id ? { ...p, status } : p)),
  );
}

export async function toggleFeatured(id: string): Promise<void> {
  write(
    PKEY,
    read<Property>(PKEY, MOCK_PROPERTIES).map((p) =>
      p.id === id ? { ...p, featured: !p.featured } : p,
    ),
  );
}

/** Next free reference number (MH-1xxx) based on existing data. */
export async function nextReference(): Promise<string> {
  const max = read<Property>(PKEY, MOCK_PROPERTIES)
    .map((p) => Number(p.reference_number.replace(/\D/g, '')))
    .filter((n) => Number.isFinite(n))
    .reduce((a, b) => Math.max(a, b), 1040);
  return `MH-${max + 1}`;
}

// ── Inquiries ──────────────────────────────────────────────────────────────
export async function listInquiries(): Promise<Inquiry[]> {
  return read<Inquiry>(IKEY, SEED_INQUIRIES).sort(
    (a, b) => +new Date(b.created_at) - +new Date(a.created_at),
  );
}

export async function createInquiry(draft: Omit<Inquiry, 'id' | 'created_at' | 'read'>): Promise<void> {
  const list = read<Inquiry>(IKEY, SEED_INQUIRIES);
  const inquiry: Inquiry = {
    ...draft,
    id: genId('q'),
    created_at: new Date().toISOString(),
    read: false,
  };
  write(IKEY, [inquiry, ...list]);
}

export async function setInquiryRead(id: string, read_: boolean): Promise<void> {
  write(
    IKEY,
    read<Inquiry>(IKEY, SEED_INQUIRIES).map((q) => (q.id === id ? { ...q, read: read_ } : q)),
  );
}

export async function deleteInquiry(id: string): Promise<void> {
  write(
    IKEY,
    read<Inquiry>(IKEY, SEED_INQUIRIES).filter((q) => q.id !== id),
  );
}
