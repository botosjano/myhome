import type { Metadata } from 'next';
import { Cormorant_Garamond } from 'next/font/google';
import '../globals.css';

const cormorant = Cormorant_Garamond({
  subsets: ['latin', 'latin-ext'],
  weight: ['300', '400', '500', '600', '700'],
  style: ['normal', 'italic'],
  variable: '--font-cormorant',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Admin — My Home Budapest',
  robots: { index: false, follow: false },
};

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="hu" className={cormorant.variable}>
      <body className="min-h-screen bg-cream">{children}</body>
    </html>
  );
}
