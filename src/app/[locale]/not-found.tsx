import Link from 'next/link';

/**
 * Bilingual 404 — rendered when notFound() is called within a [locale] route
 * (e.g. an unknown property reference). Kept language-agnostic on purpose so it
 * renders reliably regardless of the request's locale context.
 */
export default function NotFound() {
  return (
    <section className="flex min-h-[80vh] flex-col items-center justify-center bg-cream px-5 pt-24 text-center">
      <p className="eyebrow mb-3">My Home Budapest</p>
      <div className="mx-auto gold-rule mb-6" />
      <h1 className="font-serif text-6xl text-navy">404</h1>
      <p className="mt-4 max-w-md font-sans text-navy/70">
        A keresett oldal nem található.
      </p>
      <p className="mt-1 max-w-md font-sans text-navy/50">
        The page you are looking for could not be found.
      </p>
      <Link href="/" className="btn-gold mt-8">
        ← Főoldal / Home
      </Link>
    </section>
  );
}
