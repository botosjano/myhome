import createMiddleware from 'next-intl/middleware';
import { locales, defaultLocale } from './i18n';

export default createMiddleware({
  locales,
  defaultLocale,
  // 'hu' is the default — show it as /hu explicitly so URLs are unambiguous
  localePrefix: 'always',
});

export const config = {
  // Match all paths except API routes, Next internals, and static files
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
};
