'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import type { Property } from '@/lib/types';
import { getProperty } from '@/lib/admin/store';
import PropertyForm from '@/components/admin/PropertyForm';

export default function EditPropertyPage() {
  const params = useParams<{ id: string }>();
  const [property, setProperty] = useState<Property | null | undefined>(undefined);

  useEffect(() => {
    if (params?.id) getProperty(params.id).then((p) => setProperty(p ?? null));
  }, [params?.id]);

  return (
    <div>
      <Link
        href="/admin/ingatlanok"
        className="mb-4 inline-flex items-center gap-2 font-sans text-sm text-navy/60 transition-colors hover:text-gold"
      >
        <ArrowLeft className="h-4 w-4" />
        Vissza a listához
      </Link>
      <h1 className="mb-6 font-serif text-3xl text-navy">Ingatlan szerkesztése</h1>

      {property === undefined && <p className="font-sans text-sm text-navy/50">Betöltés…</p>}
      {property === null && (
        <p className="font-sans text-sm text-red-600">A keresett ingatlan nem található.</p>
      )}
      {property && <PropertyForm initial={property} />}
    </div>
  );
}
