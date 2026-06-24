import { createClient } from '@supabase/supabase-js';

/**
 * Shared Supabase client (public, anon/publishable key — safe in the browser).
 * Used for public reads (RLS allows reading active properties + inserting
 * inquiries). Admin writes will go through a server route with the secret key.
 *
 * If the env vars are not set the client is null, and the data-access layer
 * falls back to the mock catalogue so the site keeps working.
 */
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(url && anonKey);

export const supabase = isSupabaseConfigured
  ? createClient(url as string, anonKey as string, {
      auth: { persistSession: false },
      // Bypass Next.js fetch caching so reads always reflect the latest DB state
      // (admin changes appear immediately; also opts the pages into dynamic rendering).
      global: { fetch: (input, init) => fetch(input, { ...init, cache: 'no-store' }) },
    })
  : null;
