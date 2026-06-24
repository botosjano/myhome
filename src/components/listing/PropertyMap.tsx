'use client';

import { useEffect, useRef, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { MapPin } from 'lucide-react';
import type { Property } from '@/lib/types';
import { formatPrice, propertySlug } from '@/lib/utils';

const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

// Dark navy map theme matching the site design.
const MAP_STYLE = [
  { elementType: 'geometry', stylers: [{ color: '#0a1628' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#0a1628' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#8896ab' }] },
  { featureType: 'poi', stylers: [{ visibility: 'off' }] },
  { featureType: 'transit', stylers: [{ visibility: 'off' }] },
  { featureType: 'administrative.land_parcel', stylers: [{ visibility: 'off' }] },
  { featureType: 'administrative', elementType: 'geometry', stylers: [{ color: '#2a3a52' }] },
  { featureType: 'administrative.locality', elementType: 'labels.text.fill', stylers: [{ color: '#C9A96E' }] },
  { featureType: 'landscape', elementType: 'geometry', stylers: [{ color: '#0d1a2e' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#1b2942' }] },
  { featureType: 'road', elementType: 'labels.text.fill', stylers: [{ color: '#6b7a93' }] },
  { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#33455f' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#060f1d' }] },
  { featureType: 'water', elementType: 'labels.text.fill', stylers: [{ color: '#3d4d66' }] },
];

// Gold teardrop pin with a navy centre — built as an inline SVG icon.
const PIN_SVG =
  '<svg xmlns="http://www.w3.org/2000/svg" width="30" height="42" viewBox="0 0 30 42">' +
  '<path d="M15 0C6.7 0 0 6.7 0 15c0 11.25 15 27 15 27s15-15.75 15-27C30 6.7 23.3 0 15 0z" ' +
  'fill="#C9A96E" stroke="#0a1628" stroke-width="1.5"/>' +
  '<circle cx="15" cy="15" r="5.5" fill="#0a1628"/></svg>';

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

  useEffect(() => {
    if (!API_KEY || !ref.current) return;
    let cancelled = false;

    // Skip properties without coordinates.
    const pins = properties.filter((p) => p.lat != null && p.lng != null);

    loadMaps()
      .then(() => {
        if (cancelled || !ref.current) return;
        const g = (window as any).google;
        const map = new g.maps.Map(ref.current, {
          center: { lat: 47.4979, lng: 19.0402 },
          zoom: 12,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
          styles: MAP_STYLE,
        });
        const icon = {
          url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(PIN_SVG)}`,
          scaledSize: new g.maps.Size(30, 42),
          anchor: new g.maps.Point(15, 42),
        };
        const bounds = new g.maps.LatLngBounds();
        const info = new g.maps.InfoWindow();
        const viewLabel = locale === 'hu' ? 'Megtekintés' : 'View';

        pins.forEach((p) => {
          const pos = { lat: p.lat, lng: p.lng };
          bounds.extend(pos);
          const title = locale === 'hu' ? p.title_hu : p.title_en;
          const marker = new g.maps.Marker({ position: pos, map, icon, title });
          marker.addListener('click', () => {
            const href = `/${locale}/ingatlan/${propertySlug(p)}`;
            info.setContent(
              `<div style="font-family:Georgia,'Times New Roman',serif;max-width:220px;padding:2px 4px 4px">
                 <strong style="color:#0a1628;font-size:14px;line-height:1.3;display:block">${title}</strong>
                 <span style="color:#a98a52;font-weight:600;display:block;margin:4px 0">${formatPrice(p.price, p.currency, locale, p.listing_type)}</span>
                 <a href="${href}" style="color:#0a1628;font-weight:600;text-decoration:none;border-bottom:1px solid #C9A96E">${viewLabel} →</a>
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
  }, [properties, locale]);

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

  return <div ref={ref} className="min-h-[60vh] w-full overflow-hidden rounded-sm" />;
}
