'use client';

import { useEffect, useRef, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { MapPin } from 'lucide-react';
import type { Property } from '@/lib/types';
import { formatPrice, propertySlug } from '@/lib/utils';

const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

// Load the Maps JS API exactly once, shared across mounts.
let mapsPromise: Promise<void> | null = null;
function loadMaps(): Promise<void> {
  if (typeof window === 'undefined') return Promise.reject();
  if ((window as any).google?.maps) return Promise.resolve();
  if (mapsPromise) return mapsPromise;
  mapsPromise = new Promise<void>((resolve, reject) => {
    const s = document.createElement('script');
    s.src = `https://maps.googleapis.com/maps/api/js?key=${API_KEY}&v=weekly`;
    s.async = true;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error('Google Maps failed to load'));
    document.head.appendChild(s);
  });
  return mapsPromise;
}

export default function PropertyMap({ properties }: { properties: Property[] }) {
  const t = useTranslations('listing');
  const locale = useLocale();
  const ref = useRef<HTMLDivElement>(null);
  const [error, setError] = useState(false);

  const pins = properties.filter((p) => p.lat != null && p.lng != null);

  useEffect(() => {
    if (!API_KEY || !ref.current) return;
    let cancelled = false;

    loadMaps()
      .then(() => {
        if (cancelled || !ref.current) return;
        const g = (window as any).google;
        const map = new g.maps.Map(ref.current, {
          center: { lat: 47.4979, lng: 19.0402 },
          zoom: 12,
          mapTypeControl: false,
          streetViewControl: false,
          styles: [{ featureType: 'poi', stylers: [{ visibility: 'off' }] }],
        });
        const bounds = new g.maps.LatLngBounds();
        const info = new g.maps.InfoWindow();

        pins.forEach((p) => {
          const pos = { lat: p.lat, lng: p.lng };
          bounds.extend(pos);
          const marker = new g.maps.Marker({
            position: pos,
            map,
            title: locale === 'hu' ? p.title_hu : p.title_en,
          });
          marker.addListener('click', () => {
            const title = locale === 'hu' ? p.title_hu : p.title_en;
            const href = `/${locale}/ingatlan/${propertySlug(p)}`;
            info.setContent(
              `<div style="font-family:sans-serif;max-width:200px">
                 <strong style="color:#0a1628">${title}</strong><br/>
                 <span style="color:#a98a52">${formatPrice(p.price, p.currency, locale)}</span><br/>
                 <a href="${href}" style="color:#c9a96e">${p.reference_number}</a>
               </div>`,
            );
            info.open(map, marker);
          });
        });

        if (pins.length) map.fitBounds(bounds);
      })
      .catch(() => !cancelled && setError(true));

    return () => {
      cancelled = true;
    };
  }, [pins, locale]);

  // No key configured yet → elegant placeholder.
  if (!API_KEY || error) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center rounded-sm border border-navy/10 bg-cream text-center">
        <MapPin className="mb-4 h-10 w-10 text-gold" />
        <h3 className="font-serif text-xl text-navy">{t('mapPlaceholderTitle')}</h3>
        <p className="mt-2 max-w-sm px-6 font-sans text-sm text-navy/60">{t('mapPlaceholderBody')}</p>
      </div>
    );
  }

  return <div ref={ref} className="min-h-[60vh] w-full rounded-sm" />;
}
