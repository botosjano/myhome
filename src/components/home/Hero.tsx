import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { ArrowRight } from 'lucide-react';
import { Link } from '@/navigation';
import SearchBox from './SearchBox';

export default function Hero() {
  const t = useTranslations('hero');

  return (
    <section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden">
      {/* Background image */}
      <Image
        src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=2400&q=80"
        alt="Luxury property in Budapest"
        fill
        priority
        sizes="100vw"
        className="object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-navy/80 via-navy/50 to-navy/85" />

      {/* Content */}
      <div className="relative z-10 mx-auto flex w-full max-w-5xl flex-col items-center px-5 pt-28 text-center">
        <h1 className="max-w-4xl font-serif text-5xl font-light leading-[1.1] tracking-wide text-white sm:text-6xl lg:text-7xl">
          {t('title')}
        </h1>
        <p className="mx-auto mt-5 max-w-2xl font-sans text-base leading-relaxed text-gold sm:text-lg">
          {t('subtitle')}
        </p>

        <div className="mt-10 w-full">
          <SearchBox />
        </div>

        {/* Secondary CTA — for visitors who'd rather reach out than search. */}
        <div className="mt-7 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <span className="font-sans text-sm text-white/70">{t('ctaText')}</span>
          <Link
            href="/kapcsolat"
            className="inline-flex items-center gap-2 rounded-sm border border-gold/50 px-5 py-2.5 font-sans text-sm text-white transition-colors hover:bg-gold hover:text-navy"
          >
            {t('ctaButton')}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
