const KEY = 'billcraft_impersonation';

export interface ImpersonationState {
  adminReturnToken: string;
  targetEmail: string;
  targetUid: string;
}

export function getImpersonation(): ImpersonationState | null {
  if (typeof window === 'undefined') return null;
  const raw = sessionStorage.getItem(KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as ImpersonationState;
  } catch {
    return null;
  }
}

export function setImpersonation(state: ImpersonationState): void {
  sessionStorage.setItem(KEY, JSON.stringify(state));
}

export function clearImpersonation(): void {
  sessionStorage.removeItem(KEY);
}
