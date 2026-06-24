/**
 * Shared dark-navy Google Maps theme.
 * Used by both the interactive listing map (Maps JavaScript API, `styles` option)
 * and the static detail map (Maps Static API, `style=` query params).
 */

type StyleEntry = {
  featureType?: string;
  elementType?: string;
  stylers: Array<Record<string, string>>;
};

export const MAP_STYLE: StyleEntry[] = [
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

/** Serialize MAP_STYLE into Maps Static API `style=...` query params (joined by &). */
export function staticMapStyleParams(): string {
  return MAP_STYLE.map((s) => {
    const parts: string[] = [];
    if (s.featureType) parts.push(`feature:${s.featureType}`);
    if (s.elementType) parts.push(`element:${s.elementType}`);
    for (const styler of s.stylers) {
      for (const [k, v] of Object.entries(styler)) {
        parts.push(`${k}:${v.startsWith('#') ? '0x' + v.slice(1) : v}`);
      }
    }
    return 'style=' + encodeURIComponent(parts.join('|'));
  }).join('&');
}
