'use client';

import { useAuth } from '@/contexts/AuthContext';
import { Eye, EyeOff, FileText, Palette, Smartphone } from 'lucide-react';
import { useEffect, useState } from 'react';

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
    desc: 'Phone, tablet, laptop — install as app',
  },
];

type Tab = 'signin' | 'signup';

export default function LoginPage() {
  const { signInWithGoogle, signInWithEmail, signUpWithEmail, redirectError } =
    useAuth();
  const [tab, setTab] = useState<Tab>('signin');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [standalone, setStandalone] = useState(false);

  useEffect(() => {
    setStandalone(
      window.matchMedia('(display-mode: standalone)').matches ||
        (window.navigator as unknown as { standalone?: boolean }).standalone ===
          true,
    );
  }, []);

  useEffect(() => {
    if (redirectError) setError(redirectError);
  }, [redirectError]);

  const [siEmail, setSiEmail] = useState('');
  const [siPassword, setSiPassword] = useState('');
  const [siShowPw, setSiShowPw] = useState(false);

  const [suName, setSuName] = useState('');
  const [suEmail, setSuEmail] = useState('');
  const [suPassword, setSuPassword] = useState('');
  const [suConfirm, setSuConfirm] = useState('');
  const [suShowPw, setSuShowPw] = useState(false);

  const switchTab = (t: Tab) => {
    setTab(t);
    setError('');
  };

  const handleGoogle = async () => {
    setError('');
    setLoading(true);
    try {
      await signInWithGoogle();
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : '';
      setError(
        msg.includes('popup-closed')
          ? 'Sign-in cancelled.'
          : 'Sign-in failed. Please try again.',
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!siEmail || !siPassword) {
      setError('Please fill in all fields.');
      return;
    }
    setLoading(true);
    try {
      await signInWithEmail(siEmail, siPassword);
    } catch (e: unknown) {
      const code = (e as { code?: string })?.code;
      if (
        code === 'auth/invalid-credential' ||
        code === 'auth/user-not-found' ||
        code === 'auth/wrong-password'
      ) {
        setError('Incorrect email or password.');
      } else if (code === 'auth/too-many-requests') {
        setError('Too many attempts. Please try again later.');
      } else {
        setError('Sign-in failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!suName.trim()) {
      setError('Please enter your name.');
      return;
    }
    if (!suEmail) {
      setError('Please enter your email.');
      return;
    }
    if (suPassword.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (suPassword !== suConfirm) {
      setError('Passwords do not match.');
      return;
    }
    setLoading(true);
    try {
      await signUpWithEmail(suEmail, suPassword, suName.trim());
    } catch (e: unknown) {
      const code = (e as { code?: string })?.code;
      if (code === 'auth/email-already-in-use')
        setError('An account with this email already exists.');
      else if (code === 'auth/invalid-email')
        setError('Invalid email address.');
      else if (code === 'auth/weak-password')
        setError('Password is too weak. Choose a stronger one.');
      else if (code === 'auth/operation-not-allowed')
        setError(
          'Email sign-up is not enabled. Enable it in Firebase Console.',
        );
      else setError(`Sign-up failed: ${code ?? 'unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const inputCls =
    'w-full rounded-xl border border-input bg-background/70 px-3.5 py-2.5 text-sm placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-ring/50 focus:border-transparent transition-all';

  return (
    <div className='relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-4 py-12'>
      {/* ── Gradient background ─────────────────────────────────── */}
      <div className='pointer-events-none fixed inset-0 bg-gradient-to-br from-slate-50 via-white to-blue-50/40 dark:from-[#0a0a0f] dark:via-[#0d0d18] dark:to-[#0f0a1a]' />

      {/* ── Animated orbs ──────────────────────────────────────── */}
      <div className='pointer-events-none fixed inset-0 overflow-hidden'>
        <div className='auth-orb-1 absolute -left-56 -top-56 h-[650px] w-[650px] rounded-full bg-blue-500/20 blur-3xl dark:bg-blue-600/12' />
        <div className='auth-orb-2 absolute -bottom-56 -right-56 h-[750px] w-[750px] rounded-full bg-purple-600/20 blur-3xl dark:bg-purple-700/12' />
        <div className='auth-orb-3 absolute right-1/4 top-1/3 h-[450px] w-[450px] rounded-full bg-indigo-400/12 blur-3xl dark:bg-indigo-500/8' />
      </div>

      {/* ── Content ────────────────────────────────────────────── */}
      <div className='relative w-full max-w-sm'>
        {/* Logo */}
        <div className='auth-fade-up mb-8 flex flex-col items-center gap-3'>
          <div className='auth-logo-glow flex h-16 w-16 items-center justify-center rounded-2xl bg-white p-2'>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src='/logo-mark.png'
              alt='BillCraft'
              className='h-full w-full object-contain'
            />
          </div>
          <div className='text-center'>
            <div className='gradient-text text-3xl font-black tracking-tight'>
              BillCraft
            </div>
            <p className='mt-0.5 text-xs text-muted-foreground'>
              Professional Invoice Management
            </p>
          </div>
        </div>

        {/* Card */}
        <div className='auth-fade-up-delay space-y-4 rounded-2xl border border-border/60 bg-card/90 p-5 shadow-2xl shadow-black/10 backdrop-blur-xl dark:border-border/40 dark:bg-card/80'>
          {/* Tab switcher */}
          <div className='flex gap-1 rounded-xl bg-muted/70 p-1'>
            {(['signin', 'signup'] as Tab[]).map((t) => (
              <button
                key={t}
                onClick={() => switchTab(t)}
                className={`flex-1 rounded-lg py-2 text-xs font-semibold transition-all duration-200 ${
                  tab === t
                    ? 'bg-card text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {t === 'signin' ? 'Sign In' : 'Sign Up'}
              </button>
            ))}
          </div>

          {/* Error */}
          {error && (
            <p className='rounded-xl bg-red-50 px-3.5 py-2.5 text-xs text-red-600 dark:bg-red-950/40 dark:text-red-400'>
              {error}
            </p>
          )}

          {/* Sign In form */}
          {tab === 'signin' ? (
            <form onSubmit={handleSignIn} className='space-y-3'>
              <div className='space-y-1.5'>
                <label className='block text-xs font-medium text-foreground/80'>
                  Email
                </label>
                <input
                  type='email'
                  value={siEmail}
                  onChange={(e) => setSiEmail(e.target.value)}
                  placeholder='you@example.com'
                  className={inputCls}
                  autoComplete='email'
                />
              </div>
              <div className='space-y-1.5'>
                <label className='block text-xs font-medium text-foreground/80'>
                  Password
                </label>
                <div className='relative'>
                  <input
                    type={siShowPw ? 'text' : 'password'}
                    value={siPassword}
                    onChange={(e) => setSiPassword(e.target.value)}
                    placeholder='••••••••'
                    className={`${inputCls} pr-10`}
                    autoComplete='current-password'
                  />
                  <button
                    type='button'
                    onClick={() => setSiShowPw((p) => !p)}
                    className='absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground'
                  >
                    {siShowPw ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>
              <button
                type='submit'
                disabled={loading}
                className='gradient-primary w-full rounded-xl py-2.5 text-sm font-semibold transition-opacity hover:opacity-90 disabled:opacity-60'
              >
                {loading ? 'Signing in…' : 'Sign In'}
              </button>
            </form>
          ) : (
            /* Sign Up form */
            <form onSubmit={handleSignUp} className='space-y-3'>
              <div className='space-y-1.5'>
                <label className='block text-xs font-medium text-foreground/80'>
                  Full Name
                </label>
                <input
                  type='text'
                  value={suName}
                  onChange={(e) => setSuName(e.target.value)}
                  placeholder='Your Name'
                  className={inputCls}
                  autoComplete='name'
                />
              </div>
              <div className='space-y-1.5'>
                <label className='block text-xs font-medium text-foreground/80'>
                  Email
                </label>
                <input
                  type='email'
                  value={suEmail}
                  onChange={(e) => setSuEmail(e.target.value)}
                  placeholder='you@example.com'
                  className={inputCls}
                  autoComplete='email'
                />
              </div>
              <div className='space-y-1.5'>
                <label className='block text-xs font-medium text-foreground/80'>
                  Password
                </label>
                <div className='relative'>
                  <input
                    type={suShowPw ? 'text' : 'password'}
                    value={suPassword}
                    onChange={(e) => setSuPassword(e.target.value)}
                    placeholder='Min 6 characters'
                    className={`${inputCls} pr-10`}
                    autoComplete='new-password'
                  />
                  <button
                    type='button'
                    onClick={() => setSuShowPw((p) => !p)}
                    className='absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground'
                  >
                    {suShowPw ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>
              <div className='space-y-1.5'>
                <label className='block text-xs font-medium text-foreground/80'>
                  Confirm Password
                </label>
                <input
                  type='password'
                  value={suConfirm}
                  onChange={(e) => setSuConfirm(e.target.value)}
                  placeholder='••••••••'
                  className={inputCls}
                  autoComplete='new-password'
                />
              </div>
              <button
                type='submit'
                disabled={loading}
                className='gradient-primary w-full rounded-xl py-2.5 text-sm font-semibold transition-opacity hover:opacity-90 disabled:opacity-60'
              >
                {loading ? 'Creating account…' : 'Create Account'}
              </button>
            </form>
          )}

          {/* Divider */}
          <div className='relative'>
            <div className='absolute inset-0 flex items-center'>
              <div className='w-full border-t border-border/60' />
            </div>
            <div className='relative flex justify-center'>
              <span className='bg-card/90 px-3 text-[11px] text-muted-foreground backdrop-blur-sm'>
                or continue with
              </span>
            </div>
          </div>

          {/* Google button */}
          <button
            onClick={handleGoogle}
            disabled={loading}
            className='flex w-full items-center justify-center gap-3 rounded-xl border border-border/70 bg-background/60 px-4 py-2.5 text-sm font-medium text-foreground shadow-sm backdrop-blur-sm transition-colors hover:bg-accent disabled:opacity-60'
          >
            {loading ? (
              <span className='h-4 w-4 animate-spin rounded-full border-2 border-muted-foreground border-t-transparent' />
            ) : (
              <GoogleIcon />
            )}
            {loading ? 'Please wait…' : 'Continue with Google'}
          </button>

          {standalone && (
            <p className='rounded-xl bg-amber-50 px-3.5 py-2.5 text-center text-[11px] text-amber-700 dark:bg-amber-950/30 dark:text-amber-400'>
              Google sign-in can be unreliable in the installed app on iOS. If
              it doesn&apos;t work, use email &amp; password above, or open this
              site in Safari once to sign in with Google — it&apos;ll carry over
              here.
            </p>
          )}

          <p className='text-center text-[11px] text-muted-foreground/70'>
            Your data is private and only visible to you.
          </p>
        </div>

        {/* Feature list — sign-in only */}
        {tab === 'signin' && (
          <div
            className='auth-fade-up mt-7 space-y-3.5'
            style={{ animationDelay: '0.2s' }}
          >
            {FEATURES.map(({ icon: Icon, label, desc }) => (
              <div key={label} className='flex items-start gap-3'>
                <div className='mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#1890ff]/10'>
                  <Icon size={14} className='text-[#1890ff]' />
                </div>
                <div>
                  <div className='text-xs font-medium text-foreground'>
                    {label}
                  </div>
                  <div className='text-[11px] text-muted-foreground'>
                    {desc}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
