'use client';

import type { Property, PropertyStatus } from '../types';
import { MOCK_PROPERTIES } from '../mock-data';

/**
 * Admin data store. When Supabase is configured it calls the server-side
 * /api/admin RPC (which writes with the secret key); otherwise it falls back to
 * a localStorage mock so local dev without keys still works. Same async API
 * either way, so the UI is unchanged.
 *
 * Leads/inquiries are NOT handled here — they go straight to the GoHighLevel CRM
 * via the Cloudflare Worker (see src/lib/lead.ts).
 */

const PKEY = 'mh_admin_properties_v1';
const TOKEN_KEY = 'mh_admin_token';
const useApi = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL);

export type PropertyDraft = Omit<Property, 'id'>;

// ── Supabase-backed RPC ──────────────────────────────────────────────────────
async function rpc<T>(action: string, payload: Record<string, unknown> = {}): Promise<T> {
  const token = typeof window !== 'undefined' ? localStorage.getItem(TOKEN_KEY) : null;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 30_000);
  let res: Response;
  try {
    res = await fetch('/api/admin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, token, ...payload }),
      signal: controller.signal,
    });
  } catch {
    throw new Error('A kérés elakadt vagy hálózati hiba történt (időtúllépés).');
  } finally {
    clearTimeout(timer);
  }
  const json = await res.json();
  if (!res.ok || !json.ok) throw new Error(json.error ?? 'admin request failed');
  return json.data as T;
}

// ── localStorage fallback helpers ────────────────────────────────────────────
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

// ── Properties ───────────────────────────────────────────────────────────────
export async function listProperties(): Promise<Property[]> {
  if (useApi) return (await rpc<Property[]>('listProperties')) ?? [];
  return read<Property>(PKEY, MOCK_PROPERTIES);
}

export async function getProperty(id: string): Promise<Property | undefined> {
  if (useApi) return (await rpc<Property | null>('getProperty', { id })) ?? undefined;
  return read<Property>(PKEY, MOCK_PROPERTIES).find((p) => p.id === id);
}

export async function createProperty(draft: PropertyDraft): Promise<Property> {
  if (useApi) return rpc<Property>('createProperty', { draft });
  const list = read<Property>(PKEY, MOCK_PROPERTIES);
  const property: Property = { ...draft, id: genId('p') };
  write(PKEY, [property, ...list]);
  return property;
}

export async function updateProperty(id: string, draft: PropertyDraft): Promise<void> {
  if (useApi) {
    await rpc('updateProperty', { id, draft });
    return;
  }
  write(
    PKEY,
    read<Property>(PKEY, MOCK_PROPERTIES).map((p) => (p.id === id ? { ...draft, id } : p)),
  );
}

export async function deleteProperty(id: string): Promise<void> {
  if (useApi) {
    await rpc('deleteProperty', { id });
    return;
  }
  write(
    PKEY,
    read<Property>(PKEY, MOCK_PROPERTIES).filter((p) => p.id !== id),
  );
}

export async function setPropertyStatus(id: string, status: PropertyStatus): Promise<void> {
  if (useApi) {
    await rpc('setPropertyStatus', { id, status });
    return;
  }
  write(
    PKEY,
    read<Property>(PKEY, MOCK_PROPERTIES).map((p) => (p.id === id ? { ...p, status } : p)),
  );
}

export async function toggleFeatured(id: string): Promise<void> {
  if (useApi) {
    await rpc('toggleFeatured', { id });
    return;
  }
  write(
    PKEY,
    read<Property>(PKEY, MOCK_PROPERTIES).map((p) =>
      p.id === id ? { ...p, featured: !p.featured } : p,
    ),
  );
}

/** Next free reference number (MH-1xxx) based on existing data. */
export async function nextReference(): Promise<string> {
  if (useApi) return rpc<string>('nextReference');
  const max = read<Property>(PKEY, MOCK_PROPERTIES)
    .map((p) => Number(p.reference_number.replace(/\D/g, '')))
    .filter((n) => Number.isFinite(n))
    .reduce((a, b) => Math.max(a, b), 1040);
  return `MH-${max + 1}`;
}
