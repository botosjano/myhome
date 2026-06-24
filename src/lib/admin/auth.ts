'use client';

/**
 * Mock admin authentication (client-side only).
 *
 * For now this uses a hard-coded credential and a localStorage flag. The API is
 * intentionally tiny (login / logout / isAuthed) so it can be swapped for
 * Supabase Auth (or any session backend) later without touching the UI.
 */

const TOKEN_KEY = 'mh_admin_token';

// Demo credentials — replace with Supabase Auth before going live.
const ADMIN_EMAIL = 'admin@myhomebudapest.hu';
const ADMIN_PASSWORD = 'myhome2026';

export function login(email: string, password: string): boolean {
  const ok =
    email.trim().toLowerCase() === ADMIN_EMAIL && password === ADMIN_PASSWORD;
  if (ok && typeof window !== 'undefined') {
    localStorage.setItem(TOKEN_KEY, `mock.${Date.now()}`);
  }
  return ok;
}

export function logout(): void {
  if (typeof window !== 'undefined') localStorage.removeItem(TOKEN_KEY);
}

export function isAuthed(): boolean {
  if (typeof window === 'undefined') return false;
  return Boolean(localStorage.getItem(TOKEN_KEY));
}

export const DEMO_EMAIL = ADMIN_EMAIL;
