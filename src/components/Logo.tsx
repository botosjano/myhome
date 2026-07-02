import Image from 'next/image';
import { cn } from '@/lib/utils';

/**
 * The official My Home Budapest logo — a wide rose-gold lockup ("My Home |
 * PREMIUM REAL ESTATE") on a transparent background. Source: /public/logo.webp
 * (1206×404, ~3:1). Because it's a horizontal lockup, size it by HEIGHT via the
 * `className` (e.g. "h-12 w-auto") at each call site.
 */
export default function Logo({
  className,
  priority = false,
}: {
  className?: string;
  priority?: boolean;
}) {
  return (
    <Image
      src="/logo.webp"
      alt="My Home Budapest — Premium Real Estate"
      width={1206}
      height={404}
      priority={priority}
      className={cn('w-auto select-none', className)}
    />
  );
}
