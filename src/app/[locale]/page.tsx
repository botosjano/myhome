import { useTranslations } from 'next-intl';
import { setRequestLocale } from 'next-intl/server';
import Hero from '@/components/home/Hero';
import PropertyGrid from '@/components/home/PropertyGrid';
import FeaturedSection from '@/components/home/FeaturedSection';
import About from '@/components/home/About';
import { MOCK_PROPERTIES, getFeaturedProperties } from '@/lib/mock-data';

export default function HomePage({ params: { locale } }: { params: { locale: string } }) {
  setRequestLocale(locale);

  const t = useTranslations('sections');
  const latest = [...MOCK_PROPERTIES]
    .filter((p) => p.status === 'active')
    .sort((a, b) => +new Date(b.created_at) - +new Date(a.created_at));
  const featured = getFeaturedProperties();

  return (
    <>
      <Hero />

      <section className="bg-white py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <div className="mb-12 text-center">
            <p className="eyebrow mb-3">{t('latestTitle')}</p>
            <div className="mx-auto gold-rule mb-5" />
            <h2 className="font-serif text-3xl text-navy sm:text-4xl">{t('latestSubtitle')}</h2>
          </div>
          <PropertyGrid properties={latest} />
        </div>
      </section>

      <FeaturedSection properties={featured} />

      <About />
    </>
  );
}
