import { setRequestLocale } from 'next-intl/server';
import ComingSoon from '@/components/ComingSoon';

export default function PropertiesPage({ params: { locale } }: { params: { locale: string } }) {
  setRequestLocale(locale);
  return (
    <ComingSoon
      title={locale === 'hu' ? 'Ingatlanok' : 'Properties'}
      note={
        locale === 'hu'
          ? 'A teljes listázó oldal (szűrők, térkép, rendezés) a következő fázisban készül el.'
          : 'The full listing page (filters, map, sorting) is built in the next phase.'
      }
    />
  );
}
