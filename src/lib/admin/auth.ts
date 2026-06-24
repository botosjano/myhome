'use client';

/**
 * Admin authentication. When Supabase is configured, the password is validated
 * server-side by /api/admin (action 'login'), which returns a token used to
 * authorize every admin write. Without Supabase it falls back to a client-side
 * mock so local dev still works. Swap for Supabase Auth later.
 */

const TOKEN_KEY = 'mh_admin_token';
const ADMIN_EMAIL = 'admin@myhomebudapest.hu';
const ADMIN_PASSWORD = 'myhome2026';
const useApi = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL);

export async function login(email: string, password: string): Promise<boolean> {
  if (!useApi) {
    const ok = email.trim().toLowerCase() === ADMIN_EMAIL && password === ADMIN_PASSWORD;
    if (ok && typeof window !== 'undefined') localStorage.setItem(TOKEN_KEY, `mock.${Date.now()}`);
    return ok;
  }
  try {
    const res = await fetch('/api/admin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'login', email, password }),
    });
    const json = await res.json();
    if (!res.ok || !json.ok || !json.token) return false;
    if (typeof window !== 'undefined') localStorage.setItem(TOKEN_KEY, json.token);
    return true;
  } catch {
    return false;
  }
}

export function logout(): void {
  if (typeof window !== 'undefined') localStorage.removeItem(TOKEN_KEY);
}

export function isAuthed(): boolean {
  if (typeof window === 'undefined') return false;
  return Boolean(localStorage.getItem(TOKEN_KEY));
}

export const DEMO_EMAIL = ADMIN_EMAIL;
