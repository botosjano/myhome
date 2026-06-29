import { useLocale, useTranslations } from 'next-intl';
import { Facebook, Instagram, Mail, Phone } from 'lucide-react';
import { Link } from '@/navigation';
import Logo from './Logo';

const CONTACT_EMAIL = 'myhome@olahkrisztina.hu';
const CONTACT_PHONE = '+36 30 941 4510';

export default function Footer() {
  const t = useTranslations();
  const locale = useLocale();
  const privacyHref = locale === 'hu' ? '/adatkezeles' : '/privacy-policy';

  const links = [
    { href: '/', label: t('nav.home') },
    { href: '/ingatlanok', label: t('nav.properties') },
    { href: '/#about', label: t('nav.about') },
    { href: '/kapcsolat', label: t('nav.contact') },
    { href: '/kedvencek', label: t('nav.favorites') },
  ];

  return (
    <footer className="bg-navy text-white">
      <div className="mx-auto max-w-7xl px-5 py-16 lg:px-8">
        <div className="grid gap-12 md:grid-cols-4">
          {/* Brand */}
          <div className="md:col-span-2">
            <Logo className="h-36 w-auto" />
            <p className="mt-5 max-w-sm font-sans text-sm leading-relaxed text-white/60">
              {t('footer.tagline')}
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h3 className="eyebrow mb-4">{t('footer.navigation')}</h3>
            <ul className="space-y-2.5">
              {links.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="font-sans text-sm text-white/70 transition-colors hover:text-gold"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="eyebrow mb-4">{t('footer.contact')}</h3>
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="flex items-center gap-2 font-sans text-sm text-white/70 transition-colors hover:text-gold"
            >
              <Mail className="h-4 w-4 text-gold" />
              {CONTACT_EMAIL}
            </a>
            <a
              href={`tel:${CONTACT_PHONE.replace(/\s/g, '')}`}
              className="mt-2 flex items-center gap-2 font-sans text-sm text-white/70 transition-colors hover:text-gold"
            >
              <Phone className="h-4 w-4 text-gold" />
              {CONTACT_PHONE}
            </a>
            <h3 className="eyebrow mb-3 mt-6">{t('footer.follow')}</h3>
            <div className="flex gap-3">
              <a
                href="#"
                aria-label="Facebook"
                className="flex h-9 w-9 items-center justify-center rounded-sm border border-gold/30 text-gold transition-colors hover:bg-gold hover:text-navy"
              >
                <Facebook className="h-4 w-4" />
              </a>
              <a
                href="#"
                aria-label="Instagram"
                className="flex h-9 w-9 items-center justify-center rounded-sm border border-gold/30 text-gold transition-colors hover:bg-gold hover:text-navy"
              >
                <Instagram className="h-4 w-4" />
              </a>
            </div>
          </div>
        </div>

        <div className="mt-14 flex flex-col items-center gap-2 border-t border-white/10 pt-6">
          <Link
            href={privacyHref}
            className="font-sans text-xs text-white/50 transition-colors hover:text-gold"
          >
            {t('privacy.link')}
          </Link>
          <p className="text-center font-sans text-xs text-white/40">
            {t('footer.rights')} / All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
