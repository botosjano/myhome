import { useTranslations } from 'next-intl';
import { ArrowRight } from 'lucide-react';
import { Link } from '@/navigation';
import type { Property } from '@/lib/types';
import PropertyCard from '../PropertyCard';

export default function FeaturedSection({ properties }: { properties: Property[] }) {
  const t = useTranslations('sections');
  if (properties.length === 0) return null;

  return (
    <section className="bg-navy py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <div className="mb-12 text-center">
          <p className="eyebrow mb-3">{t('featuredTitle')}</p>
          <div className="mx-auto gold-rule mb-5" />
          <h2 className="font-serif text-3xl text-white sm:text-4xl">{t('featuredSubtitle')}</h2>
        </div>

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {properties.slice(0, 3).map((p, i) => (
            <PropertyCard key={p.id} property={p} index={i} />
          ))}
        </div>

        <div className="mt-12 text-center">
          <Link href="/ingatlanok" className="btn-outline">
            {t('viewAll')}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
