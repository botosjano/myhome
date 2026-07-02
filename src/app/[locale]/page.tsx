import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import Hero from '@/components/home/Hero';
import PropertyGrid from '@/components/home/PropertyGrid';
import FeaturedSection from '@/components/home/FeaturedSection';
import About from '@/components/home/About';
import CtaSection from '@/components/home/CtaSection';
import { fetchActiveProperties } from '@/lib/properties';
import { seoAlternates } from '@/lib/seo';

export function generateMetadata({ params: { locale } }: { params: { locale: string } }): Metadata {
  return { alternates: seoAlternates(locale, '') };
}

// Statically generated; refreshed on demand when a listing changes (admin calls
// revalidateTag('properties')). The 1h revalidate is just a safety net.
export const revalidate = 3600;

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://myhomebudapest.hu';

// Local-SEO structured data — helps Google associate the site with the agency.
const businessJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'RealEstateAgent',
  name: 'My Home Ingatlan Iroda Budapest',
  url: SITE_URL,
  image: `${SITE_URL}/og-image.png`,
  logo: `${SITE_URL}/logo.png`,
  telephone: '+36309414510',
  email: 'myhome@olahkrisztina.hu',
  areaServed: 'Budapest',
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'Budapest',
    addressCountry: 'HU',
  },
};

export default async function HomePage({ params: { locale } }: { params: { locale: string } }) {
  setRequestLocale(locale);

  const t = await getTranslations('sections');
  const latest = await fetchActiveProperties();
  const featured = latest.filter((p) => p.featured);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(businessJsonLd) }}
      />
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

      <CtaSection />
    </>
  );
}
