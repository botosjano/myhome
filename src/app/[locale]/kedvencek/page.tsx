import { setRequestLocale } from 'next-intl/server';
import ComingSoon from '@/components/ComingSoon';

export default function FavoritesPage({ params: { locale } }: { params: { locale: string } }) {
  setRequestLocale(locale);
  return (
    <ComingSoon
      title={locale === 'hu' ? 'Kedvencek' : 'Favorites'}
      note={
        locale === 'hu'
          ? 'A mentett kedvencek oldala a listázó fázissal együtt készül el.'
          : 'The saved favorites page is built alongside the listing phase.'
      }
    />
  );
}
