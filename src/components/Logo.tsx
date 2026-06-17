import Image from 'next/image';
import { cn } from '@/lib/utils';

/**
 * The official My Home Budapest logo (rose-gold lockup on transparent bg).
 * Source file: /public/logo.png (500×500). Size it via the `className`
 * (e.g. "h-14 w-auto") at each call site.
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
      src="/logo.png"
      alt="My Home Budapest — Premium Real Estate"
      width={500}
      height={500}
      priority={priority}
      className={cn('w-auto select-none', className)}
    />
  );
}
