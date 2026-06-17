import { setRequestLocale } from 'next-intl/server';
import ComingSoon from '@/components/ComingSoon';

export default function PropertyDetailPage({
  params: { locale, slug },
}: {
  params: { locale: string; slug: string };
}) {
  setRequestLocale(locale);
  return (
    <ComingSoon
      title={locale === 'hu' ? 'Ingatlan adatlap' : 'Property detail'}
      note={
        locale === 'hu'
          ? `A részletes adatlap (galéria, leírás, PDF) a következő fázisban készül el. (${slug})`
          : `The detail page (gallery, description, PDF) is built in the next phase. (${slug})`
      }
    />
  );
}
