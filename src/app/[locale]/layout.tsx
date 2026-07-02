import type { Metadata } from 'next';
import { Cormorant_Garamond } from 'next/font/google';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { locales } from '@/i18n';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ScrollToTopButton from '@/components/ScrollToTopButton';
import CookieConsent from '@/components/CookieConsent';
import '../globals.css';

// Single typeface across the whole site for an editorial, haute-couture feel.
const cormorant = Cormorant_Garamond({
  subsets: ['latin', 'latin-ext'],
  weight: ['300', '400', '500', '600', '700'],
  style: ['normal', 'italic'],
  variable: '--font-cormorant',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'https://myhomebudapest.hu'),
  title: {
    default: 'My Home Budapest — Premium Real Estate',
    template: '%s | My Home Budapest',
  },
  description:
    'Discreet, off-market luxury real estate in Budapest. Exceptional homes reserved for discerning Hungarian and international buyers.',
  openGraph: {
    type: 'website',
    siteName: 'My Home Budapest',
    images: [
      { url: '/og-image.png', width: 1200, height: 630, alt: 'My Home Budapest — Premium Real Estate' },
    ],
  },
};

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params: { locale },
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  if (!locales.includes(locale as (typeof locales)[number])) notFound();

  setRequestLocale(locale);
  const messages = await getMessages();

  return (
    <html lang={locale} className={cormorant.variable}>
      <body className="flex min-h-screen flex-col">
        <NextIntlClientProvider messages={messages}>
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
          <ScrollToTopButton />
          <CookieConsent />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
