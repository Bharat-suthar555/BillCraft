'use client';

import { useAuth } from '@/contexts/AuthContext';
import { auth } from '@/lib/firebase';
import {
  AlertTriangle,
  Ban,
  CheckCircle2,
  Mail,
  RefreshCw,
  Search,
  Shield,
  Trash2,
  UserCheck,
  Users,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';

const ADMIN_EMAIL = 'admin@billcraft.com';

interface AdminUser {
  uid:           string;
  email:         string;
  displayName:   string;
  photoURL:      string | null;
  disabled:      boolean;
  emailVerified: boolean;
  createdAt:     string;
  lastSignIn:    string;
  providers:     string[];
}

async function adminFetch(path: string, options: RequestInit = {}) {
  const token = await auth.currentUser?.getIdToken();
  return fetch(path, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...(options.headers ?? {}),
    },
  });
}

function StatCard({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: React.ElementType;
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div className='tdc-card flex items-center gap-3'>
      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${color}`}>
        <Icon size={18} className='text-white' />
      </div>
      <div>
        <div className='text-xl font-bold text-foreground'>{value}</div>
        <div className='text-xs text-muted-foreground'>{label}</div>
      </div>
    </div>
  );
}

function ProviderBadge({ provider }: { provider: string }) {
  if (provider === 'google.com')
    return (
      <span className='inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-medium text-blue-700 dark:bg-blue-950/40 dark:text-blue-400'>
        Google
      </span>
    );
  return (
    <span className='inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground'>
      Email
    </span>
  );
}

export default function AdminPage() {
  const { user } = useAuth();
  const router = useRouter();

  const [users,    setUsers]    = useState<AdminUser[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState('');
  const [search,   setSearch]   = useState('');
  const [actionUid, setActionUid] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  // Redirect non-admin users
  useEffect(() => {
    if (user && user.email !== ADMIN_EMAIL) router.replace('/invoices');
  }, [user, router]);

  const fetchUsers = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await adminFetch('/api/admin/users');
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json() as { users: AdminUser[] };
      setUsers(data.users.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.email === ADMIN_EMAIL) fetchUsers();
  }, [user]);

  const filtered = useMemo(() => {
    if (!search.trim()) return users;
    const q = search.toLowerCase();
    return users.filter(
      (u) =>
        u.email.toLowerCase().includes(q) ||
        u.displayName.toLowerCase().includes(q) ||
        u.uid.toLowerCase().includes(q),
    );
  }, [users, search]);

  const handleToggleDisable = async (u: AdminUser) => {
    setActionUid(u.uid);
    try {
      const res = await adminFetch(`/api/admin/users/${u.uid}`, {
        method: 'PATCH',
        body: JSON.stringify({ disabled: !u.disabled }),
      });
      if (!res.ok) throw new Error();
      setUsers((prev) =>
        prev.map((x) => (x.uid === u.uid ? { ...x, disabled: !u.disabled } : x)),
      );
    } catch {
      setError('Action failed. Please try again.');
    } finally {
      setActionUid(null);
    }
  };

  const handleDelete = async (uid: string) => {
    setConfirmDelete(null);
    setActionUid(uid);
    try {
      const res = await adminFetch(`/api/admin/users/${uid}`, { method: 'DELETE' });
      if (!res.ok) throw new Error();
      setUsers((prev) => prev.filter((u) => u.uid !== uid));
    } catch {
      setError('Delete failed. Please try again.');
    } finally {
      setActionUid(null);
    }
  };

  const stats = useMemo(() => ({
    total:    users.length,
    active:   users.filter((u) => !u.disabled).length,
    email:    users.filter((u) => u.providers.includes('password')).length,
    google:   users.filter((u) => u.providers.includes('google.com')).length,
  }), [users]);

  const fmt = (d: string) =>
    d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: '2-digit' }) : '—';

  if (user?.email !== ADMIN_EMAIL) return null;

  return (
    <div className='tdc-container'>

      {/* ── Header ─────────────────────────────────────────── */}
      <div className='flex items-center justify-between'>
        <div>
          <div className='flex items-center gap-2'>
            <div className='flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-purple-600'>
              <Shield size={15} className='text-white' />
            </div>
            <h1 className='text-xl font-bold text-foreground'>Admin Panel</h1>
          </div>
          <p className='mt-0.5 text-sm text-muted-foreground'>Manage all registered users</p>
        </div>
        <button
          onClick={fetchUsers}
          disabled={loading}
          className='flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-accent transition-colors disabled:opacity-50'
        >
          <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {/* ── Stats ──────────────────────────────────────────── */}
      <div className='grid grid-cols-2 gap-3 sm:grid-cols-4'>
        <StatCard icon={Users}     label='Total Users'  value={stats.total}  color='bg-gradient-to-br from-blue-500 to-blue-600'   />
        <StatCard icon={UserCheck} label='Active'       value={stats.active} color='bg-gradient-to-br from-green-500 to-green-600'  />
        <StatCard icon={Mail}      label='Email / PW'   value={stats.email}  color='bg-gradient-to-br from-orange-500 to-orange-600' />
        <StatCard icon={CheckCircle2} label='Google'    value={stats.google} color='bg-gradient-to-br from-violet-500 to-violet-600' />
      </div>

      {/* ── Error ──────────────────────────────────────────── */}
      {error && (
        <div className='flex items-center gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600 dark:bg-red-950/30 dark:text-red-400'>
          <AlertTriangle size={14} />
          {error}
          <button onClick={() => setError('')} className='ml-auto text-xs underline'>Dismiss</button>
        </div>
      )}

      {/* ── Search ─────────────────────────────────────────── */}
      <div className='tdc-card py-3'>
        <div className='relative'>
          <Search size={14} className='absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground' />
          <input
            type='text'
            placeholder='Search by name, email or UID…'
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className='w-full rounded-lg border border-input bg-background py-2 pl-8 pr-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring'
          />
        </div>
      </div>

      {/* ── User Table ─────────────────────────────────────── */}
      <div className='tdc-card p-0 overflow-hidden'>
        {loading ? (
          <div className='flex flex-col gap-3 p-4'>
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className='flex items-center gap-3'>
                <div className='h-9 w-9 animate-pulse rounded-full bg-muted' />
                <div className='flex-1 space-y-1.5'>
                  <div className='h-3 w-1/3 animate-pulse rounded bg-muted' />
                  <div className='h-2.5 w-1/2 animate-pulse rounded bg-muted' />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className='py-12 text-center text-sm text-muted-foreground'>
            {search ? 'No users match your search.' : 'No users found.'}
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <div className='hidden overflow-x-auto sm:block'>
              <table className='w-full text-sm'>
                <thead>
                  <tr className='border-b border-border bg-muted/40 text-xs font-medium uppercase text-muted-foreground'>
                    <th className='px-4 py-3 text-left'>User</th>
                    <th className='px-4 py-3 text-left'>Provider</th>
                    <th className='px-4 py-3 text-left'>Joined</th>
                    <th className='px-4 py-3 text-left'>Last Sign-in</th>
                    <th className='px-4 py-3 text-left'>Status</th>
                    <th className='px-4 py-3 text-center'>Actions</th>
                  </tr>
                </thead>
                <tbody className='divide-y divide-border'>
                  {filtered.map((u) => {
                    const isAdmin    = u.email === ADMIN_EMAIL;
                    const isSelf     = u.uid === auth.currentUser?.uid;
                    const busy       = actionUid === u.uid;
                    const initials   = u.displayName
                      ? u.displayName.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
                      : u.email[0].toUpperCase();

                    return (
                      <tr key={u.uid} className={`transition-colors hover:bg-muted/30 ${u.disabled ? 'opacity-60' : ''}`}>
                        {/* User */}
                        <td className='px-4 py-3'>
                          <div className='flex items-center gap-3'>
                            {u.photoURL ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={u.photoURL} alt='' className='h-9 w-9 rounded-full object-cover' />
                            ) : (
                              <div className='gradient-primary flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white'>
                                {initials}
                              </div>
                            )}
                            <div className='min-w-0'>
                              <div className='flex items-center gap-1.5 font-medium text-foreground'>
                                {u.displayName || '(no name)'}
                                {isAdmin && (
                                  <span className='rounded-full bg-violet-100 px-1.5 py-0.5 text-[9px] font-bold uppercase text-violet-700 dark:bg-violet-950/50 dark:text-violet-400'>
                                    Admin
                                  </span>
                                )}
                              </div>
                              <div className='truncate text-xs text-muted-foreground'>{u.email}</div>
                            </div>
                          </div>
                        </td>

                        {/* Provider */}
                        <td className='px-4 py-3'>
                          {u.providers.map((p) => <ProviderBadge key={p} provider={p} />)}
                        </td>

                        {/* Joined */}
                        <td className='px-4 py-3 text-xs text-muted-foreground'>{fmt(u.createdAt)}</td>

                        {/* Last sign-in */}
                        <td className='px-4 py-3 text-xs text-muted-foreground'>{fmt(u.lastSignIn)}</td>

                        {/* Status */}
                        <td className='px-4 py-3'>
                          {u.disabled ? (
                            <span className='inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-medium text-red-600 dark:bg-red-950/40 dark:text-red-400'>
                              <Ban size={9} /> Disabled
                            </span>
                          ) : (
                            <span className='inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-medium text-green-700 dark:bg-green-950/40 dark:text-green-400'>
                              <CheckCircle2 size={9} /> Active
                            </span>
                          )}
                        </td>

                        {/* Actions */}
                        <td className='px-4 py-3'>
                          <div className='flex items-center justify-center gap-2'>
                            {/* Disable / Enable */}
                            {!isAdmin && !isSelf && (
                              <button
                                onClick={() => handleToggleDisable(u)}
                                disabled={busy}
                                title={u.disabled ? 'Enable user' : 'Disable user'}
                                className={`rounded-lg border px-2.5 py-1 text-xs font-medium transition-colors disabled:opacity-50 ${
                                  u.disabled
                                    ? 'border-green-200 bg-green-50 text-green-700 hover:bg-green-100 dark:border-green-900 dark:bg-green-950/30 dark:text-green-400'
                                    : 'border-orange-200 bg-orange-50 text-orange-700 hover:bg-orange-100 dark:border-orange-900 dark:bg-orange-950/30 dark:text-orange-400'
                                }`}
                              >
                                {busy ? '…' : u.disabled ? 'Enable' : 'Disable'}
                              </button>
                            )}

                            {/* Delete */}
                            {!isAdmin && !isSelf && (
                              confirmDelete === u.uid ? (
                                <div className='flex items-center gap-1'>
                                  <button
                                    onClick={() => handleDelete(u.uid)}
                                    disabled={busy}
                                    className='rounded-lg bg-red-600 px-2.5 py-1 text-xs font-medium text-white hover:bg-red-700 disabled:opacity-50'
                                  >
                                    Confirm
                                  </button>
                                  <button
                                    onClick={() => setConfirmDelete(null)}
                                    className='rounded-lg border border-border px-2.5 py-1 text-xs font-medium text-muted-foreground hover:bg-accent'
                                  >
                                    Cancel
                                  </button>
                                </div>
                              ) : (
                                <button
                                  onClick={() => setConfirmDelete(u.uid)}
                                  title='Delete user'
                                  className='rounded-lg border border-red-200 bg-red-50 p-1.5 text-red-500 hover:bg-red-100 dark:border-red-900 dark:bg-red-950/30 dark:hover:bg-red-950/50'
                                >
                                  <Trash2 size={13} />
                                </button>
                              )
                            )}

                            {(isAdmin || isSelf) && (
                              <span className='text-xs text-muted-foreground/50'>—</span>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className='divide-y divide-border sm:hidden'>
              {filtered.map((u) => {
                const isAdmin  = u.email === ADMIN_EMAIL;
                const isSelf   = u.uid === auth.currentUser?.uid;
                const busy     = actionUid === u.uid;
                const initials = u.displayName
                  ? u.displayName.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
                  : u.email[0].toUpperCase();

                return (
                  <div key={u.uid} className={`space-y-2 p-4 ${u.disabled ? 'opacity-60' : ''}`}>
                    <div className='flex items-center justify-between gap-2'>
                      <div className='flex items-center gap-2.5 min-w-0'>
                        {u.photoURL ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={u.photoURL} alt='' className='h-9 w-9 rounded-full object-cover shrink-0' />
                        ) : (
                          <div className='gradient-primary flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white'>
                            {initials}
                          </div>
                        )}
                        <div className='min-w-0'>
                          <div className='flex items-center gap-1 font-medium text-foreground text-sm'>
                            {u.displayName || '(no name)'}
                            {isAdmin && (
                              <span className='rounded-full bg-violet-100 px-1.5 py-0.5 text-[9px] font-bold uppercase text-violet-700 dark:bg-violet-950/50 dark:text-violet-400'>
                                Admin
                              </span>
                            )}
                          </div>
                          <div className='truncate text-xs text-muted-foreground'>{u.email}</div>
                        </div>
                      </div>
                      {u.disabled ? (
                        <span className='shrink-0 inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-medium text-red-600 dark:bg-red-950/40 dark:text-red-400'>
                          <Ban size={9} /> Disabled
                        </span>
                      ) : (
                        <span className='shrink-0 inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-medium text-green-700 dark:bg-green-950/40 dark:text-green-400'>
                          <CheckCircle2 size={9} /> Active
                        </span>
                      )}
                    </div>
                    <div className='flex items-center gap-2 text-[11px] text-muted-foreground'>
                      {u.providers.map((p) => <ProviderBadge key={p} provider={p} />)}
                      <span>·</span>
                      <span>Joined {fmt(u.createdAt)}</span>
                    </div>
                    {!isAdmin && !isSelf && (
                      <div className='flex items-center gap-2 pt-1'>
                        <button
                          onClick={() => handleToggleDisable(u)}
                          disabled={busy}
                          className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors disabled:opacity-50 ${
                            u.disabled
                              ? 'border-green-200 bg-green-50 text-green-700 dark:border-green-900 dark:bg-green-950/30 dark:text-green-400'
                              : 'border-orange-200 bg-orange-50 text-orange-700 dark:border-orange-900 dark:bg-orange-950/30 dark:text-orange-400'
                          }`}
                        >
                          {busy ? '…' : u.disabled ? 'Enable' : 'Disable'}
                        </button>
                        {confirmDelete === u.uid ? (
                          <div className='flex items-center gap-1'>
                            <button onClick={() => handleDelete(u.uid)} disabled={busy}
                              className='rounded-lg bg-red-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-700 disabled:opacity-50'>
                              Confirm Delete
                            </button>
                            <button onClick={() => setConfirmDelete(null)}
                              className='rounded-lg border border-border px-2 py-1.5 text-xs text-muted-foreground hover:bg-accent'>
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button onClick={() => setConfirmDelete(u.uid)}
                            className='flex items-center gap-1 rounded-lg border border-red-200 bg-red-50 px-2.5 py-1.5 text-xs font-medium text-red-500 dark:border-red-900 dark:bg-red-950/30'>
                            <Trash2 size={11} /> Delete
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* Footer count */}
        {!loading && (
          <div className='border-t border-border px-4 py-2.5 text-xs text-muted-foreground'>
            Showing {filtered.length} of {users.length} user{users.length !== 1 ? 's' : ''}
          </div>
        )}
      </div>
    </div>
  );
}
