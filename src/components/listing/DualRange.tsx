'use client';

import { useId } from 'react';
import { cn } from '@/lib/utils';

/**
 * Two-thumb range slider built from two overlaid <input type="range">.
 * Controlled: pass [min,max] bounds and the current [low,high] value.
 */
export default function DualRange({
  min,
  max,
  step = 1,
  low,
  high,
  onChange,
  format = (v) => String(v),
}: {
  min: number;
  max: number;
  step?: number;
  low: number;
  high: number;
  onChange: (low: number, high: number) => void;
  format?: (v: number) => string;
}) {
  const id = useId();
  const pct = (v: number) => ((v - min) / (max - min)) * 100;

  return (
    <div>
      <div className="relative h-6">
        {/* Track */}
        <div className="absolute top-1/2 h-1 w-full -translate-y-1/2 rounded-full bg-navy/15" />
        {/* Selected range */}
        <div
          className="absolute top-1/2 h-1 -translate-y-1/2 rounded-full bg-gold"
          style={{ left: `${pct(low)}%`, right: `${100 - pct(high)}%` }}
        />
        <input
          aria-label="min"
          id={`${id}-low`}
          type="range"
          min={min}
          max={max}
          step={step}
          value={low}
          onChange={(e) => onChange(Math.min(Number(e.target.value), high), high)}
          className={cn('range-thumb', 'pointer-events-none absolute inset-x-0 top-0 h-6 w-full appearance-none bg-transparent')}
        />
        <input
          aria-label="max"
          id={`${id}-high`}
          type="range"
          min={min}
          max={max}
          step={step}
          value={high}
          onChange={(e) => onChange(low, Math.max(Number(e.target.value), low))}
          className={cn('range-thumb', 'pointer-events-none absolute inset-x-0 top-0 h-6 w-full appearance-none bg-transparent')}
        />
      </div>
      <div className="mt-1 flex justify-between font-sans text-xs text-navy/60">
        <span>{format(low)}</span>
        <span>{format(high)}</span>
      </div>
    </div>
  );
}
