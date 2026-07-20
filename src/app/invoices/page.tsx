'use client';

import { Badge } from '@/components/ui/badge';
import { deleteInvoice, getInvoices } from '@/lib/firestore';
import { InvoiceData } from '@/types';
import dayjs from 'dayjs';
import {
  ChevronDown,
  ChevronRight,
  Eye,
  FileDown,
  Pencil,
  Plus,
  Trash2,
  FileText,
  TrendingUp,
  Clock,
  CheckCircle2,
} from 'lucide-react';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

const STATUS_VARIANT: Record<
  string,
  'default' | 'warning' | 'success' | 'secondary'
> = {
  draft: 'warning',
  sent: 'default',
  paid: 'success',
};

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<InvoiceData[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    getInvoices()
      .then(setInvoices)
      .catch((err) => {
        console.error('Failed to load invoices:', err);
        toast.error('Failed to load invoices. Check Firebase config.');
      })
      .finally(() => setLoading(false));
  }, []);

  const stats = useMemo(
    () => ({
      total: invoices.length,
      draft: invoices.filter((i) => i.status === 'draft').length,
      sent: invoices.filter((i) => i.status === 'sent').length,
      paid: invoices.filter((i) => i.status === 'paid').length,
      revenue: invoices
        .filter((i) => i.status === 'paid')
        .reduce((s, i) => s + (i.total ?? 0), 0),
    }),
    [invoices],
  );

  const filtered = useMemo(
    () =>
      invoices.filter((inv) => {
        const matchSearch =
          !search ||
          inv.billNo?.toLowerCase().includes(search.toLowerCase()) ||
          inv.customerName?.toLowerCase().includes(search.toLowerCase()) ||
          inv.customerPhone?.includes(search);
        const matchStatus =
          statusFilter === 'all' || inv.status === statusFilter;
        return matchSearch && matchStatus;
      }),
    [invoices, search, statusFilter],
  );

  const toggleExpand = (id: string) =>
    setExpanded((prev) => {
      const n = new Set(prev);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this invoice?')) return;
    try {
      await deleteInvoice(id);
      setInvoices((prev) => prev.filter((i) => i._id !== id));
      toast.success('Invoice deleted');
    } catch {
      toast.error('Failed to delete');
    }
  };

  return (
    <div className='tdc-container'>
      {/* ── Page header ─────────────────────────────────────────── */}
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-xl font-bold text-foreground'>Invoices</h1>
          <p className='text-sm text-muted-foreground'>
            Manage and download your invoices
          </p>
        </div>
        <Link
          href='/invoices/new'
          className='gradient-primary inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium transition-opacity hover:opacity-90'
        >
          <Plus size={14} />
          New Invoice
        </Link>
      </div>

      {/* ── Stats cards ─────────────────────────────────────────── */}
      <div className='grid grid-cols-2 gap-3 sm:grid-cols-4'>
        {[
          {
            label: 'Total',
            value: stats.total,
            icon: FileText,
            color: '#125a98',
            bg: 'rgba(18,90,152,0.08)',
          },
          {
            label: 'Draft',
            value: stats.draft,
            icon: Clock,
            color: '#fa8c16',
            bg: 'rgba(250,140,22,0.08)',
          },
          {
            label: 'Sent',
            value: stats.sent,
            icon: TrendingUp,
            color: '#722ed1',
            bg: 'rgba(114,46,209,0.08)',
          },
          {
            label: 'Paid',
            value: stats.paid,
            icon: CheckCircle2,
            color: '#52c41a',
            bg: 'rgba(82,196,26,0.08)',
          },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className='tdc-card flex items-center gap-4'>
            <div
              className='flex h-10 w-10 shrink-0 items-center justify-center rounded-lg'
              style={{ backgroundColor: bg }}
            >
              <Icon size={18} style={{ color }} />
            </div>
            <div>
              <div className='text-2xl font-bold text-foreground leading-none'>
                {value}
              </div>
              <div className='mt-0.5 text-xs text-muted-foreground'>
                {label}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Table card ──────────────────────────────────────────── */}
      <div className='tdc-card p-0! overflow-hidden'>
        {/* Toolbar */}
        <div className='flex flex-col gap-2 border-b border-border px-4 py-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:gap-3'>
          <div className='font-medium text-sm text-foreground'>
            All Invoices
            <span className='ml-2 text-xs text-muted-foreground'>
              ({filtered.length})
            </span>
          </div>
          <div className='flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-2'>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder='Search bill no, customer…'
              className='h-8 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring sm:w-52'
            />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className='h-8 w-full rounded-md border border-input bg-background px-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring sm:w-auto'
            >
              <option value='all'>All Status</option>
              <option value='draft'>Draft</option>
              <option value='sent'>Sent</option>
              <option value='paid'>Paid</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className='flex h-48 items-center justify-center text-sm text-muted-foreground'>
            Loading…
          </div>
        ) : filtered.length === 0 ? (
          <div className='flex h-48 flex-col items-center justify-center gap-3 text-center'>
            <FileText size={32} className='text-muted-foreground/30' />
            <p className='text-sm text-muted-foreground'>
              {invoices.length === 0
                ? 'No invoices yet'
                : 'No results match your filter'}
            </p>
            {invoices.length === 0 && (
              <Link
                href='/invoices/new'
                className='gradient-primary inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium'
              >
                <Plus size={13} /> Create first invoice
              </Link>
            )}
          </div>
        ) : (
          <>
            {/* ── Desktop table ──────────────────────────────── */}
            <div className='hidden sm:block overflow-x-auto'>
              <table className='w-full text-sm'>
                <thead>
                  <tr className='border-b border-border bg-muted/40 text-xs font-semibold uppercase tracking-wide text-muted-foreground'>
                    <th className='w-8 px-3 py-3' />
                    <th className='px-4 py-3 text-left'>Bill No</th>
                    <th className='px-4 py-3 text-left'>Customer</th>
                    <th className='px-4 py-3 text-left'>Address</th>
                    <th className='px-4 py-3 text-left'>Date</th>
                    <th className='px-4 py-3 text-center'>Items</th>
                    <th className='px-4 py-3 text-right'>Total</th>
                    <th className='px-4 py-3 text-center'>Status</th>
                    <th className='px-4 py-3 text-right'>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((inv) => {
                    const isOpen = expanded.has(inv._id!);
                    return (
                      <>
                        <tr
                          key={inv._id}
                          className='border-b border-border hover:bg-muted/30 transition-colors'
                        >
                          <td className='px-3 py-3 text-center'>
                            <button
                              onClick={() => toggleExpand(inv._id!)}
                              className='text-muted-foreground hover:text-foreground transition-colors'
                            >
                              {isOpen ? (
                                <ChevronDown size={14} />
                              ) : (
                                <ChevronRight size={14} />
                              )}
                            </button>
                          </td>
                          <td className='px-4 py-3'>
                            <span className='gradient-text font-semibold'>
                              {inv.billNo}
                            </span>
                          </td>
                          <td className='px-4 py-3'>
                            <div className='font-medium text-foreground'>
                              {inv.customerName || '—'}
                            </div>
                            {inv.customerPhone && (
                              <div className='text-xs text-muted-foreground'>
                                {inv.customerPhone}
                              </div>
                            )}
                          </td>
                          <td className='px-4 py-3 text-muted-foreground max-w-45 truncate'>
                            {inv.customerAddress || '—'}
                          </td>
                          <td className='px-4 py-3 text-muted-foreground whitespace-nowrap'>
                            {inv.date
                              ? dayjs(inv.date).format('DD MMM YYYY')
                              : '—'}
                          </td>
                          <td className='px-4 py-3 text-center text-muted-foreground'>
                            {inv.lineItems?.length ?? 0}
                          </td>
                          <td className='px-4 py-3 text-right font-semibold text-foreground'>
                            {(inv.total ?? 0) > 0
                              ? `₹ ${inv.total.toLocaleString('en-IN')}`
                              : '—'}
                          </td>
                          <td className='px-4 py-3 text-center'>
                            <Badge
                              variant={
                                STATUS_VARIANT[inv.status] ?? 'secondary'
                              }
                            >
                              {inv.status}
                            </Badge>
                          </td>
                          <td className='px-4 py-3 text-right'>
                            <div className='flex items-center justify-end gap-1'>
                              <Link
                                href={`/invoices/${inv._id}`}
                                title='Download PDF'
                              >
                                <button className='rounded-md p-1.5 text-muted-foreground hover:bg-green-500/10 hover:text-green-600 transition-colors'>
                                  <FileDown size={14} />
                                </button>
                              </Link>
                              <Link
                                href={`/invoices/${inv._id}?edit=1`}
                                title='Edit'
                              >
                                <button className='rounded-md p-1.5 text-muted-foreground hover:bg-blue-500/10 hover:text-blue-500 transition-colors'>
                                  <Pencil size={14} />
                                </button>
                              </Link>
                              <Link href={`/invoices/${inv._id}`} title='View'>
                                <button className='rounded-md p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors'>
                                  <Eye size={14} />
                                </button>
                              </Link>
                              <button
                                onClick={() => handleDelete(inv._id!)}
                                className='rounded-md p-1.5 text-muted-foreground hover:bg-red-500/10 hover:text-red-500 transition-colors'
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>

                        {/* Expanded row */}
                        {isOpen && (
                          <tr
                            key={`${inv._id}-exp`}
                            className='border-b border-border bg-muted/20'
                          >
                            <td colSpan={9} className='px-8 py-3'>
                              {!inv.lineItems?.length ? (
                                <p className='text-xs text-muted-foreground italic'>
                                  No line items
                                </p>
                              ) : (
                                <table className='w-full text-xs'>
                                  <thead>
                                    <tr className='text-muted-foreground font-semibold uppercase tracking-wide'>
                                      <th className='pb-2 text-left w-10'>#</th>
                                      <th className='pb-2 text-left'>
                                        Description
                                      </th>
                                      <th className='pb-2 text-center w-24'>
                                        Size
                                      </th>
                                      <th className='pb-2 text-center w-16'>
                                        sq.ft
                                      </th>
                                      <th className='pb-2 text-right w-20'>
                                        Rate
                                      </th>
                                      <th className='pb-2 text-right w-24'>
                                        Amount
                                      </th>
                                    </tr>
                                  </thead>
                                  <tbody className='divide-y divide-border'>
                                    {inv.lineItems.map((item, i) => (
                                      <tr key={item.id ?? i}>
                                        <td className='py-1.5 text-muted-foreground'>
                                          {i + 1}
                                        </td>
                                        <td className='py-1.5 text-foreground'>
                                          {item.description || '—'}
                                        </td>
                                        <td className='py-1.5 text-center text-muted-foreground'>
                                          {item.size || '—'}
                                        </td>
                                        <td className='py-1.5 text-center text-muted-foreground'>
                                          {item.sqft || '—'}
                                        </td>
                                        <td className='py-1.5 text-right text-muted-foreground'>
                                          {item.rate || '—'}
                                        </td>
                                        <td className='py-1.5 text-right font-medium text-foreground'>
                                          {item.amount > 0
                                            ? `₹${item.amount.toLocaleString('en-IN')}`
                                            : '—'}
                                        </td>
                                      </tr>
                                    ))}
                                    <tr className='font-semibold text-foreground border-t border-border'>
                                      <td
                                        colSpan={5}
                                        className='pt-2 text-right pr-4'
                                      >
                                        Total
                                      </td>
                                      <td className='pt-2 text-right'>
                                        {(inv.total ?? 0) > 0
                                          ? `₹${inv.total.toLocaleString('en-IN')}`
                                          : '—'}
                                      </td>
                                    </tr>
                                  </tbody>
                                </table>
                              )}
                            </td>
                          </tr>
                        )}
                      </>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* ── Mobile cards ────────────────────────────────── */}
            <div className='flex flex-col divide-y divide-border sm:hidden'>
              {filtered.map((inv) => {
                const isOpen = expanded.has(inv._id!);
                return (
                  <div key={inv._id}>
                    <div className='flex items-start justify-between p-4'>
                      <div className='flex-1 min-w-0'>
                        <div className='flex items-center gap-2 flex-wrap'>
                          <span className='gradient-text font-semibold'>
                            {inv.billNo}
                          </span>
                          <Badge
                            variant={STATUS_VARIANT[inv.status] ?? 'secondary'}
                          >
                            {inv.status}
                          </Badge>
                        </div>
                        <div className='text-sm text-foreground mt-0.5'>
                          {inv.customerName || '—'}
                        </div>
                        {inv.customerPhone && (
                          <div className='text-xs text-muted-foreground'>
                            {inv.customerPhone}
                          </div>
                        )}
                        {inv.customerAddress && (
                          <div className='text-xs text-muted-foreground truncate'>
                            {inv.customerAddress}
                          </div>
                        )}
                      </div>
                      <div className='text-right ml-3 shrink-0'>
                        <div className='text-xs text-muted-foreground'>
                          {inv.date ? dayjs(inv.date).format('DD MMM YY') : '—'}
                        </div>
                        <div className='font-semibold text-foreground mt-0.5'>
                          {(inv.total ?? 0) > 0
                            ? `₹${inv.total.toLocaleString('en-IN')}`
                            : '—'}
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => toggleExpand(inv._id!)}
                      className='flex w-full items-center justify-between bg-muted/30 px-4 py-2 text-xs text-muted-foreground hover:bg-muted/50 transition-colors'
                    >
                      <span>
                        {inv.lineItems?.length ?? 0} item
                        {(inv.lineItems?.length ?? 0) !== 1 ? 's' : ''}
                      </span>
                      {isOpen ? (
                        <ChevronDown size={13} />
                      ) : (
                        <ChevronRight size={13} />
                      )}
                    </button>

                    {isOpen && inv.lineItems?.length > 0 && (
                      <div className='bg-muted/20 px-4 py-3'>
                        <table className='w-full text-xs'>
                          <tbody className='divide-y divide-border'>
                            {inv.lineItems.map((item, i) => (
                              <tr key={item.id ?? i}>
                                <td className='py-1.5 text-muted-foreground w-6'>
                                  {i + 1}
                                </td>
                                <td className='py-1.5 text-foreground'>
                                  <div>{item.description || '—'}</div>
                                  {(item.size || item.sqft) && (
                                    <div className='text-muted-foreground'>
                                      {item.size}
                                      {item.sqft && ` · ${item.sqft} sq.ft`}
                                      {item.rate && ` · ₹${item.rate}`}
                                    </div>
                                  )}
                                </td>
                                <td className='py-1.5 text-right font-medium text-foreground'>
                                  {item.amount > 0
                                    ? `₹${item.amount.toLocaleString('en-IN')}`
                                    : '—'}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}

                    <div className='flex divide-x divide-border border-t border-border'>
                      <Link href={`/invoices/${inv._id}`} className='flex-1'>
                        <button className='w-full py-2.5 text-xs font-medium text-green-600 dark:text-green-400 hover:bg-green-500/10 flex items-center justify-center gap-1 transition-colors'>
                          <FileDown size={12} />
                          PDF
                        </button>
                      </Link>
                      <Link
                        href={`/invoices/${inv._id}?edit=1`}
                        className='flex-1'
                      >
                        <button className='w-full py-2.5 text-xs font-medium text-blue-500 hover:bg-blue-500/10 flex items-center justify-center gap-1 transition-colors'>
                          <Pencil size={12} />
                          Edit
                        </button>
                      </Link>
                      <button
                        onClick={() => handleDelete(inv._id!)}
                        className='flex-1 py-2.5 text-xs font-medium text-red-400 hover:bg-red-500/10 flex items-center justify-center gap-1 transition-colors'
                      >
                        <Trash2 size={12} />
                        Del
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
