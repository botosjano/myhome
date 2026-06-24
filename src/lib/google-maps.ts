'use client';

/**
 * Loads the Google Maps JavaScript API exactly once and resolves with the
 * `google` global. Shared by the listing map and the admin geocoder so the
 * script is only ever injected a single time.
 */
const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

let mapsPromise: Promise<any> | null = null;

export function loadGoogleMaps(): Promise<any> {
  if (typeof window === 'undefined') return Promise.reject(new Error('No window'));
  const w = window as any;
  if (w.google?.maps) return Promise.resolve(w.google);
  if (mapsPromise) return mapsPromise;
  mapsPromise = new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = `https://maps.googleapis.com/maps/api/js?key=${API_KEY}&v=weekly`;
    s.async = true;
    s.onload = () => resolve((window as any).google);
    s.onerror = () => reject(new Error('Google Maps failed to load'));
    document.head.appendChild(s);
  });
  return mapsPromise;
}
