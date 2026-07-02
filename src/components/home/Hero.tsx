import { useTranslations } from 'next-intl';
import { ArrowRight } from 'lucide-react';
import { Link } from '@/navigation';
import SearchBox from './SearchBox';
import HeroBackground from './HeroBackground';

export default function Hero() {
  const t = useTranslations('hero');

  return (
    <section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden">
      {/* Poster + desktop-only video */}
      <HeroBackground />

      {/* Content */}
      <div className="relative z-10 mx-auto flex w-full max-w-5xl flex-col items-center px-5 pt-28 text-center">
        <h1 className="max-w-4xl font-serif text-5xl font-light leading-[1.1] tracking-wide text-white drop-shadow-[0_2px_18px_rgba(10,22,40,0.9)] sm:text-6xl lg:text-7xl">
          {t('title')}
        </h1>
        {/* Thin rule under the title */}
        <div className="mx-auto mt-6 h-px w-20 bg-white/70" />
        <p className="mx-auto mt-6 max-w-2xl font-sans text-base leading-relaxed text-white drop-shadow-[0_1px_12px_rgba(10,22,40,0.85)] sm:text-lg">
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
