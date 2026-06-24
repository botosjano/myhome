'use client';

import { useState } from 'react';
import { MapPin } from 'lucide-react';
import type { Property } from '@/lib/types';
import { formatPrice } from '@/lib/utils';
import { staticMapStyleParams } from '@/lib/map-style';

const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

// Static Maps standard size cap is 640 per side; scale=2 renders it crisp (retina).
const W = 640;
const H = 360;
const ZOOM = 14;

// Gold teardrop pin with a navy centre — same look as the listing map markers.
function GoldPin() {
  return (
    <svg width="30" height="42" viewBox="0 0 30 42" className="drop-shadow-md">
      <path
        d="M15 0C6.7 0 0 6.7 0 15c0 11.25 15 27 15 27s15-15.75 15-27C30 6.7 23.3 0 15 0z"
        fill="#C9A96E"
        stroke="#0a1628"
        strokeWidth="1.5"
      />
      <circle cx="15" cy="15" r="5.5" fill="#0a1628" />
    </svg>
  );
}

/**
 * Detail-page location map. Shows the "Elhelyezkedés" heading + a button; the
 * dark-navy Maps STATIC image only loads when the user clicks it (so a detail
 * view costs nothing on the Static Maps quota unless the visitor wants the map).
 * Our gold pin + an info card (title + price) are overlaid in HTML over the
 * image centre (= the property location).
 */
export default function PropertyLocationMap({
  property,
  locale,
  heading,
}: {
  property: Property;
  locale: string;
  heading: string;
}) {
  const [shown, setShown] = useState(false);

  // No coordinates → no map section at all.
  if (property.lat == null || property.lng == null) return null;

  const isHu = locale === 'hu';
  const title = isHu ? property.title_hu : property.title_en;
  const price = formatPrice(property.price, property.currency, locale, property.listing_type);
  const buttonLabel = isHu ? 'Megtekintés térképen' : 'View on map';

  const src =
    `https://maps.googleapis.com/maps/api/staticmap?center=${property.lat},${property.lng}` +
    `&zoom=${ZOOM}&size=${W}x${H}&scale=2&maptype=roadmap&${staticMapStyleParams()}&key=${API_KEY}`;

  return (
    <div className="mt-10 print:hidden">
      <h2 className="font-serif text-2xl text-navy">{heading}</h2>
      <div className="gold-rule my-4" />

      {!API_KEY ? (
        // Key not configured → subtle placeholder (production sets it via Vercel env).
        <div className="flex h-48 items-center justify-center rounded-sm border border-navy/10 bg-cream">
          <MapPin className="h-8 w-8 text-gold" />
        </div>
      ) : !shown ? (
        // On-demand: load the static map only when the visitor asks for it.
        <button
          type="button"
          onClick={() => setShown(true)}
          className="flex h-44 w-full flex-col items-center justify-center gap-3 rounded-sm border border-navy/10 bg-cream transition-colors hover:border-gold"
        >
          <MapPin className="h-8 w-8 text-gold" />
          <span className="rounded-sm bg-gold px-5 py-2.5 font-sans text-sm font-semibold uppercase tracking-wide text-navy">
            {buttonLabel}
          </span>
        </button>
      ) : (
        <div className="relative overflow-hidden rounded-sm border border-navy/10">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={src} alt={title} className="block h-auto w-full" width={W} height={H} />

          {/* Card + pin overlaid over the image centre (= the property location). */}
          <div className="pointer-events-none absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-full flex-col items-center">
            <div className="mb-1 max-w-[220px] rounded-sm bg-white px-3 py-2 text-center shadow-luxe">
              <p className="font-serif text-sm font-semibold leading-tight text-navy">{title}</p>
              <p className="mt-0.5 font-sans text-sm font-semibold text-gold-dark">{price}</p>
            </div>
            <GoldPin />
          </div>
        </div>
      )}
    </div>
  );
}
