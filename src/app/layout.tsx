import { AppShell } from '@/components/layout/AppShell';
import { AuthProvider } from '@/contexts/AuthContext';
import type { Metadata, Viewport } from 'next';
import { Geist } from 'next/font/google';
import { ThemeProvider } from 'next-themes';
import { Toaster } from 'sonner';
import './globals.css';

const geist = Geist({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'BillCraft',
  description: 'BillCraft — Professional invoice generation system',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#125a98',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang='en' suppressHydrationWarning>
      <head>
        {/* Polyfill: some bundled libs call Image() without `new` — this allows both */}
        <script
          dangerouslySetInnerHTML={{
            __html: `try{var _I=window.Image;window.Image=function(){return new _I(...arguments)};Object.assign(window.Image,_I);window.Image.prototype=_I.prototype}catch(e){}`,
          }}
        />
      </head>
      <body className={geist.className}>
        <ThemeProvider attribute='class' defaultTheme='light' enableSystem>
          <AuthProvider>
            <AppShell>{children}</AppShell>
          </AuthProvider>
          <Toaster position='top-right' richColors />
        </ThemeProvider>
      </body>
    </html>
  );
}
