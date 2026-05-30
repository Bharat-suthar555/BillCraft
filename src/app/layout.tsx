import { MobileBottomNav, Sidebar } from '@/components/layout/Sidebar';
import { ThemeToggle } from '@/components/layout/ThemeToggle';
import type { Metadata, Viewport } from 'next';
import { Geist } from 'next/font/google';
import Link from 'next/link';
import { ThemeProvider } from 'next-themes';
import { Toaster } from 'sonner';
import './globals.css';

const geist = Geist({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'InvoiceGen',
  description: 'Create, customise and download professional invoices',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang='en' suppressHydrationWarning>
      <body className={geist.className}>
        <ThemeProvider attribute='class' defaultTheme='light' enableSystem>
          <div className='flex h-screen overflow-hidden bg-background'>
            {/* ── Sidebar (desktop) ──────────────────────── */}
            <div className='hidden sm:flex'>
              <Sidebar />
            </div>

            {/* ── Right column: header + content ─────────── */}
            <div className='flex flex-1 flex-col overflow-hidden'>
              {/* Top header */}
              <header className='flex h-14 shrink-0 items-center justify-between border-b border-border bg-card px-4 sm:px-6'>
                {/* Mobile: App logo */}
                <Link href='/' className='flex items-center gap-2 sm:hidden'>
                  <div className='gradient-primary flex h-7 w-7 items-center justify-center rounded-lg text-xs font-black'>
                    IV
                  </div>
                  <span className='gradient-text font-bold text-sm'>
                    InvoiceGen
                  </span>
                </Link>

                {/* Desktop: breadcrumb area — children pages inject their title */}
                <div className='hidden sm:block'>
                  <span className='text-sm text-muted-foreground'>
                    Invoice Management
                  </span>
                </div>

                {/* Right: actions */}
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

              {/* Page content */}
              <main className='flex-1 overflow-y-auto p-4 sm:p-6 pb-24 sm:pb-6'>
                {children}
              </main>
            </div>
          </div>

          {/* ── Mobile bottom nav ─────────────────────────── */}
          <MobileBottomNav />

          <Toaster position='top-right' richColors />
        </ThemeProvider>
      </body>
    </html>
  );
}
