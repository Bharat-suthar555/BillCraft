'use client';

import { Badge } from '@/components/ui/badge';
import { TemplateEditor } from '@/components/template/TemplateEditor';
import { useAuth } from '@/contexts/AuthContext';
import { ADMIN_EMAIL } from '@/lib/admin';
import { auth } from '@/lib/firebase';
import { InvoiceData, TemplateSettings } from '@/types';
import dayjs from 'dayjs';
import {
  AlertTriangle,
  ArrowLeft,
  Eye,
  FileText,
  LayoutTemplate,
  X,
} from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

const STATUS_VARIANT: Record<
  string,
  'default' | 'warning' | 'success' | 'secondary'
> = {
  draft: 'warning',
  sent: 'default',
  paid: 'success',
};

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

export default function AdminUserDataPage() {
  const { user } = useAuth();
  const router = useRouter();
  const { uid } = useParams<{ uid: string }>();

  const [invoices, setInvoices] = useState<InvoiceData[]>([]);
  const [templates, setTemplates] = useState<TemplateSettings[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState<TemplateSettings | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user && user.email !== ADMIN_EMAIL) router.replace('/invoices');
  }, [user, router]);

  useEffect(() => {
    if (user?.email !== ADMIN_EMAIL || !uid) return;
    setLoading(true);
    adminFetch(`/api/admin/users/${uid}/data`)
      .then(async (res) => {
        if (!res.ok) throw new Error(await res.text());
        return res.json() as Promise<{
          invoices: InvoiceData[];
          templates: TemplateSettings[];
        }>;
      })
      .then((data) => {
        setInvoices(data.invoices);
        setTemplates(data.templates);
      })
      .catch(() => setError('Failed to load this user’s data.'))
      .finally(() => setLoading(false));
  }, [user, uid]);

  const handleSaveTemplate = async () => {
    if (!editing?._id) return;
    setSaving(true);
    try {
      const res = await adminFetch(
        `/api/admin/users/${uid}/templates/${editing._id}`,
        { method: 'PATCH', body: JSON.stringify(editing) },
      );
      if (!res.ok) throw new Error();
      setTemplates((prev) =>
        prev.map((t) => (t._id === editing._id ? editing : t)),
      );
      toast.success('Template updated');
      setEditing(null);
    } catch {
      toast.error('Failed to save template');
    } finally {
      setSaving(false);
    }
  };

  if (user?.email !== ADMIN_EMAIL) return null;

  return (
    <div className='tdc-container'>
      {/* ── Header ─────────────────────────────────────────── */}
      <div className='flex items-center gap-3'>
        <button
          onClick={() => router.push('/admin')}
          className='flex h-8 w-8 items-center justify-center rounded-lg border border-border text-muted-foreground hover:bg-accent transition-colors'
        >
          <ArrowLeft size={15} />
        </button>
        <div>
          <div className='flex items-center gap-2'>
            <Eye size={15} className='text-violet-500' />
            <h1 className='text-xl font-bold text-foreground'>
              Admin user view
            </h1>
          </div>
          <p className='mt-0.5 text-sm text-muted-foreground'>UID: {uid}</p>
        </div>
      </div>

      {/* ── Admin-mode banner ──────────────────────────────── */}
      <div className='flex items-center gap-2 rounded-xl border border-violet-200 bg-violet-50 px-4 py-3 text-sm text-violet-700 dark:border-violet-900 dark:bg-violet-950/30 dark:text-violet-400'>
        <AlertTriangle size={14} className='shrink-0' />
        You are viewing this user&apos;s data as an admin. Invoices are
        read-only; templates can be edited — changes save directly to this
        user&apos;s account.
      </div>

      {error && (
        <div className='flex items-center gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600 dark:bg-red-950/30 dark:text-red-400'>
          <AlertTriangle size={14} />
          {error}
        </div>
      )}

      {/* ── Templates ──────────────────────────────────────── */}
      <div className='tdc-card'>
        <div className='mb-3 flex items-center gap-2 text-sm font-medium text-foreground'>
          <LayoutTemplate size={14} />
          Templates
          <span className='text-xs text-muted-foreground'>
            ({templates.length})
          </span>
        </div>
        {loading ? (
          <div className='py-6 text-center text-sm text-muted-foreground'>
            Loading…
          </div>
        ) : templates.length === 0 ? (
          <div className='py-6 text-center text-sm text-muted-foreground'>
            No templates.
          </div>
        ) : (
          <div className='flex flex-wrap gap-2'>
            {templates.map((t) => (
              <button
                key={t._id}
                onClick={() => setEditing(t)}
                className={`rounded-lg border px-3 py-1.5 text-xs transition-colors ${
                  editing?._id === t._id
                    ? 'border-violet-300 bg-violet-50 text-violet-700 dark:border-violet-800 dark:bg-violet-950/40 dark:text-violet-400'
                    : 'border-border bg-muted/40 text-foreground hover:bg-accent'
                }`}
              >
                {t.name} · {t.companyName}
              </button>
            ))}
          </div>
        )}

        {editing && (
          <div className='mt-4 rounded-xl border border-border p-4'>
            <div className='mb-4 flex items-center justify-between'>
              <span className='text-sm font-medium text-foreground'>
                Editing “{editing.name}”
              </span>
              <button
                onClick={() => setEditing(null)}
                className='flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground hover:bg-accent'
              >
                <X size={14} />
              </button>
            </div>
            <TemplateEditor
              template={editing}
              onChange={setEditing}
              onSave={handleSaveTemplate}
              saving={saving}
            />
          </div>
        )}
      </div>

      {/* ── Invoices ───────────────────────────────────────── */}
      <div className='tdc-card p-0! overflow-hidden'>
        <div className='flex items-center gap-2 border-b border-border px-4 py-3 text-sm font-medium text-foreground'>
          <FileText size={14} />
          Invoices
          <span className='text-xs text-muted-foreground'>
            ({invoices.length})
          </span>
        </div>

        {loading ? (
          <div className='flex h-32 items-center justify-center text-sm text-muted-foreground'>
            Loading…
          </div>
        ) : invoices.length === 0 ? (
          <div className='flex h-32 items-center justify-center text-sm text-muted-foreground'>
            No invoices for this user.
          </div>
        ) : (
          <div className='overflow-x-auto'>
            <table className='w-full text-sm'>
              <thead>
                <tr className='border-b border-border bg-muted/40 text-xs font-medium uppercase text-muted-foreground'>
                  <th className='px-4 py-3 text-left'>Bill No</th>
                  <th className='px-4 py-3 text-left'>Customer</th>
                  <th className='px-4 py-3 text-left'>Date</th>
                  <th className='px-4 py-3 text-right'>Total</th>
                  <th className='px-4 py-3 text-left'>Status</th>
                </tr>
              </thead>
              <tbody className='divide-y divide-border'>
                {invoices.map((inv) => (
                  <tr
                    key={inv._id}
                    className='hover:bg-muted/30 transition-colors'
                  >
                    <td className='px-4 py-3 font-medium text-foreground'>
                      {inv.billNo || '—'}
                    </td>
                    <td className='px-4 py-3 text-foreground'>
                      {inv.customerName || '—'}
                    </td>
                    <td className='px-4 py-3 text-muted-foreground'>
                      {inv.date ? dayjs(inv.date).format('DD MMM YYYY') : '—'}
                    </td>
                    <td className='px-4 py-3 text-right text-foreground'>
                      {inv.total?.toLocaleString('en-IN') ?? 0}
                    </td>
                    <td className='px-4 py-3'>
                      <Badge
                        variant={STATUS_VARIANT[inv.status] ?? 'secondary'}
                      >
                        {inv.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
