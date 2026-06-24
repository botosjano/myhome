'use client';

import { useEffect, useState } from 'react';
import { Mail, MailOpen, Phone, Trash2 } from 'lucide-react';
import type { Inquiry } from '@/lib/types';
import { deleteInquiry, listInquiries, setInquiryRead } from '@/lib/admin/store';
import { cn } from '@/lib/utils';

export default function AdminInquiriesPage() {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);

  const reload = () => listInquiries().then(setInquiries);
  useEffect(() => {
    reload();
  }, []);

  const onToggleRead = async (q: Inquiry) => {
    await setInquiryRead(q.id, !q.read);
    reload();
  };
  const onDelete = async (id: string) => {
    if (window.confirm('Biztosan törli ezt az érdeklődést?')) {
      await deleteInquiry(id);
      reload();
    }
  };

  return (
    <div className="mx-auto max-w-5xl">
      <header className="mb-6">
        <h1 className="font-serif text-3xl text-navy">Érdeklődők</h1>
        <p className="mt-1 font-sans text-sm text-navy/55">
          {inquiries.length} üzenet · {inquiries.filter((q) => !q.read).length} olvasatlan
        </p>
      </header>

      <div className="space-y-3">
        {inquiries.map((q) => (
          <article
            key={q.id}
            className={cn(
              'rounded-sm border bg-white p-5 shadow-card',
              q.read ? 'border-navy/10' : 'border-gold/50',
            )}
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="font-serif text-lg text-navy">
                  {q.name}
                  {!q.read && (
                    <span className="ml-2 rounded-sm bg-gold/20 px-1.5 py-0.5 align-middle font-sans text-[10px] font-medium uppercase tracking-wide text-gold-dark">
                      Új
                    </span>
                  )}
                </p>
                <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 font-sans text-xs text-navy/55">
                  <a href={`mailto:${q.email}`} className="flex items-center gap-1 hover:text-gold">
                    <Mail className="h-3.5 w-3.5" />
                    {q.email}
                  </a>
                  <a href={`tel:${q.phone}`} className="flex items-center gap-1 hover:text-gold">
                    <Phone className="h-3.5 w-3.5" />
                    {q.phone}
                  </a>
                  {q.property_ref && <span>Ingatlan: {q.property_ref}</span>}
                  <span>{new Date(q.created_at).toLocaleString('hu-HU')}</span>
                </div>
              </div>

              <div className="flex shrink-0 gap-1">
                <button
                  type="button"
                  onClick={() => onToggleRead(q)}
                  title={q.read ? 'Megjelölés olvasatlanként' : 'Megjelölés olvasottként'}
                  className="rounded-sm p-2 text-navy/50 transition-colors hover:bg-navy/5 hover:text-navy"
                >
                  {q.read ? <Mail className="h-4 w-4" /> : <MailOpen className="h-4 w-4" />}
                </button>
                <button
                  type="button"
                  onClick={() => onDelete(q.id)}
                  title="Törlés"
                  className="rounded-sm p-2 text-navy/50 transition-colors hover:bg-red-50 hover:text-red-600"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>

            <p className="mt-3 whitespace-pre-line font-sans text-sm leading-relaxed text-navy/75">
              {q.message}
            </p>
          </article>
        ))}
        {inquiries.length === 0 && (
          <p className="rounded-sm border border-navy/10 bg-white px-5 py-10 text-center font-sans text-sm text-navy/45 shadow-card">
            Még nincs érdeklődés.
          </p>
        )}
      </div>
    </div>
  );
}
