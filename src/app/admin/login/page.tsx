'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Lock } from 'lucide-react';
import { DEMO_EMAIL, login } from '@/lib/admin/auth';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (login(email, password)) {
      router.replace('/admin');
    } else {
      setError(true);
    }
  };

  const field =
    'w-full rounded-sm border border-navy/15 bg-white px-3.5 py-2.5 font-sans text-sm text-navy ' +
    'focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold';

  return (
    <div className="flex min-h-screen items-center justify-center bg-navy-900 px-5">
      <form
        onSubmit={submit}
        className="w-full max-w-sm rounded-sm border border-white/10 bg-white p-8 shadow-luxe"
      >
        <div className="mb-6 text-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="My Home Budapest" className="mx-auto h-16 w-16 object-contain" />
          <h1 className="mt-3 font-serif text-2xl text-navy">Admin belépés</h1>
          <p className="mt-1 font-sans text-xs uppercase tracking-widest text-gold">My Home Budapest</p>
        </div>

        <label className="mb-1.5 block font-sans text-xs font-medium uppercase tracking-wide text-navy/60">
          E-mail
        </label>
        <input
          type="email"
          autoComplete="username"
          className={field}
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            setError(false);
          }}
          placeholder={DEMO_EMAIL}
        />

        <label className="mb-1.5 mt-4 block font-sans text-xs font-medium uppercase tracking-wide text-navy/60">
          Jelszó
        </label>
        <input
          type="password"
          autoComplete="current-password"
          className={field}
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            setError(false);
          }}
        />

        {error && (
          <p className="mt-3 font-sans text-sm text-red-600">Hibás e-mail vagy jelszó.</p>
        )}

        <button
          type="submit"
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-sm bg-gold px-6 py-3 font-sans text-sm font-semibold uppercase tracking-wide text-navy transition-colors hover:bg-gold-light"
        >
          <Lock className="h-4 w-4" />
          Belépés
        </button>

        <p className="mt-4 text-center font-sans text-[11px] text-navy/40">
          Demó belépés: {DEMO_EMAIL} / myhome2026
        </p>
      </form>
    </div>
  );
}
