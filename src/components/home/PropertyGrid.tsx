import type { Property } from '@/lib/types';
import PropertyCard from '../PropertyCard';

/**
 * Masonry layout per the brief: one large card on the left + two smaller cards
 * stacked on the right, then the pattern repeats. Falls back to a single column
 * on mobile.
 */
export default function PropertyGrid({ properties }: { properties: Property[] }) {
  const groups: Property[][] = [];
  for (let i = 0; i < properties.length; i += 3) {
    groups.push(properties.slice(i, i + 3));
  }

  let counter = 0;

  return (
    <div className="space-y-8">
      {groups.map((group, gi) => {
        const [large, ...rest] = group;
        return (
          <div key={gi} className="grid gap-8 lg:grid-cols-2">
            {large && <PropertyCard property={large} size="large" index={counter++} />}
            {rest.length > 0 && (
              <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-1">
                {rest.map((p) => (
                  <PropertyCard key={p.id} property={p} index={counter++} />
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
