'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Building2, LayoutDashboard, LogOut, Mail, Menu, X } from 'lucide-react';
import { logout } from '@/lib/admin/auth';
import { cn } from '@/lib/utils';

const NAV = [
  { href: '/admin', label: 'Áttekintés', icon: LayoutDashboard, exact: true },
  { href: '/admin/ingatlanok', label: 'Ingatlanok', icon: Building2, exact: false },
  { href: '/admin/erdeklodok', label: 'Érdeklődők', icon: Mail, exact: false },
];

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const onLogout = () => {
    logout();
    router.replace('/admin/login');
  };

  const isActive = (href: string, exact: boolean) =>
    exact ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);

  const navLinks = (
    <nav className="space-y-1">
      {NAV.map((item) => {
        const active = isActive(item.href, item.exact);
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setOpen(false)}
            className={cn(
              'flex items-center gap-3 rounded-sm px-3 py-2.5 font-sans text-sm transition-colors',
              active ? 'bg-gold text-navy' : 'text-white/75 hover:bg-white/10 hover:text-white',
            )}
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );

  const sidebarInner = (
    <div className="flex h-full flex-col">
      <Link href="/admin" onClick={() => setOpen(false)} className="flex items-center gap-3 px-2 py-1">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo.png" alt="My Home Budapest" className="h-11 w-11 object-contain" />
        <div className="leading-tight">
          <p className="font-serif text-lg text-white">My Home</p>
          <p className="font-sans text-[10px] uppercase tracking-widest text-gold">Admin</p>
        </div>
      </Link>

      <div className="mt-8 flex-1">{navLinks}</div>

      <button
        type="button"
        onClick={onLogout}
        className="flex items-center gap-3 rounded-sm px-3 py-2.5 font-sans text-sm text-white/60 transition-colors hover:bg-white/10 hover:text-white"
      >
        <LogOut className="h-4 w-4" />
        Kijelentkezés
      </button>
    </div>
  );

  return (
    <div className="min-h-screen lg:flex">
      {/* Desktop sidebar */}
      <aside className="hidden w-64 shrink-0 bg-navy-900 p-5 lg:block">
        <div className="sticky top-5 h-[calc(100vh-2.5rem)]">{sidebarInner}</div>
      </aside>

      {/* Mobile top bar */}
      <div className="flex items-center justify-between bg-navy-900 px-4 py-3 lg:hidden">
        <Link href="/admin" className="flex items-center gap-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="My Home Budapest" className="h-8 w-8 object-contain" />
          <span className="font-serif text-base text-white">Admin</span>
        </Link>
        <button type="button" onClick={() => setOpen(true)} aria-label="Menü" className="text-white">
          <Menu className="h-6 w-6" />
        </button>
      </div>

      {/* Mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-navy/60" onClick={() => setOpen(false)} />
          <div className="absolute inset-y-0 left-0 w-72 max-w-[85%] bg-navy-900 p-5">
            <div className="mb-2 flex justify-end">
              <button type="button" onClick={() => setOpen(false)} aria-label="Bezárás" className="text-white">
                <X className="h-6 w-6" />
              </button>
            </div>
            {sidebarInner}
          </div>
        </div>
      )}

      {/* Content */}
      <main className="min-w-0 flex-1 bg-cream px-5 py-7 lg:px-10 lg:py-9">{children}</main>
    </div>
  );
}
