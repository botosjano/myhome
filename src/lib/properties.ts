import { cache } from 'react';
import type { Property } from './types';
import { MOCK_PROPERTIES } from './mock-data';
import { supabase, isSupabaseConfigured } from './supabase';

/**
 * Data-access layer for properties. Reads from Supabase when configured, and
 * falls back to the mock catalogue when Supabase is not set up, errors, or is
 * too slow — so a slow/unreachable DB never hangs a page render.
 *
 * Column names in the `properties` table mirror the Property type 1:1, so rows
 * map directly. `cache()` dedupes calls within a single server render. Pages set
 * `revalidate` so results are CDN-cached and refreshed in the background.
 */

const QUERY_TIMEOUT_MS = 3000;

/** Abort the query if it takes too long, so the page falls back fast instead of hanging. */
async function withTimeout<T>(run: (signal: AbortSignal) => PromiseLike<T>): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), QUERY_TIMEOUT_MS);
  try {
    return await run(controller.signal);
  } finally {
    clearTimeout(timer);
  }
}

/** All active listings, newest first. */
export const fetchActiveProperties = cache(async (): Promise<Property[]> => {
  if (!isSupabaseConfigured || !supabase) return activeMock();
  const db = supabase;
  try {
    const { data, error } = await withTimeout((signal) =>
      db
        .from('properties')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .abortSignal(signal),
    );
    if (error || !data) {
      console.error('[properties] Supabase fetch failed, using mock:', error?.message);
      return activeMock();
    }
    return data as Property[];
  } catch (e) {
    console.error('[properties] Supabase fetch timed out/failed, using mock');
    return activeMock();
  }
});

/** A single listing by the reference embedded in its slug (e.g. "mh-1042-..."). */
export const fetchPropertyBySlug = cache(async (slug: string): Promise<Property | undefined> => {
  const ref = slug.match(/^(mh-\d+)/i)?.[1];
  if (!ref) return undefined;
  if (!isSupabaseConfigured || !supabase) return mockByRef(ref);
  const db = supabase;
  try {
    const { data, error } = await withTimeout((signal) =>
      db
        .from('properties')
        .select('*')
        .ilike('reference_number', ref)
        .limit(1)
        .abortSignal(signal)
        .maybeSingle(),
    );
    if (error) {
      console.error('[properties] Supabase fetch failed, using mock:', error.message);
      return mockByRef(ref);
    }
    return (data as Property | null) ?? undefined;
  } catch (e) {
    console.error('[properties] Supabase fetch timed out/failed, using mock');
    return mockByRef(ref);
  }
});

function activeMock(): Property[] {
  return [...MOCK_PROPERTIES]
    .filter((p) => p.status === 'active')
    .sort((a, b) => +new Date(b.created_at) - +new Date(a.created_at));
}

function mockByRef(ref: string): Property | undefined {
  return MOCK_PROPERTIES.find((p) => p.reference_number.toLowerCase() === ref.toLowerCase());
}
