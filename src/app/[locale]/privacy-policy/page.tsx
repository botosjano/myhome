import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import PrivacyPolicy from '@/components/PrivacyPolicy';

export function generateMetadata({ params: { locale } }: { params: { locale: string } }): Metadata {
  return { title: locale === 'hu' ? 'Adatkezelési tájékoztató' : 'Privacy Policy' };
}

export default function PrivacyPolicyPage({ params: { locale } }: { params: { locale: string } }) {
  setRequestLocale(locale);
  return <PrivacyPolicy locale={locale} />;
}
