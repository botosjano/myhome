'use client';

import { useLocale } from 'next-intl';
import { usePathname, useRouter } from '@/navigation';
import { cn } from '@/lib/utils';

const FLAGS: Record<string, string> = { hu: '🇭🇺', en: '🇬🇧' };

export default function LanguageSwitcher({ light = false }: { light?: boolean }) {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();

  const switchTo = (next: 'hu' | 'en') => {
    if (next === locale) return;
    router.replace(pathname, { locale: next });
  };

  return (
    <div className="flex items-center gap-1 text-sm">
      {(['hu', 'en'] as const).map((l, i) => (
        <span key={l} className="flex items-center">
          {i > 0 && <span className={cn('mx-1', light ? 'text-white/30' : 'text-gold/40')}>/</span>}
          <button
            type="button"
            onClick={() => switchTo(l)}
            aria-current={locale === l}
            className={cn(
              'flex items-center gap-1 rounded-sm px-1 py-0.5 font-sans uppercase tracking-wide transition-colors',
              locale === l
                ? 'text-gold'
                : light
                  ? 'text-white/70 hover:text-white'
                  : 'text-navy/60 hover:text-navy',
            )}
          >
            <span aria-hidden>{FLAGS[l]}</span>
            <span className="text-xs font-medium">{l.toUpperCase()}</span>
          </button>
        </span>
      ))}
    </div>
  );
}
