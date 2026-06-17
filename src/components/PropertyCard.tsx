'use client';

import Image from 'next/image';
import { useLocale, useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { BedDouble, Maximize, MapPin } from 'lucide-react';
import { Link } from '@/navigation';
import type { Property } from '@/lib/types';
import { cn, formatPrice, formatSize, propertySlug } from '@/lib/utils';
import FavoriteButton from './FavoriteButton';

export default function PropertyCard({
  property,
  size = 'normal',
  index = 0,
}: {
  property: Property;
  size?: 'normal' | 'large';
  index?: number;
}) {
  const locale = useLocale();
  const t = useTranslations('card');
  const tTypes = useTranslations('types');

  const title = locale === 'hu' ? property.title_hu : property.title_en;
  const href = `/ingatlan/${propertySlug(property)}`;
  const large = size === 'large';

  return (
    <motion.article
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.55, delay: Math.min(index * 0.08, 0.5), ease: 'easeOut' }}
      className="group relative overflow-hidden rounded-sm bg-white shadow-card"
    >
      <Link href={href} className="block">
        <div className={cn('relative w-full overflow-hidden', large ? 'aspect-[4/3]' : 'aspect-[3/2]')}>
          <Image
            src={property.images[0]}
            alt={title}
            fill
            sizes={large ? '(max-width: 768px) 100vw, 50vw' : '(max-width: 768px) 100vw, 25vw'}
            className="object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-navy/70 via-transparent to-transparent" />

          {property.featured && (
            <span className="absolute left-4 top-4 rounded-sm bg-gold px-3 py-1 font-sans text-[10px] font-semibold uppercase tracking-widest text-navy">
              {t('featured')}
            </span>
          )}

          <FavoriteButton id={property.id} className="absolute right-3 top-3" />

          {/* Price overlay */}
          <div className="absolute inset-x-0 bottom-0 p-4">
            <p className="font-serif text-2xl font-semibold text-white drop-shadow">
              {formatPrice(property.price, property.currency, locale)}
            </p>
          </div>
        </div>

        <div className="p-5">
          <p className="eyebrow mb-1">
            {tTypes(property.type)} · {t('reference')} {property.reference_number}
          </p>
          <h3 className={cn('font-serif text-navy', large ? 'text-2xl' : 'text-lg', 'line-clamp-2')}>
            {title}
          </h3>

          <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 font-sans text-sm text-navy/70">
            <span className="flex items-center gap-1.5">
              <MapPin className="h-4 w-4 text-gold" />
              {property.district}
            </span>
            <span className="flex items-center gap-1.5">
              <Maximize className="h-4 w-4 text-gold" />
              {formatSize(property.size_m2, locale)}
            </span>
            {property.type !== 'telek' && (
              <span className="flex items-center gap-1.5">
                <BedDouble className="h-4 w-4 text-gold" />
                {property.rooms} {t('rooms')}
              </span>
            )}
          </div>
        </div>
      </Link>
    </motion.article>
  );
}
