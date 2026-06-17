import { Link } from '@/navigation';

export default function ComingSoon({ title, note }: { title: string; note: string }) {
  return (
    <section className="flex min-h-[70vh] items-center justify-center bg-cream px-5 pt-24">
      <div className="text-center">
        <p className="eyebrow mb-3">My Home Budapest</p>
        <div className="mx-auto gold-rule mb-6" />
        <h1 className="font-serif text-3xl text-navy sm:text-4xl">{title}</h1>
        <p className="mx-auto mt-4 max-w-md font-sans text-navy/60">{note}</p>
        <Link href="/" className="btn-gold mt-8">
          ← Főoldal / Home
        </Link>
      </div>
    </section>
  );
}
