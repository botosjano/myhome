import type { Metadata } from 'next';
import { setRequestLocale, getTranslations } from 'next-intl/server';
import { Facebook, Instagram, Mail, Phone } from 'lucide-react';
import ContactForm from '@/components/ContactForm';

const CONTACT_EMAIL = 'myhome@olahkrisztina.hu';
const CONTACT_PHONE = '+36 30 941 4510';

type Params = { locale: string };

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const t = await getTranslations({ locale: params.locale, namespace: 'contact' });
  return {
    title: t('title'),
    description: t('subtitle'),
    alternates: { canonical: `/${params.locale}/kapcsolat` },
  };
}

export default async function ContactPage({ params }: { params: Params }) {
  setRequestLocale(params.locale);
  const t = await getTranslations('contact');

  return (
    <div className="bg-white pt-24">
      {/* Header */}
      <div className="border-b border-navy/10 bg-cream">
        <div className="mx-auto max-w-7xl px-5 py-12 lg:px-8">
          <p className="eyebrow mb-2">{t('eyebrow')}</p>
          <h1 className="font-serif text-3xl text-navy sm:text-4xl">{t('title')}</h1>
          <p className="mt-3 max-w-2xl font-sans text-base leading-relaxed text-navy/65">{t('subtitle')}</p>
        </div>
      </div>

      <div className="mx-auto grid max-w-7xl gap-12 px-5 py-14 lg:grid-cols-2 lg:px-8">
        {/* Info */}
        <div>
          <h2 className="font-serif text-2xl text-navy">{t('infoTitle')}</h2>
          <div className="gold-rule my-4" />
          <a
            href={`mailto:${CONTACT_EMAIL}`}
            className="flex items-center gap-3 font-sans text-base text-navy/80 transition-colors hover:text-gold"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-sm bg-gold/15 text-gold-dark">
              <Mail className="h-5 w-5" />
            </span>
            {CONTACT_EMAIL}
          </a>

          <a
            href={`tel:${CONTACT_PHONE.replace(/\s/g, '')}`}
            className="mt-3 flex items-center gap-3 font-sans text-base text-navy/80 transition-colors hover:text-gold"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-sm bg-gold/15 text-gold-dark">
              <Phone className="h-5 w-5" />
            </span>
            {CONTACT_PHONE}
          </a>

          <p className="mt-5 max-w-md font-sans text-sm leading-relaxed text-navy/60">{t('responseNote')}</p>

          <h3 className="eyebrow mb-3 mt-8">{t('followLabel')}</h3>
          <div className="flex gap-3">
            <a
              href="#"
              aria-label="Facebook"
              className="flex h-10 w-10 items-center justify-center rounded-sm border border-gold/30 text-gold transition-colors hover:bg-gold hover:text-navy"
            >
              <Facebook className="h-4 w-4" />
            </a>
            <a
              href="#"
              aria-label="Instagram"
              className="flex h-10 w-10 items-center justify-center rounded-sm border border-gold/30 text-gold transition-colors hover:bg-gold hover:text-navy"
            >
              <Instagram className="h-4 w-4" />
            </a>
          </div>
        </div>

        {/* Form */}
        <div className="rounded-sm border border-navy/10 bg-cream p-6 shadow-card sm:p-8">
          <h2 className="mb-2 font-serif text-2xl text-navy">{t('formTitle')}</h2>
          <p className="mb-5 font-sans text-sm leading-relaxed text-navy/60">{t('formIntro')}</p>
          <ContactForm />
        </div>
      </div>
    </div>
  );
}
