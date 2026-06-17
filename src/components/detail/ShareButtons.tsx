'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Check, Facebook, Link2, MessageCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function ShareButtons() {
  const t = useTranslations('detail');
  const [copied, setCopied] = useState(false);

  // Resolve the URL after mount so server and client render the same markup.
  const [url, setUrl] = useState('');
  useEffect(() => setUrl(window.location.href), []);
  const enc = encodeURIComponent(url);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard unavailable */
    }
  };

  const links = [
    { label: 'Facebook', href: `https://www.facebook.com/sharer/sharer.php?u=${enc}`, Icon: Facebook },
    { label: 'WhatsApp', href: `https://wa.me/?text=${enc}`, Icon: MessageCircle },
    // Messenger deep-link (mobile). A Facebook App ID enables the desktop web dialog.
    { label: 'Messenger', href: `fb-messenger://share/?link=${enc}`, Icon: MessageCircle },
  ];

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="mr-1 font-sans text-xs uppercase tracking-wide text-navy/50">
        {t('shareTitle')}
      </span>
      {links.map(({ label, href, Icon }) => (
        <a
          key={label}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={label}
          className="flex h-9 w-9 items-center justify-center rounded-full border border-navy/15 text-navy/70 transition-colors hover:border-gold hover:text-gold"
        >
          <Icon className="h-4 w-4" />
        </a>
      ))}
      <button
        type="button"
        onClick={copy}
        className={cn(
          'flex h-9 items-center gap-1.5 rounded-full border px-3 font-sans text-xs transition-colors',
          copied
            ? 'border-gold bg-gold/10 text-gold'
            : 'border-navy/15 text-navy/70 hover:border-gold hover:text-gold',
        )}
      >
        {copied ? <Check className="h-3.5 w-3.5" /> : <Link2 className="h-3.5 w-3.5" />}
        {copied ? t('shareCopied') : t('shareCopy')}
      </button>
    </div>
  );
}
