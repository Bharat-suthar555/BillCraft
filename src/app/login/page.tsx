'use client';

import { useAuth } from '@/contexts/AuthContext';
import { FileText, Palette, Smartphone } from 'lucide-react';
import { useState } from 'react';

function GoogleIcon() {
  return (
    <svg width='18' height='18' viewBox='0 0 18 18' fill='none'>
      <path
        d='M16.51 8H8.98v3h4.3c-.18 1-.74 1.48-1.6 2.04v2.01h2.6a7.8 7.8 0 0 0 2.38-5.88c0-.57-.05-.66-.15-1.18z'
        fill='#4285F4'
      />
      <path
        d='M8.98 17c2.16 0 3.97-.72 5.3-1.94l-2.6-2.01c-.72.48-1.63.76-2.7.76a4.85 4.85 0 0 1-4.57-3.35H1.73v2.07A8 8 0 0 0 8.98 17z'
        fill='#34A853'
      />
      <path
        d='M4.41 10.46A4.92 4.92 0 0 1 4.16 9c0-.51.09-1 .25-1.46V5.47H1.73A8 8 0 0 0 .98 9c0 1.29.31 2.51.75 3.53l2.68-2.07z'
        fill='#FBBC05'
      />
      <path
        d='M8.98 3.58c1.22 0 2.31.42 3.17 1.24l2.38-2.38C13 1.13 11.18.38 8.98.38A8 8 0 0 0 1.73 5.47L4.41 7.54A4.85 4.85 0 0 1 8.98 3.58z'
        fill='#EA4335'
      />
    </svg>
  );
}

const FEATURES = [
  {
    icon: FileText,
    label: 'Create & save invoices',
    desc: 'Build professional invoices in seconds',
  },
  {
    icon: Palette,
    label: 'Custom templates',
    desc: 'Personalise colors, logo and branding',
  },
  {
    icon: Smartphone,
    label: 'Works on all devices',
    desc: 'Phone, tablet, laptop — install as an app',
  },
];

export default function LoginPage() {
  const { signInWithGoogle } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSignIn = async () => {
    setError('');
    setLoading(true);
    try {
      await signInWithGoogle();
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Sign-in failed';
      setError(
        msg.includes('popup-closed')
          ? 'Sign-in cancelled.'
          : 'Sign-in failed. Please try again.',
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='flex min-h-screen flex-col items-center justify-center bg-background px-4 py-12'>
      <div className='w-full max-w-sm'>
        {/* Logo */}
        <div className='mb-8 flex flex-col items-center gap-3'>
          <div className='gradient-primary flex h-16 w-16 items-center justify-center rounded-2xl text-xl font-black text-white shadow-lg shadow-blue-500/20'>
            BC
          </div>
          <span className='gradient-text text-3xl font-black tracking-tight'>BillCraft</span>
        </div>

        {/* Sign-in card */}
        <div className='tdc-card space-y-5'>
          <div className='text-center'>
            <h2 className='text-base font-semibold text-foreground'>
              Welcome back
            </h2>
            <p className='mt-1 text-xs text-muted-foreground'>
              Sign in to manage your invoices
            </p>
          </div>

          {error && (
            <p className='rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600 dark:bg-red-950/30 dark:text-red-400'>
              {error}
            </p>
          )}

          <button
            onClick={handleSignIn}
            disabled={loading}
            className='flex w-full items-center justify-center gap-3 rounded-xl border border-border bg-card px-4 py-3 text-sm font-medium text-foreground shadow-sm transition-colors hover:bg-accent disabled:opacity-60'
          >
            {loading ? (
              <span className='h-4 w-4 animate-spin rounded-full border-2 border-muted-foreground border-t-transparent' />
            ) : (
              <GoogleIcon />
            )}
            {loading ? 'Signing in…' : 'Continue with Google'}
          </button>

          <p className='text-center text-[11px] text-muted-foreground'>
            Your data is private and only visible to you.
          </p>
        </div>

        {/* Feature list */}
        <div className='mt-6 space-y-3'>
          {FEATURES.map(({ icon: Icon, label, desc }) => (
            <div key={label} className='flex items-start gap-3'>
              <div className='mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#1890ff]/10'>
                <Icon size={14} className='text-[#1890ff]' />
              </div>
              <div>
                <div className='text-xs font-medium text-foreground'>
                  {label}
                </div>
                <div className='text-[11px] text-muted-foreground'>{desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
