import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';
import { Link } from '@/navigation';

export default function About() {
  const t = useTranslations('about');

  return (
    <section id="about" className="scroll-mt-24 bg-cream py-20 lg:py-28">
      <div className="mx-auto grid max-w-7xl items-center gap-12 px-5 lg:grid-cols-2 lg:px-8">
        <div className="relative aspect-[4/5] overflow-hidden rounded-sm shadow-card lg:aspect-[4/4]">
          <Image
            src="https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1400&q=80"
            alt="My Home Budapest"
            fill
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-cover"
          />
        </div>

        <div>
          <p className="eyebrow mb-3">{t('eyebrow')}</p>
          <div className="gold-rule mb-6" />
          <h2 className="font-serif text-3xl leading-tight text-navy sm:text-4xl">{t('title')}</h2>
          <div className="mt-6 space-y-3 font-sans text-base leading-relaxed text-navy/70">
            {t('body')
              .split('\n')
              .map((para, i) => (
                <p key={i}>{para}</p>
              ))}
          </div>
          <Link href="/kapcsolat" className="btn-gold mt-8">
            {t('cta')}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
