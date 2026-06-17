import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { setRequestLocale, getTranslations } from 'next-intl/server';
import { ArrowLeft, MapPin } from 'lucide-react';
import { Link } from '@/navigation';
import { getPropertyBySlug } from '@/lib/mock-data';
import { formatPrice, formatSize, localizedType } from '@/lib/utils';
import Gallery from '@/components/detail/Gallery';
import KeyStats from '@/components/detail/KeyStats';
import InquiryForm from '@/components/detail/InquiryForm';
import ShareButtons from '@/components/detail/ShareButtons';
import PdfButton from '@/components/detail/PdfButton';

type Params = { locale: string; slug: string };

export function generateMetadata({ params }: { params: Params }): Metadata {
  const p = getPropertyBySlug(params.slug);
  if (!p) return {};
  const isHu = params.locale === 'hu';
  const title = isHu ? p.title_hu : p.title_en;
  const desc = (isHu ? p.description_hu : p.description_en).slice(0, 160);
  return {
    title,
    description: desc,
    openGraph: {
      title,
      description: desc,
      images: p.images.length ? [{ url: p.images[0] }] : undefined,
      type: 'website',
    },
    alternates: {
      canonical: `/${params.locale}/ingatlan/${params.slug}`,
    },
  };
}

export default async function PropertyDetailPage({ params }: { params: Params }) {
  setRequestLocale(params.locale);
  const property = getPropertyBySlug(params.slug);
  if (!property) notFound();

  const t = await getTranslations('detail');
  const isHu = params.locale === 'hu';
  const title = isHu ? property.title_hu : property.title_en;
  const description = isHu ? property.description_hu : property.description_en;

  // JSON-LD structured data for the listing.
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Residence',
    name: title,
    description: description.slice(0, 300),
    image: property.images,
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Budapest',
      addressRegion: property.district,
      addressCountry: 'HU',
    },
    floorSize: { '@type': 'QuantitativeValue', value: property.size_m2, unitCode: 'MTK' },
    numberOfRooms: property.rooms,
    offers: {
      '@type': 'Offer',
      price: property.price,
      priceCurrency: property.currency,
      availability: 'https://schema.org/InStock',
    },
  };

  return (
    <article className="bg-white pt-24">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div className="mx-auto max-w-7xl px-5 py-6 lg:px-8">
        <Link
          href="/ingatlanok"
          className="inline-flex items-center gap-2 font-sans text-sm text-navy/60 transition-colors hover:text-gold print:hidden"
        >
          <ArrowLeft className="h-4 w-4" />
          {t('backToList')}
        </Link>

        {/* Title */}
        <div className="mt-4">
          <p className="eyebrow mb-1">
            {localizedType(property.type, params.locale)} · {t('reference')} {property.reference_number}
          </p>
          <h1 className="font-serif text-3xl text-navy sm:text-4xl">{title}</h1>
          <p className="mt-2 flex items-center gap-2 font-sans text-navy/60">
            <MapPin className="h-4 w-4 text-gold" />
            {property.district}, Budapest
          </p>
        </div>

        {/* Gallery */}
        <div className="mt-6">
          <Gallery images={property.images} alt={title} />
        </div>

        {/* Share + PDF */}
        <div className="mt-5 flex flex-wrap items-center justify-between gap-4 border-y border-navy/10 py-4">
          <ShareButtons />
          <PdfButton />
        </div>

        {/* Two-column body */}
        <div className="mt-8 grid gap-10 lg:grid-cols-3">
          {/* Left: description */}
          <div className="lg:col-span-2">
            <h2 className="font-serif text-2xl text-navy">{t('descriptionTitle')}</h2>
            <div className="gold-rule my-4" />
            <p className="whitespace-pre-line font-sans text-base leading-relaxed text-navy/75">
              {description}
            </p>

            {/* Quick facts strip */}
            <div className="mt-8 grid grid-cols-2 gap-px overflow-hidden rounded-sm border border-navy/10 bg-navy/10 sm:grid-cols-3">
              {[
                [t('price'), formatPrice(property.price, property.currency, params.locale)],
                [t('size'), formatSize(property.size_m2, params.locale)],
                ...(property.type !== 'telek' ? [[t('rooms'), String(property.rooms)]] : []),
                [t('district'), property.district],
                ...(property.year_built ? [[t('yearBuilt'), String(property.year_built)]] : []),
                [t('reference'), property.reference_number],
              ].map(([label, value]) => (
                <div key={label} className="bg-cream p-4">
                  <p className="font-sans text-xs uppercase tracking-wide text-navy/45">{label}</p>
                  <p className="mt-1 font-serif text-lg text-navy">{value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right: sticky stats + inquiry */}
          <aside className="lg:col-span-1">
            <div className="sticky top-24 space-y-6 print:hidden">
              <KeyStats property={property} />
              <div className="rounded-sm border border-navy/10 bg-cream p-6">
                <InquiryForm propertyId={property.id} reference={property.reference_number} />
              </div>
            </div>
          </aside>
        </div>
      </div>
    </article>
  );
}
