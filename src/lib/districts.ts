// Budapest districts I–XXIII. with Roman numerals and common area names.

export interface District {
  roman: string; // "II."
  arabic: number; // 2
  label: string; // "II. kerület"
  area_hu: string;
  area_en: string;
}

const roman = [
  'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII',
  'XIII', 'XIV', 'XV', 'XVI', 'XVII', 'XVIII', 'XIX', 'XX', 'XXI', 'XXII', 'XXIII',
];

const areas: Record<number, { hu: string; en: string }> = {
  1: { hu: 'Várnegyed', en: 'Castle District' },
  2: { hu: 'Rózsadomb', en: 'Rózsadomb' },
  3: { hu: 'Óbuda', en: 'Óbuda' },
  5: { hu: 'Belváros-Lipótváros', en: 'Downtown' },
  6: { hu: 'Terézváros', en: 'Terézváros' },
  7: { hu: 'Erzsébetváros', en: 'Erzsébetváros' },
  9: { hu: 'Ferencváros', en: 'Ferencváros' },
  11: { hu: 'Újbuda', en: 'Újbuda' },
  12: { hu: 'Hegyvidék', en: 'Hegyvidék' },
  13: { hu: 'Újlipótváros', en: 'Újlipótváros' },
};

export const DISTRICTS: District[] = roman.map((r, i) => {
  const arabic = i + 1;
  const area = areas[arabic];
  return {
    roman: `${r}.`,
    arabic,
    label: `${r}. kerület`,
    area_hu: area?.hu ?? `${r}. kerület`,
    area_en: area?.en ?? `District ${r}`,
  };
});

// Buda vs. Pest side (by district arabic number). Used by the location picker's
// quick-select toggles. III, XI, XII, XXII sit on the Buda bank with I & II.
export const BUDA_DISTRICTS = [1, 2, 3, 11, 12, 22] as const;
export const PEST_DISTRICTS = [4, 5, 6, 7, 8, 9, 10, 13, 14, 15, 16, 17, 18, 19, 20, 21, 23] as const;

// Curated countryside locations we actually serve (substring-matched on a
// property's `city`). "Balaton" also matches "Balaton (Tihany)" etc.
export const VIDEK_LOCATIONS = ['Balaton', 'Szentendre', 'Eger'] as const;

export const PROPERTY_TYPES = ['lakás', 'ház', 'villa', 'penthouse', 'telek'] as const;

export const ROOM_OPTIONS = [1, 2, 3, 4, 5] as const; // 5 = "5+"

export const HEATING_OPTIONS = [
  'gaz',
  'tavfutes',
  'hoszivatyu',
  'elektromos',
  'kandallo',
  'egyeb',
] as const;

export const ENERGY_RATINGS = ['AA', 'A+', 'A', 'B', 'C', 'D', 'E'] as const;

// Construction-year bounds for the "Építés éve" filter inputs.
export const YEAR_MIN = 1890;
export const YEAR_MAX = 2025;
