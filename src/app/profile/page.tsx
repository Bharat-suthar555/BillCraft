'use client';

import { useAuth } from '@/contexts/AuthContext';
import { CheckCircle, KeyRound, UserCircle } from 'lucide-react';
import { useState } from 'react';

export default function ProfilePage() {
  const { user, updateUserDisplayName, updateUserPassword } = useAuth();

  const [displayName, setDisplayName] = useState(user?.displayName ?? '');
  const [nameLoading, setNameLoading] = useState(false);
  const [nameMsg, setNameMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [pwLoading, setPwLoading] = useState(false);
  const [pwMsg, setPwMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const isEmailUser = user?.providerData.some((p) => p.providerId === 'password') ?? false;

  const initials = user?.displayName
    ? user.displayName
        .split(' ')
        .map((n) => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    : '?';

  const handleNameSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setNameMsg(null);
    if (!displayName.trim()) {
      setNameMsg({ type: 'error', text: 'Name cannot be empty.' });
      return;
    }
    setNameLoading(true);
    try {
      await updateUserDisplayName(displayName.trim());
      setNameMsg({ type: 'success', text: 'Name updated successfully.' });
    } catch {
      setNameMsg({ type: 'error', text: 'Failed to update name. Please try again.' });
    } finally {
      setNameLoading(false);
    }
  };

  const handlePasswordSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwMsg(null);
    if (!currentPw) {
      setPwMsg({ type: 'error', text: 'Enter your current password.' });
      return;
    }
    if (newPw.length < 6) {
      setPwMsg({ type: 'error', text: 'New password must be at least 6 characters.' });
      return;
    }
    if (newPw !== confirmPw) {
      setPwMsg({ type: 'error', text: 'Passwords do not match.' });
      return;
    }
    setPwLoading(true);
    try {
      await updateUserPassword(currentPw, newPw);
      setPwMsg({ type: 'success', text: 'Password updated successfully.' });
      setCurrentPw('');
      setNewPw('');
      setConfirmPw('');
    } catch (e: unknown) {
      const code = (e as { code?: string })?.code;
      if (code === 'auth/wrong-password' || code === 'auth/invalid-credential') {
        setPwMsg({ type: 'error', text: 'Current password is incorrect.' });
      } else if (code === 'auth/too-many-requests') {
        setPwMsg({ type: 'error', text: 'Too many attempts. Please try again later.' });
      } else {
        setPwMsg({ type: 'error', text: 'Failed to update password. Please try again.' });
      }
    } finally {
      setPwLoading(false);
    }
  };

  if (!user) return null;

  const inputCls =
    'w-full rounded-lg border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring';

  const msgCls = (type: 'success' | 'error') =>
    `flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs ${
      type === 'success'
        ? 'bg-green-50 text-green-700 dark:bg-green-950/30 dark:text-green-400'
        : 'bg-red-50 text-red-600 dark:bg-red-950/30 dark:text-red-400'
    }`;

  return (
    <div className='mx-auto max-w-lg space-y-6'>
      <div>
        <h1 className='text-xl font-semibold text-foreground'>Profile</h1>
        <p className='text-sm text-muted-foreground'>Manage your account details and security</p>
      </div>

      {/* User summary card */}
      <div className='tdc-card flex items-center gap-4'>
        {user.photoURL ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={user.photoURL}
            alt={user.displayName ?? 'User'}
            className='h-16 w-16 rounded-full object-cover ring-2 ring-border'
          />
        ) : (
          <div className='gradient-primary flex h-16 w-16 shrink-0 items-center justify-center rounded-full text-xl font-bold text-white'>
            {initials}
          </div>
        )}
        <div className='min-w-0'>
          <div className='truncate font-semibold text-foreground'>
            {user.displayName ?? 'User'}
          </div>
          <div className='truncate text-sm text-muted-foreground'>{user.email}</div>
          <span className='mt-1 inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground'>
            {isEmailUser ? 'Email / Password' : 'Google Account'}
          </span>
        </div>
      </div>

      {/* Account details */}
      <div className='tdc-card space-y-4'>
        <div className='flex items-center gap-2'>
          <UserCircle size={16} className='text-muted-foreground' />
          <h2 className='text-sm font-semibold text-foreground'>Account Details</h2>
        </div>
        <form onSubmit={handleNameSave} className='space-y-3'>
          <div>
            <label className='mb-1 block text-xs font-medium text-foreground'>Display Name</label>
            <input
              type='text'
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder='Your name'
              className={inputCls}
              autoComplete='name'
            />
          </div>
          <div>
            <label className='mb-1 block text-xs font-medium text-foreground'>Email</label>
            <input
              type='email'
              value={user.email ?? ''}
              disabled
              className='w-full rounded-lg border border-input bg-muted px-3 py-2 text-sm text-muted-foreground'
            />
          </div>
          {nameMsg && (
            <p className={msgCls(nameMsg.type)}>
              {nameMsg.type === 'success' && <CheckCircle size={12} />}
              {nameMsg.text}
            </p>
          )}
          <button
            type='submit'
            disabled={nameLoading}
            className='gradient-primary rounded-lg px-4 py-2 text-sm font-medium transition-opacity hover:opacity-90 disabled:opacity-60'
          >
            {nameLoading ? 'Saving…' : 'Save Name'}
          </button>
        </form>
      </div>

      {/* Security / password */}
      <div className='tdc-card space-y-4'>
        <div className='flex items-center gap-2'>
          <KeyRound size={16} className='text-muted-foreground' />
          <h2 className='text-sm font-semibold text-foreground'>Security</h2>
        </div>

        {isEmailUser ? (
          <form onSubmit={handlePasswordSave} className='space-y-3'>
            <div>
              <label className='mb-1 block text-xs font-medium text-foreground'>
                Current Password
              </label>
              <input
                type='password'
                value={currentPw}
                onChange={(e) => setCurrentPw(e.target.value)}
                placeholder='••••••••'
                className={inputCls}
                autoComplete='current-password'
              />
            </div>
            <div>
              <label className='mb-1 block text-xs font-medium text-foreground'>New Password</label>
              <input
                type='password'
                value={newPw}
                onChange={(e) => setNewPw(e.target.value)}
                placeholder='Min 6 characters'
                className={inputCls}
                autoComplete='new-password'
              />
            </div>
            <div>
              <label className='mb-1 block text-xs font-medium text-foreground'>
                Confirm New Password
              </label>
              <input
                type='password'
                value={confirmPw}
                onChange={(e) => setConfirmPw(e.target.value)}
                placeholder='••••••••'
                className={inputCls}
                autoComplete='new-password'
              />
            </div>
            {pwMsg && (
              <p className={msgCls(pwMsg.type)}>
                {pwMsg.type === 'success' && <CheckCircle size={12} />}
                {pwMsg.text}
              </p>
            )}
            <button
              type='submit'
              disabled={pwLoading}
              className='gradient-primary rounded-lg px-4 py-2 text-sm font-medium transition-opacity hover:opacity-90 disabled:opacity-60'
            >
              {pwLoading ? 'Updating…' : 'Update Password'}
            </button>
          </form>
        ) : (
          <p className='rounded-lg bg-muted px-3 py-3 text-xs text-muted-foreground'>
            You signed in with Google. To change your password, visit your{' '}
            <a
              href='https://myaccount.google.com/security'
              target='_blank'
              rel='noreferrer'
              className='underline hover:text-foreground'
            >
              Google Account settings
            </a>
            .
          </p>
        )}
      </div>
    </div>
  );
}
