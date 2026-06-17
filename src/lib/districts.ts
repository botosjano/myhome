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

export const PROPERTY_TYPES = ['lakás', 'ház', 'villa', 'penthouse', 'telek'] as const;

export const ROOM_OPTIONS = [1, 2, 3, 4, 5] as const; // 5 = "5+"
