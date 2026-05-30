'use client';

import { useAuth } from '@/contexts/AuthContext';
import { getPreferences, savePreferences } from '@/lib/firestore';
import {
  CheckCircle,
  KeyRound,
  LogOut,
  Monitor,
  Moon,
  Sliders,
  Sun,
  UserCircle,
} from 'lucide-react';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

type ThemeVal = 'light' | 'dark' | 'system';

const CURRENCY_PRESETS = ['₹', '$', '€', '£', '¥'];

const THEME_OPTIONS: { value: ThemeVal; label: string; icon: React.ElementType }[] = [
  { value: 'light',  label: 'Light',  icon: Sun     },
  { value: 'dark',   label: 'Dark',   icon: Moon    },
  { value: 'system', label: 'System', icon: Monitor },
];

export default function ProfilePage() {
  const { user, updateUserDisplayName, updateUserPassword, signOut } = useAuth();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  /* ── display name ──────────────────────────────────────── */
  const [displayName, setDisplayName] = useState(user?.displayName ?? '');
  const [nameLoading, setNameLoading] = useState(false);
  const [nameMsg, setNameMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  /* ── password ──────────────────────────────────────────── */
  const [currentPw, setCurrentPw] = useState('');
  const [newPw,     setNewPw]     = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [pwLoading, setPwLoading] = useState(false);
  const [pwMsg,     setPwMsg]     = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  /* ── preferences ───────────────────────────────────────── */
  const [currency,    setCurrency]    = useState('₹');
  const [prefLoading, setPrefLoading] = useState(false);
  const [prefMsg,     setPrefMsg]     = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  /* ── sign-out ──────────────────────────────────────────── */
  const [soLoading, setSoLoading] = useState(false);

  useEffect(() => {
    setMounted(true);
    getPreferences()
      .then((p) => setCurrency(p.currency))
      .catch(() => {});
  }, []);

  const isEmailUser = user?.providerData.some((p) => p.providerId === 'password') ?? false;

  const initials = user?.displayName
    ? user.displayName.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
    : '?';

  /* ── handlers ──────────────────────────────────────────── */
  const handleNameSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setNameMsg(null);
    if (!displayName.trim()) { setNameMsg({ type: 'error', text: 'Name cannot be empty.' }); return; }
    setNameLoading(true);
    try {
      await updateUserDisplayName(displayName.trim());
      setNameMsg({ type: 'success', text: 'Name updated successfully.' });
    } catch {
      setNameMsg({ type: 'error', text: 'Failed to update name. Please try again.' });
    } finally { setNameLoading(false); }
  };

  const handlePasswordSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setPwMsg(null);
    if (!currentPw)            { setPwMsg({ type: 'error', text: 'Enter your current password.' }); return; }
    if (newPw.length < 6)      { setPwMsg({ type: 'error', text: 'New password must be at least 6 characters.' }); return; }
    if (newPw !== confirmPw)   { setPwMsg({ type: 'error', text: 'Passwords do not match.' }); return; }
    setPwLoading(true);
    try {
      await updateUserPassword(currentPw, newPw);
      setPwMsg({ type: 'success', text: 'Password updated successfully.' });
      setCurrentPw(''); setNewPw(''); setConfirmPw('');
    } catch (e: unknown) {
      const code = (e as { code?: string })?.code;
      if (code === 'auth/wrong-password' || code === 'auth/invalid-credential')
        setPwMsg({ type: 'error', text: 'Current password is incorrect.' });
      else if (code === 'auth/too-many-requests')
        setPwMsg({ type: 'error', text: 'Too many attempts. Please try again later.' });
      else
        setPwMsg({ type: 'error', text: 'Failed to update password. Please try again.' });
    } finally { setPwLoading(false); }
  };

  const handlePrefSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setPrefMsg(null);
    setPrefLoading(true);
    try {
      await savePreferences({ currency: currency.trim() || '₹' });
      setPrefMsg({ type: 'success', text: 'Preferences saved.' });
    } catch {
      setPrefMsg({ type: 'error', text: 'Failed to save preferences.' });
    } finally { setPrefLoading(false); }
  };

  const handleSignOut = async () => {
    setSoLoading(true);
    await signOut();
  };

  if (!user) return null;

  /* ── shared styles ─────────────────────────────────────── */
  const inputCls =
    'w-full rounded-xl border border-input bg-background px-3.5 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/50 focus:border-transparent transition-all';

  const msgCls = (type: 'success' | 'error') =>
    `flex items-center gap-1.5 rounded-xl px-3.5 py-2.5 text-xs ${
      type === 'success'
        ? 'bg-green-50 text-green-700 dark:bg-green-950/30 dark:text-green-400'
        : 'bg-red-50 text-red-600 dark:bg-red-950/30 dark:text-red-400'
    }`;

  const sectionCard = 'overflow-hidden rounded-2xl border border-border bg-card shadow-sm';
  const sectionHeader = 'flex items-center gap-2.5 border-b border-border px-5 py-3.5';
  const sectionBody = 'space-y-4 px-5 py-4';

  return (
    <div className='mx-auto max-w-lg space-y-5'>

      {/* ── Page title ───────────────────────────────────── */}
      <div>
        <h1 className='text-xl font-bold text-foreground'>Profile</h1>
        <p className='text-sm text-muted-foreground'>Manage your account, preferences and security</p>
      </div>

      {/* ── User hero card ───────────────────────────────── */}
      <div className={`${sectionCard} overflow-hidden`}>
        <div className='gradient-primary relative h-24' />
        <div className='px-5 pb-5 pt-0'>
          <div className='-mt-10 mb-3'>
            {user.photoURL ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={user.photoURL}
                alt={user.displayName ?? 'User'}
                className='h-20 w-20 rounded-2xl object-cover ring-4 ring-card shadow-lg'
              />
            ) : (
              <div className='gradient-primary flex h-20 w-20 items-center justify-center rounded-2xl text-2xl font-bold text-white ring-4 ring-card shadow-lg'>
                {initials}
              </div>
            )}
          </div>
          <div className='font-bold text-foreground text-lg leading-tight'>
            {user.displayName ?? 'User'}
          </div>
          <div className='text-sm text-muted-foreground mt-0.5'>{user.email}</div>
          <span className='mt-2 inline-flex items-center rounded-full bg-muted px-2.5 py-0.5 text-[10px] font-medium text-muted-foreground'>
            {isEmailUser ? 'Email / Password' : 'Google Account'}
          </span>
        </div>
      </div>

      {/* ── Account details ──────────────────────────────── */}
      <div className={sectionCard}>
        <div className={sectionHeader}>
          <div className='flex h-7 w-7 items-center justify-center rounded-lg bg-blue-500/10'>
            <UserCircle size={15} className='text-blue-500' />
          </div>
          <h2 className='text-sm font-semibold text-foreground'>Account Details</h2>
        </div>
        <div className={sectionBody}>
          <form onSubmit={handleNameSave} className='space-y-3'>
            <div className='space-y-1.5'>
              <label className='block text-xs font-medium text-foreground/80'>Display Name</label>
              <input type='text' value={displayName} onChange={e => setDisplayName(e.target.value)}
                placeholder='Your name' className={inputCls} autoComplete='name' />
            </div>
            <div className='space-y-1.5'>
              <label className='block text-xs font-medium text-foreground/80'>Email</label>
              <input type='email' value={user.email ?? ''} disabled
                className='w-full rounded-xl border border-input bg-muted/60 px-3.5 py-2.5 text-sm text-muted-foreground' />
            </div>
            {nameMsg && <p className={msgCls(nameMsg.type)}>{nameMsg.type === 'success' && <CheckCircle size={12} />}{nameMsg.text}</p>}
            <button type='submit' disabled={nameLoading}
              className='gradient-primary rounded-xl px-5 py-2 text-sm font-semibold transition-opacity hover:opacity-90 disabled:opacity-60'>
              {nameLoading ? 'Saving…' : 'Save Name'}
            </button>
          </form>
        </div>
      </div>

      {/* ── Preferences ──────────────────────────────────── */}
      <div className={sectionCard}>
        <div className={sectionHeader}>
          <div className='flex h-7 w-7 items-center justify-center rounded-lg bg-purple-500/10'>
            <Sliders size={15} className='text-purple-500' />
          </div>
          <h2 className='text-sm font-semibold text-foreground'>Preferences</h2>
        </div>
        <div className={sectionBody}>

          {/* Theme */}
          <div className='space-y-2'>
            <label className='block text-xs font-medium text-foreground/80'>Appearance</label>
            {mounted ? (
              <div className='grid grid-cols-3 gap-2'>
                {THEME_OPTIONS.map(({ value, label, icon: Icon }) => (
                  <button
                    key={value}
                    type='button'
                    onClick={() => setTheme(value)}
                    className={`flex flex-col items-center gap-1.5 rounded-xl border py-3 text-xs font-medium transition-all ${
                      theme === value
                        ? 'border-blue-500 bg-blue-500/10 text-blue-600 dark:text-blue-400'
                        : 'border-border text-muted-foreground hover:border-border/80 hover:bg-muted/50'
                    }`}
                  >
                    <Icon size={16} />
                    {label}
                  </button>
                ))}
              </div>
            ) : (
              <div className='grid grid-cols-3 gap-2'>
                {[0, 1, 2].map(i => (
                  <div key={i} className='h-17 animate-pulse rounded-xl bg-muted' />
                ))}
              </div>
            )}
          </div>

          {/* Currency */}
          <form onSubmit={handlePrefSave} className='space-y-3'>
            <div className='space-y-2'>
              <label className='block text-xs font-medium text-foreground/80'>Default Currency Symbol</label>
              <div className='flex flex-wrap gap-2'>
                {CURRENCY_PRESETS.map((c) => (
                  <button
                    key={c}
                    type='button'
                    onClick={() => setCurrency(c)}
                    className={`rounded-lg border px-3 py-1.5 text-sm font-medium transition-all ${
                      currency === c
                        ? 'border-blue-500 bg-blue-500/10 text-blue-600 dark:text-blue-400'
                        : 'border-border text-muted-foreground hover:bg-muted/50'
                    }`}
                  >
                    {c}
                  </button>
                ))}
                <input
                  type='text'
                  value={currency}
                  onChange={e => setCurrency(e.target.value)}
                  placeholder='Custom'
                  maxLength={4}
                  className='w-20 rounded-lg border border-input bg-background px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring/50'
                />
              </div>
            </div>
            {prefMsg && <p className={msgCls(prefMsg.type)}>{prefMsg.type === 'success' && <CheckCircle size={12} />}{prefMsg.text}</p>}
            <button type='submit' disabled={prefLoading}
              className='gradient-primary rounded-xl px-5 py-2 text-sm font-semibold transition-opacity hover:opacity-90 disabled:opacity-60'>
              {prefLoading ? 'Saving…' : 'Save Preferences'}
            </button>
          </form>
        </div>
      </div>

      {/* ── Security ─────────────────────────────────────── */}
      <div className={sectionCard}>
        <div className={sectionHeader}>
          <div className='flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500/10'>
            <KeyRound size={15} className='text-amber-500' />
          </div>
          <h2 className='text-sm font-semibold text-foreground'>Security</h2>
        </div>
        <div className={sectionBody}>
          {isEmailUser ? (
            <form onSubmit={handlePasswordSave} className='space-y-3'>
              <div className='space-y-1.5'>
                <label className='block text-xs font-medium text-foreground/80'>Current Password</label>
                <input type='password' value={currentPw} onChange={e => setCurrentPw(e.target.value)}
                  placeholder='••••••••' className={inputCls} autoComplete='current-password' />
              </div>
              <div className='space-y-1.5'>
                <label className='block text-xs font-medium text-foreground/80'>New Password</label>
                <input type='password' value={newPw} onChange={e => setNewPw(e.target.value)}
                  placeholder='Min 6 characters' className={inputCls} autoComplete='new-password' />
              </div>
              <div className='space-y-1.5'>
                <label className='block text-xs font-medium text-foreground/80'>Confirm New Password</label>
                <input type='password' value={confirmPw} onChange={e => setConfirmPw(e.target.value)}
                  placeholder='••••••••' className={inputCls} autoComplete='new-password' />
              </div>
              {pwMsg && <p className={msgCls(pwMsg.type)}>{pwMsg.type === 'success' && <CheckCircle size={12} />}{pwMsg.text}</p>}
              <button type='submit' disabled={pwLoading}
                className='gradient-primary rounded-xl px-5 py-2 text-sm font-semibold transition-opacity hover:opacity-90 disabled:opacity-60'>
                {pwLoading ? 'Updating…' : 'Update Password'}
              </button>
            </form>
          ) : (
            <p className='rounded-xl bg-muted/60 px-4 py-3 text-xs text-muted-foreground'>
              You signed in with Google. To change your password, visit your{' '}
              <a href='https://myaccount.google.com/security' target='_blank' rel='noreferrer'
                className='font-medium underline hover:text-foreground'>
                Google Account settings
              </a>.
            </p>
          )}
        </div>
      </div>

      {/* ── Sign Out ─────────────────────────────────────── */}
      <div className={sectionCard}>
        <div className={sectionHeader}>
          <div className='flex h-7 w-7 items-center justify-center rounded-lg bg-red-500/10'>
            <LogOut size={15} className='text-red-500' />
          </div>
          <h2 className='text-sm font-semibold text-foreground'>Sign Out</h2>
        </div>
        <div className={sectionBody}>
          <p className='text-xs text-muted-foreground'>
            You will be signed out of your account on this device.
          </p>
          <button
            onClick={handleSignOut}
            disabled={soLoading}
            className='flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-5 py-2 text-sm font-semibold text-red-600 transition-colors hover:bg-red-100 disabled:opacity-60 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-400 dark:hover:bg-red-950/50'
          >
            <LogOut size={14} />
            {soLoading ? 'Signing out…' : 'Sign Out'}
          </button>
        </div>
      </div>

    </div>
  );
}
