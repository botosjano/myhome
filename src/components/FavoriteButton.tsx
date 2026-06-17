'use client';

import { Heart } from 'lucide-react';
import { useFavorites } from '@/lib/useFavorites';
import { cn } from '@/lib/utils';

export default function FavoriteButton({
  id,
  className,
}: {
  id: string;
  className?: string;
}) {
  const { isFavorite, toggle, ready } = useFavorites();
  const active = ready && isFavorite(id);

  return (
    <button
      type="button"
      aria-pressed={active}
      aria-label="Toggle favorite"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggle(id);
      }}
      className={cn(
        'flex h-10 w-10 items-center justify-center rounded-full bg-navy/40 text-white backdrop-blur transition-all hover:bg-navy/70',
        className,
      )}
    >
      <Heart
        className={cn('h-5 w-5 transition-all', active ? 'fill-gold text-gold' : 'text-white')}
      />
    </button>
  );
}
