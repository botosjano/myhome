import { createClient } from '@supabase/supabase-js';

/**
 * SERVER-ONLY Supabase client using the secret (service_role) key. It bypasses
 * RLS, so it must NEVER be imported into client code or exposed to the browser.
 * Used exclusively by the /api/admin route for admin reads/writes.
 */
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const secret = process.env.SUPABASE_SERVICE_ROLE_KEY;

export const supabaseAdmin =
  url && secret
    ? createClient(url, secret, {
        auth: { persistSession: false },
        // Admin always needs the latest data — never serve a cached response.
        global: { fetch: (input, init) => fetch(input, { ...init, cache: 'no-store' }) },
      })
    : null;
