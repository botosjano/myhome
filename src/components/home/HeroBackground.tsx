'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';

/**
 * Hero background: a poster image paints instantly (this is the LCP element),
 * and a muted looping video is layered on top — but only on desktop, and only
 * when it won't harm the visitor. On mobile, reduced-motion, or Save-Data the
 * video is never even requested, so the ~1.5 MB download never touches phones.
 */
export default function HeroBackground() {
  const [showVideo, setShowVideo] = useState(false);

  useEffect(() => {
    const wide = window.matchMedia('(min-width: 768px)');
    const decide = () => {
      const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const conn = (navigator as unknown as { connection?: { saveData?: boolean } }).connection;
      setShowVideo(wide.matches && !reduce && !conn?.saveData);
    };
    decide();
    wide.addEventListener('change', decide);
    return () => wide.removeEventListener('change', decide);
  }, []);

  return (
    <div className="absolute inset-0">
      {/* Poster — instant paint, also the sole background on mobile. */}
      <Image
        src="/hero-poster.webp"
        alt="Prémium ingatlan belső tere"
        fill
        priority
        sizes="100vw"
        className="object-cover"
      />

      {showVideo && (
        <video
          className="absolute inset-0 h-full w-full object-cover"
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          poster="/hero-poster.webp"
        >
          <source src="/hero-bg.mp4" type="video/mp4" />
        </video>
      )}
    </div>
  );
}
