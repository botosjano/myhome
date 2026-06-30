'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Heart, Menu, X } from 'lucide-react';
import { Link, usePathname } from '@/navigation';
import { cn } from '@/lib/utils';
import Logo from './Logo';
import LanguageSwitcher from './LanguageSwitcher';

export default function Navbar() {
  const t = useTranslations('nav');
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  const isHome = pathname === '/';

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Solid navy bar everywhere except the top of the homepage hero.
  const solid = scrolled || !isHome;

  const links = [
    { href: '/', label: t('home') },
    { href: '/ingatlanok', label: t('properties') },
    { href: '/#about', label: t('about') },
  ];

  return (
    <header
      className={cn(
        'fixed inset-x-0 top-0 z-50 transition-all duration-300',
        solid ? 'bg-navy/95 shadow-luxe backdrop-blur' : 'bg-transparent',
      )}
    >
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-5 py-3 lg:px-8">
        <Link href="/" aria-label="My Home Budapest" className="relative z-10 flex items-center">
          {/* 2× size — intentionally overflows the navbar (negative margin keeps the bar slim) */}
          <Logo priority className="h-28 w-auto sm:h-32 -my-8" />
        </Link>

        {/* Desktop links */}
        <div className="hidden items-center gap-8 md:flex">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="font-sans text-sm uppercase tracking-widest text-white/85 transition-colors hover:text-gold"
            >
              {l.label}
            </Link>
          ))}
          <Link
            href="/kedvencek"
            className="flex items-center gap-2 font-sans text-sm uppercase tracking-widest text-white/85 transition-colors hover:text-gold"
          >
            <Heart className="h-4 w-4" />
            {t('favorites')}
          </Link>
          <LanguageSwitcher light />
          <Link
            href="/kapcsolat"
            className="rounded-sm bg-gold px-4 py-2 font-sans text-sm uppercase tracking-widest text-navy transition-colors hover:bg-gold-dark"
          >
            {t('contact')}
          </Link>
        </div>

        {/* Mobile toggle */}
        <button
          type="button"
          className="text-gold md:hidden"
          aria-label="Menu"
          onClick={() => setOpen((o) => !o)}
        >
          {open ? <X className="h-7 w-7" /> : <Menu className="h-7 w-7" />}
        </button>
      </nav>

      {/* Mobile menu */}
      {open && (
        <div className="border-t border-gold/20 bg-navy md:hidden">
          <div className="flex flex-col gap-1 px-5 py-4">
            {[...links, { href: '/kedvencek', label: t('favorites') }].map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="rounded-sm px-2 py-3 font-sans text-sm uppercase tracking-widest text-white/85 hover:bg-white/5 hover:text-gold"
              >
                {l.label}
              </Link>
            ))}
            <Link
              href="/kapcsolat"
              onClick={() => setOpen(false)}
              className="mt-1 rounded-sm bg-gold px-2 py-3 text-center font-sans text-sm uppercase tracking-widest text-navy transition-colors hover:bg-gold-dark"
            >
              {t('contact')}
            </Link>
            <div className="px-2 py-3">
              <LanguageSwitcher light />
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
