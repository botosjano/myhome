import type { PropertyStatus } from '@/lib/types';
import { cn } from '@/lib/utils';

export const STATUS_LABEL: Record<PropertyStatus, string> = {
  active: 'Aktív',
  hidden: 'Rejtett',
  sold: 'Eladva',
};

const STYLE: Record<PropertyStatus, string> = {
  active: 'bg-green-100 text-green-700',
  hidden: 'bg-navy/10 text-navy/60',
  sold: 'bg-gold/20 text-gold-dark',
};

export default function StatusBadge({ status }: { status: PropertyStatus }) {
  return (
    <span
      className={cn(
        'inline-block rounded-sm px-2 py-0.5 font-sans text-[11px] font-medium uppercase tracking-wide',
        STYLE[status],
      )}
    >
      {STATUS_LABEL[status]}
    </span>
  );
}
