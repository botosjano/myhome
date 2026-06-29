import { notFound } from 'next/navigation';

/**
 * Catch-all for any unmatched path under a locale (e.g. a mistyped URL like
 * /hu/foo). Without this, Next renders its bare default 404 for unmatched URLs;
 * here we trigger notFound() so our branded bilingual [locale]/not-found.tsx
 * (with the Navbar/Footer chrome) renders instead.
 */
export default function CatchAllNotFound() {
  notFound();
}
