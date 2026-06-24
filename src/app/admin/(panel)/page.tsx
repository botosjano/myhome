'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Building2, Mail, Plus } from 'lucide-react';
import type { Inquiry, Property } from '@/lib/types';
import { listInquiries, listProperties } from '@/lib/admin/store';

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
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);

  useEffect(() => {
    listProperties().then(setProperties);
    listInquiries().then(setInquiries);
  }, []);

  const total = properties.length;
  const active = properties.filter((p) => p.status === 'active').length;
  const hidden = properties.filter((p) => p.status === 'hidden').length;
  const sold = properties.filter((p) => p.status === 'sold').length;
  const unread = inquiries.filter((q) => !q.read).length;

  return (
    <div className="mx-auto max-w-6xl">
      <header className="mb-7">
        <h1 className="font-serif text-3xl text-navy">Áttekintés</h1>
        <p className="mt-1 font-sans text-sm text-navy/55">Üdvözöljük a My Home Budapest adminban.</p>
      </header>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        <StatCard label="Összes ingatlan" value={total} />
        <StatCard label="Aktív" value={active} />
        <StatCard label="Rejtett" value={hidden} />
        <StatCard label="Eladva" value={sold} />
        <StatCard label="Érdeklődés" value={inquiries.length} accent />
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
          href="/admin/erdeklodok"
          className="flex items-center gap-3 rounded-sm border border-navy/10 bg-white p-5 shadow-card transition-colors hover:border-gold"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-sm bg-gold/15 text-gold-dark">
            <Mail className="h-5 w-5" />
          </span>
          <span>
            <span className="block font-serif text-lg text-navy">Érdeklődők</span>
            <span className="font-sans text-xs text-navy/55">{unread} olvasatlan üzenet</span>
          </span>
        </Link>
      </div>

      {/* Latest inquiries */}
      <section className="mt-8">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-serif text-xl text-navy">Legutóbbi érdeklődések</h2>
          <Link href="/admin/erdeklodok" className="font-sans text-sm text-gold hover:text-gold-dark">
            Összes →
          </Link>
        </div>
        <div className="overflow-hidden rounded-sm border border-navy/10 bg-white shadow-card">
          {inquiries.slice(0, 5).map((q) => (
            <div
              key={q.id}
              className="flex flex-wrap items-center justify-between gap-2 border-b border-navy/5 px-5 py-3 last:border-0"
            >
              <div className="min-w-0">
                <p className="font-sans text-sm font-medium text-navy">
                  {q.name}
                  {!q.read && <span className="ml-2 inline-block h-2 w-2 rounded-full bg-gold align-middle" />}
                </p>
                <p className="truncate font-sans text-xs text-navy/55">{q.message}</p>
              </div>
              <div className="text-right font-sans text-xs text-navy/45">
                <p>{q.property_ref ?? '—'}</p>
                <p>{new Date(q.created_at).toLocaleDateString('hu-HU')}</p>
              </div>
            </div>
          ))}
          {inquiries.length === 0 && (
            <p className="px-5 py-8 text-center font-sans text-sm text-navy/45">Még nincs érdeklődés.</p>
          )}
        </div>
      </section>
    </div>
  );
}
