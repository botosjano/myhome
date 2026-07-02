import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { ArrowRight, Phone } from 'lucide-react';
import { Link } from '@/navigation';

const PHONE = '+36 30 941 4510';

/**
 * Closing call-to-action band between the About section and the footer.
 * Navy background with a subtle image (a heavy navy overlay keeps it premium and
 * graceful even if the image fails to load) and a gold primary button to the
 * contact page (whose form feeds the GHL CRM). Centred layout stacks naturally
 * on mobile and sits inline on larger screens.
 */
export default function CtaSection() {
  const t = useTranslations('homeCta');

  return (
    <section className="relative overflow-hidden bg-navy">
      <Image
        src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=2000&q=80"
        alt=""
        fill
        sizes="100vw"
        className="object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-navy/55 via-navy/40 to-navy/70" />

      <div className="relative z-10 mx-auto max-w-3xl px-5 py-24 text-center lg:py-32">
        <p className="font-sans text-xs uppercase tracking-[0.22em] text-gold">{t('eyebrow')}</p>
        <div className="mx-auto gold-rule my-5" />
        <h2 className="font-serif text-3xl text-white drop-shadow-[0_2px_20px_rgba(10,22,40,0.98)] sm:text-4xl lg:text-5xl">
          {t('title')}
        </h2>
        <p className="mx-auto mt-5 max-w-xl font-sans text-base leading-relaxed text-white/90 drop-shadow-[0_1px_14px_rgba(10,22,40,0.95)]">
          {t('text')}
        </p>

        <div className="mt-9 flex flex-col items-center justify-center gap-5 sm:flex-row sm:gap-8">
          <Link href="/kapcsolat" className="btn-gold">
            {t('button')}
            <ArrowRight className="h-4 w-4" />
          </Link>
          <a
            href={`tel:${PHONE.replace(/\s/g, '')}`}
            className="flex items-center gap-2 font-sans text-sm text-white/80 transition-colors hover:text-gold"
          >
            <Phone className="h-4 w-4 text-gold" />
            <span>
              <span className="block text-[11px] uppercase tracking-wide text-white/45">
                {t('phoneLabel')}
              </span>
              {PHONE}
            </span>
          </a>
        </div>
      </div>
    </section>
  );
}
