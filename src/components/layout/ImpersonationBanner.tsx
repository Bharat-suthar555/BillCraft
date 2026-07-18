'use client';

import { auth } from '@/lib/firebase';
import {
  clearImpersonation,
  getImpersonation,
  ImpersonationState,
} from '@/lib/impersonation';
import { signInWithCustomToken } from 'firebase/auth';
import { AlertTriangle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export function ImpersonationBanner() {
  const [state, setState] = useState<ImpersonationState | null>(null);
  const [returning, setReturning] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setState(getImpersonation());
  }, []);

  if (!state) return null;

  const handleReturn = async () => {
    setReturning(true);
    try {
      await signInWithCustomToken(auth, state.adminReturnToken);
    } finally {
      clearImpersonation();
      router.push('/admin');
    }
  };

  return (
    <div className='flex shrink-0 flex-wrap items-center justify-center gap-2 bg-amber-400 px-3 py-2 text-center text-xs font-medium text-black sm:px-4'>
      <AlertTriangle size={13} className='shrink-0' />
      <span>
        Impersonating <strong>{state.targetEmail}</strong> — actions here affect
        their real account.
      </span>
      <button
        onClick={handleReturn}
        disabled={returning}
        className='rounded-md bg-black/10 px-2.5 py-1 font-semibold hover:bg-black/20 disabled:opacity-60'
      >
        {returning ? 'Returning…' : 'Return to Admin'}
      </button>
    </div>
  );
}
