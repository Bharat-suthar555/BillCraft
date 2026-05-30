'use client';

import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { MobileBottomNav, Sidebar } from './Sidebar';
import { ThemeToggle } from './ThemeToggle';

export function AppShell({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const isLoginPage = pathname === '/login';

  useEffect(() => {
    if (loading) return;
    if (!user && !isLoginPage) router.replace('/login');
    if (user && isLoginPage) router.replace('/invoices');
  }, [user, loading, isLoginPage, router]);

  // Register service worker for PWA
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {});
    }
  }, []);

  if (loading) {
    return (
      <div className='flex h-screen flex-col items-center justify-center gap-4 bg-background'>
        <span className='gradient-text text-2xl font-black tracking-tight'>BillCraft</span>
        <Loader2 className='animate-spin text-muted-foreground' size={20} />
      </div>
    );
  }

  // Login page: render bare — no sidebar, no header
  if (isLoginPage) return <>{children}</>;

  // Unauthenticated and not on login: blank while redirect fires
  if (!user) return null;

  return (
    <>
      <div className='flex h-screen overflow-hidden bg-background'>
        {/* Sidebar — desktop only */}
        <div className='hidden sm:flex'>
          <Sidebar />
        </div>

        {/* Right column */}
        <div className='flex flex-1 flex-col overflow-hidden'>
          <header className='flex h-14 shrink-0 items-center justify-between border-b border-border bg-card px-4 sm:px-6'>
            {/* Mobile: app name */}
            <Link href='/' className='flex items-center gap-2 sm:hidden'>
              <span className='gradient-text text-lg font-black tracking-tight'>BillCraft</span>
            </Link>

            {/* Desktop: label */}
            <div className='hidden sm:block'>
              <span className='text-sm text-muted-foreground'>
                Invoice Management
              </span>
            </div>

            <div className='flex items-center gap-2'>
              <ThemeToggle />
              <Link
                href='/invoices/new'
                className='gradient-primary hidden sm:inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-opacity hover:opacity-90'
              >
                + New Invoice
              </Link>
            </div>
          </header>

          <main className='flex-1 overflow-y-auto p-4 sm:p-6 pb-24 sm:pb-6'>
            {children}
          </main>
        </div>
      </div>

      {/* Fixed mobile bottom nav */}
      <MobileBottomNav />
    </>
  );
}
