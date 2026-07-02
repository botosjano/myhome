'use client';

import { DISTRICTS } from '@/lib/districts';
import { cn } from '@/lib/utils';

/**
 * Schematic (not cartographically exact) clickable map of Budapest's 23
 * districts, split by a stylised Danube ribbon — Buda on the west bank, Pest on
 * the east. Coordinates are hand-placed to read as a recognisable layout.
 */
const LAYOUT: Record<number, [number, number]> = {
  3: [70, 26], // III. Óbuda
  4: [214, 26], // IV. Újpest
  15: [272, 54], // XV.
  2: [58, 82], // II. Rózsadomb
  13: [168, 90], // XIII. Újlipótváros (river)
  16: [312, 96], // XVI.
  6: [210, 118], // VI. Terézváros
  14: [256, 118], // XIV. Zugló
  12: [26, 150], // XII. Hegyvidék
  1: [96, 150], // I. Vár (river)
  5: [168, 150], // V. Belváros (river)
  7: [214, 160], // VII. Erzsébetváros
  17: [314, 158], // XVII. Rákosmente
  10: [300, 172], // X. Kőbánya
  8: [210, 200], // VIII. Józsefváros
  9: [170, 210], // IX. Ferencváros (river)
  11: [70, 212], // XI. Újbuda (river)
  19: [250, 238], // XIX. Kispest
  18: [302, 232], // XVIII.
  22: [40, 270], // XXII. Budafok
  20: [214, 270], // XX. Pesterzsébet
  23: [236, 318], // XXIII. Soroksár
  21: [150, 322], // XXI. Csepel (island)
};

const CW = 40;
const CH = 28;

export default function BudapestMap({
  selected,
  onToggle,
}: {
  selected: string[];
  onToggle: (label: string) => void;
}) {
  return (
    <svg
      viewBox="0 0 360 372"
      className="h-auto w-full select-none"
      role="img"
      aria-label="Budapest kerülettérkép"
    >
      {/* Danube ribbon */}
      <path
        d="M150 0 C 138 70, 176 120, 158 180 C 142 240, 176 300, 150 372"
        fill="none"
        stroke="#2f5d8a"
        strokeWidth="16"
        strokeLinecap="round"
        opacity="0.55"
      />
      {/* Margaret Island */}
      <ellipse cx="150" cy="96" rx="9" ry="22" fill="#2f5d8a" opacity="0.7" />

      {DISTRICTS.map((d) => {
        const pos = LAYOUT[d.arabic];
        if (!pos) return null;
        const [x, y] = pos;
        const active = selected.includes(d.label);
        return (
          <g
            key={d.label}
            transform={`translate(${x} ${y})`}
            onClick={() => onToggle(d.label)}
            className="cursor-pointer"
          >
            <title>{d.label}</title>
            <rect
              width={CW}
              height={CH}
              rx={5}
              className={cn(
                'transition-colors',
                active ? 'fill-gold' : 'fill-[#142845] hover:fill-[#1c3556]',
              )}
              stroke={active ? '#af8369' : 'rgba(255,255,255,0.18)'}
              strokeWidth="1"
            />
            <text
              x={CW / 2}
              y={CH / 2 + 4}
              textAnchor="middle"
              className={cn(
                'pointer-events-none font-sans text-[11px] font-semibold',
                active ? 'fill-navy' : 'fill-white/75',
              )}
            >
              {d.roman}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
