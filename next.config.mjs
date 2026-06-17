import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'plus.unsplash.com' },
      // Cloudflare R2 bucket (configure later)
      { protocol: 'https', hostname: '*.r2.dev' },
    ],
  },
};

export default withNextIntl(nextConfig);
