'use client';

import { useCallback, useEffect, useState } from 'react';

const KEY = 'mhb:favorites';
const EVENT = 'mhb:favorites-changed';

function read(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(window.localStorage.getItem(KEY) ?? '[]');
  } catch {
    return [];
  }
}

/**
 * localStorage-backed favorites — no registration required, persists across
 * sessions. Syncs across components in the same tab via a custom event and
 * across tabs via the native `storage` event.
 */
export function useFavorites() {
  const [ids, setIds] = useState<string[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setIds(read());
    setReady(true);
    const sync = () => setIds(read());
    window.addEventListener(EVENT, sync);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener(EVENT, sync);
      window.removeEventListener('storage', sync);
    };
  }, []);

  const toggle = useCallback((id: string) => {
    const current = read();
    const next = current.includes(id)
      ? current.filter((x) => x !== id)
      : [...current, id];
    window.localStorage.setItem(KEY, JSON.stringify(next));
    window.dispatchEvent(new Event(EVENT));
  }, []);

  const isFavorite = useCallback((id: string) => ids.includes(id), [ids]);

  return { ids, toggle, isFavorite, ready, count: ids.length };
}
