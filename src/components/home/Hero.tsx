import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { ChevronDown } from 'lucide-react';
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
        <p className="eyebrow mb-4">{t('eyebrow')}</p>
        <h1 className="max-w-4xl font-serif text-5xl font-light leading-[1.1] tracking-wide text-white sm:text-6xl lg:text-7xl">
          {t('title')}
        </h1>
        <p className="mx-auto mt-5 max-w-2xl font-sans text-base leading-relaxed text-white/80 sm:text-lg">
          {t('subtitle')}
        </p>

        <div className="mt-10 w-full">
          <SearchBox />
        </div>
      </div>

      <div className="absolute bottom-6 left-1/2 z-10 -translate-x-1/2 text-gold">
        <ChevronDown className="h-7 w-7 animate-bounce" />
      </div>
    </section>
  );
}
