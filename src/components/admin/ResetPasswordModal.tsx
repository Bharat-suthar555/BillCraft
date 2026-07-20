'use client';

import { auth } from '@/lib/firebase';
import { Check, Copy, Eye, EyeOff, KeyRound, Shuffle, X } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

interface Props {
  uid: string;
  email: string;
  onClose: () => void;
}

function generatePassword(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%';
  const bytes = new Uint32Array(14);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => chars[b % chars.length]).join('');
}

export function ResetPasswordModal({ uid, email, onClose }: Props) {
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(true);
  const [copied, setCopied] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleGenerate = () => {
    setPassword(generatePassword());
    setCopied(false);
  };

  const handleCopy = async () => {
    if (!password) return;
    await navigator.clipboard.writeText(password);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmit = async () => {
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters.');
      return;
    }
    setSaving(true);
    try {
      const token = await auth.currentUser?.getIdToken();
      const res = await fetch(`/api/admin/users/${uid}/password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ password }),
      });
      if (!res.ok) throw new Error(await res.text());
      toast.success(`Password set for ${email}`);
      onClose();
    } catch {
      toast.error('Failed to set password.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className='animate-overlay-in fixed inset-0 z-100 flex items-center justify-center bg-black/50 p-4'>
      <div className='animate-modal-in w-full max-w-sm rounded-2xl border border-border bg-card p-5 shadow-2xl'>
        <div className='mb-4 flex items-center justify-between'>
          <div className='flex items-center gap-2'>
            <div className='flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10'>
              <KeyRound size={15} className='text-amber-500' />
            </div>
            <div>
              <div className='text-sm font-semibold text-foreground'>
                Reset Password
              </div>
              <div className='truncate text-xs text-muted-foreground'>
                {email}
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className='flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground hover:bg-accent'
          >
            <X size={14} />
          </button>
        </div>

        <p className='mb-3 text-xs text-muted-foreground'>
          This sets a new password on their account immediately — no email is
          sent. Share it with them securely.
        </p>

        <div className='relative mb-3'>
          <input
            type={showPw ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder='New password'
            className='w-full rounded-lg border border-input bg-background py-2 pl-3 pr-20 text-sm font-mono focus:outline-none focus:ring-1 focus:ring-ring'
          />
          <div className='absolute right-1.5 top-1/2 flex -translate-y-1/2 items-center gap-0.5'>
            <button
              type='button'
              onClick={() => setShowPw((v) => !v)}
              title={showPw ? 'Hide' : 'Show'}
              className='rounded-md p-1.5 text-muted-foreground hover:bg-accent'
            >
              {showPw ? <EyeOff size={13} /> : <Eye size={13} />}
            </button>
            <button
              type='button'
              onClick={handleCopy}
              disabled={!password}
              title='Copy'
              className='rounded-md p-1.5 text-muted-foreground hover:bg-accent disabled:opacity-40'
            >
              {copied ? (
                <Check size={13} className='text-green-500' />
              ) : (
                <Copy size={13} />
              )}
            </button>
          </div>
        </div>

        <button
          type='button'
          onClick={handleGenerate}
          className='mb-4 flex w-full items-center justify-center gap-1.5 rounded-lg border border-border py-2 text-xs font-medium text-muted-foreground hover:bg-accent'
        >
          <Shuffle size={12} />
          Generate secure password
        </button>

        <div className='flex gap-2'>
          <button
            onClick={onClose}
            className='flex-1 rounded-lg border border-border py-2 text-sm font-medium text-muted-foreground hover:bg-accent'
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving || password.length < 6}
            className='flex-1 rounded-lg bg-amber-500 py-2 text-sm font-semibold text-white hover:bg-amber-600 disabled:opacity-50'
          >
            {saving ? 'Setting…' : 'Set Password'}
          </button>
        </div>
      </div>
    </div>
  );
}
