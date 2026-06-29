'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Building2, Plus } from 'lucide-react';
import type { Property } from '@/lib/types';
import { listProperties } from '@/lib/admin/store';

function StatCard({ label, value, accent }: { label: string; value: number; accent?: boolean }) {
  return (
    <div className="rounded-sm border border-navy/10 bg-white p-5 shadow-card">
      <p className="font-sans text-xs uppercase tracking-widest text-navy/45">{label}</p>
      <p className={`mt-2 font-serif text-3xl ${accent ? 'text-gold-dark' : 'text-navy'}`}>{value}</p>
    </div>
  );
}

export default function DashboardPage() {
  const [properties, setProperties] = useState<Property[]>([]);

  useEffect(() => {
    listProperties().then(setProperties);
  }, []);

  const total = properties.length;
  const active = properties.filter((p) => p.status === 'active').length;
  const hidden = properties.filter((p) => p.status === 'hidden').length;
  const sold = properties.filter((p) => p.status === 'sold').length;

  return (
    <div className="mx-auto max-w-6xl">
      <header className="mb-7">
        <h1 className="font-serif text-3xl text-navy">Áttekintés</h1>
        <p className="mt-1 font-sans text-sm text-navy/55">Üdvözöljük a My Home Budapest adminban.</p>
      </header>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard label="Összes ingatlan" value={total} accent />
        <StatCard label="Aktív" value={active} />
        <StatCard label="Rejtett" value={hidden} />
        <StatCard label="Eladva" value={sold} />
      </div>

      {/* Quick links */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <Link
          href="/admin/ingatlanok/uj"
          className="flex items-center gap-3 rounded-sm border border-navy/10 bg-white p-5 shadow-card transition-colors hover:border-gold"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-sm bg-gold/15 text-gold-dark">
            <Plus className="h-5 w-5" />
          </span>
          <span>
            <span className="block font-serif text-lg text-navy">Új ingatlan</span>
            <span className="font-sans text-xs text-navy/55">Hirdetés rögzítése</span>
          </span>
        </Link>
        <Link
          href="/admin/ingatlanok"
          className="flex items-center gap-3 rounded-sm border border-navy/10 bg-white p-5 shadow-card transition-colors hover:border-gold"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-sm bg-gold/15 text-gold-dark">
            <Building2 className="h-5 w-5" />
          </span>
          <span>
            <span className="block font-serif text-lg text-navy">Ingatlanok kezelése</span>
            <span className="font-sans text-xs text-navy/55">{total} hirdetés</span>
          </span>
        </Link>
      </div>

      {/* Leads note — inquiries now live in the GoHighLevel CRM, not here. */}
      <section className="mt-8">
        <div className="rounded-sm border border-navy/10 bg-white px-5 py-6 shadow-card">
          <h2 className="font-serif text-lg text-navy">Érdeklődők</h2>
          <p className="mt-1 font-sans text-sm text-navy/55">
            A weboldalról érkező megkeresések a GoHighLevel CRM-be kerülnek (kapcsolat + opportunity),
            ott kezelhetők. Ez a felület csak az ingatlanokat kezeli.
          </p>
        </div>
      </section>
    </div>
  );
}
