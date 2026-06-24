import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import PropertyForm from '@/components/admin/PropertyForm';

export default function NewPropertyPage() {
  return (
    <div>
      <Link
        href="/admin/ingatlanok"
        className="mb-4 inline-flex items-center gap-2 font-sans text-sm text-navy/60 transition-colors hover:text-gold"
      >
        <ArrowLeft className="h-4 w-4" />
        Vissza a listához
      </Link>
      <h1 className="mb-6 font-serif text-3xl text-navy">Új ingatlan</h1>
      <PropertyForm />
    </div>
  );
}
