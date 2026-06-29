'use client';

import { useEffect, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { Link } from '@/navigation';

const KEY = 'cookie_consent';

/**
 * GDPR cookie consent banner. Shows once on first visit; on Accept it stores
 * `cookie_consent = "accepted"` in localStorage and never shows again. Rendered
 * in the root layout so it appears on every page.
 */
export default function CookieConsent() {
  const t = useTranslations('cookie');
  const locale = useLocale();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Read after mount to avoid a hydration mismatch.
    try {
      if (localStorage.getItem(KEY) !== 'accepted') setVisible(true);
    } catch {
      setVisible(true);
    }
  }, []);

  const accept = () => {
    try {
      localStorage.setItem(KEY, 'accepted');
    } catch {
      /* ignore */
    }
    setVisible(false);
  };

  if (!visible) return null;

  // Localised privacy-policy path (the Link prefixes the locale).
  const privacyHref = locale === 'hu' ? '/adatkezeles' : '/privacy-policy';

  return (
    <div className="fixed inset-x-0 bottom-0 z-[60] bg-navy text-white shadow-[0_-4px_24px_rgba(0,0,0,0.25)]">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-5 py-5 sm:flex-row sm:items-center sm:justify-between lg:px-8">
        <div className="min-w-0">
          <p className="font-serif text-base text-white">{t('title')}</p>
          <p className="mt-1 font-sans text-sm leading-relaxed text-white/70">
            {t('text')}{' '}
            <Link href={privacyHref} className="text-gold underline underline-offset-2 hover:text-gold/80">
              {t('privacy')}
            </Link>
          </p>
        </div>
        <button
          type="button"
          onClick={accept}
          className="btn-gold shrink-0 self-start sm:self-auto"
        >
          {t('accept')}
        </button>
      </div>
    </div>
  );
}
