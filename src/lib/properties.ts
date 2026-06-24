import { cache } from 'react';
import type { Property } from './types';
import { MOCK_PROPERTIES } from './mock-data';
import { supabase, isSupabaseConfigured } from './supabase';

/**
 * Data-access layer for properties. Reads from Supabase when configured, and
 * falls back to the mock catalogue when Supabase is not set up or a query fails,
 * so the site never breaks during the migration.
 *
 * Column names in the `properties` table mirror the Property type 1:1, so rows
 * map directly. `cache()` dedupes calls within a single server render.
 */

/** All active listings, newest first. */
export const fetchActiveProperties = cache(async (): Promise<Property[]> => {
  if (!isSupabaseConfigured || !supabase) return activeMock();
  const { data, error } = await supabase
    .from('properties')
    .select('*')
    .eq('status', 'active')
    .order('created_at', { ascending: false });
  if (error || !data) {
    console.error('[properties] Supabase fetch failed, using mock:', error?.message);
    return activeMock();
  }
  return data as Property[];
});

/** A single listing by the reference embedded in its slug (e.g. "mh-1042-..."). */
export const fetchPropertyBySlug = cache(async (slug: string): Promise<Property | undefined> => {
  const ref = slug.match(/^(mh-\d+)/i)?.[1];
  if (!ref) return undefined;
  if (!isSupabaseConfigured || !supabase) return mockByRef(ref);
  const { data, error } = await supabase
    .from('properties')
    .select('*')
    .ilike('reference_number', ref)
    .limit(1)
    .maybeSingle();
  if (error) {
    console.error('[properties] Supabase fetch failed, using mock:', error.message);
    return mockByRef(ref);
  }
  return (data as Property | null) ?? undefined;
});

function activeMock(): Property[] {
  return [...MOCK_PROPERTIES]
    .filter((p) => p.status === 'active')
    .sort((a, b) => +new Date(b.created_at) - +new Date(a.created_at));
}

function mockByRef(ref: string): Property | undefined {
  return MOCK_PROPERTIES.find((p) => p.reference_number.toLowerCase() === ref.toLowerCase());
}
