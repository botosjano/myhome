'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { isAuthed } from '@/lib/admin/auth';

/**
 * Client-side route guard. Redirects to the login page when no admin session is
 * present. Swap `isAuthed` for a Supabase session check later.
 */
export default function AdminGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (isAuthed()) {
      setReady(true);
    } else {
      router.replace('/admin/login');
    }
  }, [router]);

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-cream">
        <p className="font-sans text-sm text-navy/50">Betöltés…</p>
      </div>
    );
  }

  return <>{children}</>;
}
