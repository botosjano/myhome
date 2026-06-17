'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Gallery({ images, alt }: { images: string[]; alt: string }) {
  const [active, setActive] = useState(0);
  const [lightbox, setLightbox] = useState(false);
  const touchX = useRef<number | null>(null);

  const count = images.length;
  const go = useCallback(
    (dir: number) => setActive((i) => (i + dir + count) % count),
    [count],
  );

  // Keyboard navigation while the lightbox is open.
  useEffect(() => {
    if (!lightbox) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') go(1);
      else if (e.key === 'ArrowLeft') go(-1);
      else if (e.key === 'Escape') setLightbox(false);
    };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [lightbox, go]);

  const onTouchStart = (e: React.TouchEvent) => {
    touchX.current = e.touches[0].clientX;
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchX.current == null) return;
    const dx = e.changedTouches[0].clientX - touchX.current;
    if (Math.abs(dx) > 40) go(dx < 0 ? 1 : -1);
    touchX.current = null;
  };

  if (count === 0) return null;

  return (
    <>
      {/* Main image */}
      <div className="relative">
        <button
          type="button"
          onClick={() => setLightbox(true)}
          className="group relative block aspect-[16/9] w-full overflow-hidden rounded-sm bg-navy"
          aria-label="Open gallery"
        >
          <Image
            src={images[active]}
            alt={alt}
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 66vw"
            className="object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <span className="absolute bottom-3 right-3 rounded-sm bg-navy/70 px-2.5 py-1 font-sans text-xs text-white backdrop-blur">
            {active + 1} / {count}
          </span>
        </button>

        {count > 1 && (
          <>
            <GalleryArrow side="left" onClick={() => go(-1)} />
            <GalleryArrow side="right" onClick={() => go(1)} />
          </>
        )}
      </div>

      {/* Thumbnails */}
      {count > 1 && (
        <div className="mt-3 grid grid-cols-5 gap-2 sm:grid-cols-6">
          {images.map((src, i) => (
            <button
              key={src + i}
              type="button"
              onClick={() => setActive(i)}
              className={cn(
                'relative aspect-square overflow-hidden rounded-sm',
                i === active ? 'ring-2 ring-gold' : 'opacity-70 hover:opacity-100',
              )}
            >
              <Image src={src} alt={`${alt} ${i + 1}`} fill sizes="120px" className="object-cover" />
            </button>
          ))}
        </div>
      )}

      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 z-[80] flex items-center justify-center bg-navy/95"
          onClick={() => setLightbox(false)}
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
        >
          <button
            type="button"
            className="absolute right-5 top-5 text-white/80 transition-colors hover:text-gold"
            aria-label="Close"
            onClick={() => setLightbox(false)}
          >
            <X className="h-8 w-8" />
          </button>

          <div className="relative h-[80vh] w-[92vw] max-w-6xl" onClick={(e) => e.stopPropagation()}>
            <Image src={images[active]} alt={alt} fill sizes="92vw" className="object-contain" />
          </div>

          <span className="absolute bottom-6 left-1/2 -translate-x-1/2 rounded-sm bg-white/10 px-3 py-1 font-sans text-sm text-white">
            {active + 1} / {count}
          </span>

          {count > 1 && (
            <>
              <GalleryArrow side="left" light onClick={(e) => { e.stopPropagation(); go(-1); }} />
              <GalleryArrow side="right" light onClick={(e) => { e.stopPropagation(); go(1); }} />
            </>
          )}
        </div>
      )}
    </>
  );
}

function GalleryArrow({
  side,
  light = false,
  onClick,
}: {
  side: 'left' | 'right';
  light?: boolean;
  onClick: (e: React.MouseEvent) => void;
}) {
  const Icon = side === 'left' ? ChevronLeft : ChevronRight;
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={side === 'left' ? 'Previous' : 'Next'}
      className={cn(
        'absolute top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full transition-colors',
        side === 'left' ? 'left-3' : 'right-3',
        light
          ? 'bg-white/10 text-white hover:bg-white/20'
          : 'bg-navy/60 text-white backdrop-blur hover:bg-navy/80',
      )}
    >
      <Icon className="h-6 w-6" />
    </button>
  );
}
