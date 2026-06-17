'use client';

import { useEffect, useState } from 'react';
import { ArrowUp } from 'lucide-react';
import { cn } from '@/lib/utils';

const RADIUS = 25;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export default function ScrollToTopButton() {
  const [progress, setProgress] = useState(0); // 0–100
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      const scrollY = window.scrollY;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const pct = max > 0 ? (scrollY / max) * 100 : 0;
      setProgress(Math.min(100, Math.max(0, pct)));
      setVisible(scrollY > 100);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  const offset = CIRCUMFERENCE * (1 - progress / 100);

  return (
    <button
      type="button"
      aria-label="Scroll to top"
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      className={cn(
        'fixed bottom-8 right-8 z-50 h-14 w-14 transition-all duration-300 ease-out hover:scale-110 print:hidden',
        visible ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-3 opacity-0',
      )}
    >
      <svg viewBox="0 0 56 56" className="h-full w-full -rotate-90">
        {/* Navy disc */}
        <circle cx="28" cy="28" r="26" className="fill-navy" />
        {/* Track ring */}
        <circle cx="28" cy="28" r={RADIUS} fill="none" stroke="#C9A96E" strokeOpacity="0.25" strokeWidth="2.5" />
        {/* Progress ring */}
        <circle
          cx="28"
          cy="28"
          r={RADIUS}
          fill="none"
          stroke="#C9A96E"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 0.1s linear' }}
        />
      </svg>

      {/* Center content (counter-rotated container so it stays upright) */}
      <span className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center leading-none text-white">
        <ArrowUp className="h-3.5 w-3.5 text-gold" />
        <span className="mt-0.5 font-sans text-[10px] font-medium tabular-nums">
          {Math.round(progress)}%
        </span>
      </span>
    </button>
  );
}
