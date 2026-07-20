'use client';

import { TopCustomersChart } from '@/components/dashboard/TopCustomersChart';
import { Badge } from '@/components/ui/badge';
import { getInvoices } from '@/lib/firestore';
import { InvoiceData } from '@/types';
import dayjs from 'dayjs';
import {
  CheckCircle2,
  Clock,
  FileText,
  TrendingUp,
  Users,
  Wallet,
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

export default function DashboardPage() {
  const [invoices, setInvoices] = useState<InvoiceData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getInvoices()
      .then(setInvoices)
      .catch(() => toast.error('Failed to load dashboard data.'))
      .finally(() => setLoading(false));
  }, []);

  const stats = useMemo(() => {
    const revenue = invoices
      .filter((i) => i.status === 'paid')
      .reduce((s, i) => s + (i.total ?? 0), 0);
    const outstanding = invoices
      .filter((i) => i.status !== 'paid')
      .reduce((s, i) => s + (i.total ?? 0), 0);
    const customers = new Set(
      invoices.map((i) => i.customerName?.trim()).filter(Boolean),
    );
    return {
      revenue,
      outstanding,
      total: invoices.length,
      customers: customers.size,
    };
  }, [invoices]);

  const topCustomers = useMemo(() => {
    const byCustomer = new Map<string, number>();
    for (const inv of invoices) {
      const name = inv.customerName?.trim();
      if (!name) continue;
      byCustomer.set(name, (byCustomer.get(name) ?? 0) + (inv.total ?? 0));
    }
    return Array.from(byCustomer, ([name, total]) => ({ name, total }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 6);
  }, [invoices]);

  const recent = useMemo(
    () =>
      [...invoices]
        .sort((a, b) => {
          const ta = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const tb = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return tb - ta;
        })
        .slice(0, 6),
    [invoices],
  );

  const kpis = [
    {
      label: 'Total Revenue',
      value: `₹${stats.revenue.toLocaleString('en-IN')}`,
      icon: Wallet,
      color: '#52c41a',
      bg: 'rgba(82,196,26,0.08)',
    },
    {
      label: 'Outstanding',
      value: `₹${stats.outstanding.toLocaleString('en-IN')}`,
      icon: Clock,
      color: '#fa8c16',
      bg: 'rgba(250,140,22,0.08)',
    },
    {
      label: 'Total Invoices',
      value: stats.total,
      icon: FileText,
      color: '#125a98',
      bg: 'rgba(18,90,152,0.08)',
    },
    {
      label: 'Customers',
      value: stats.customers,
      icon: Users,
      color: '#722ed1',
      bg: 'rgba(114,46,209,0.08)',
    },
  ];

  return (
    <div className='tdc-container'>
      {/* ── Page header ─────────────────────────────────────────── */}
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-xl font-bold text-foreground'>Dashboard</h1>
          <p className='text-sm text-muted-foreground'>
            Business overview & insights
          </p>
        </div>
        <Link
          href='/invoices/new'
          className='gradient-primary inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium transition-opacity hover:opacity-90'
        >
          + New Invoice
        </Link>
      </div>

      {/* ── KPI cards ────────────────────────────────────────────── */}
      <div className='grid grid-cols-2 gap-3 sm:grid-cols-4'>
        {kpis.map(({ label, value, icon: Icon, color, bg }, i) => (
          <div
            key={label}
            className={`tdc-card tdc-card-hover animate-rise stagger-${i + 1} flex items-center gap-4`}
          >
            <div
              className='flex h-10 w-10 shrink-0 items-center justify-center rounded-lg'
              style={{ backgroundColor: bg }}
            >
              <Icon size={18} style={{ color }} />
            </div>
            <div className='min-w-0'>
              <div className='truncate text-xl font-bold leading-none text-foreground sm:text-2xl'>
                {loading ? '—' : value}
              </div>
              <div className='mt-0.5 text-xs text-muted-foreground'>
                {label}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Chart + Recent activity ─────────────────────────────── */}
      <div className='grid grid-cols-1 gap-4 lg:grid-cols-5'>
        {/* Top customers chart */}
        <div className='tdc-card animate-rise stagger-5 lg:col-span-3'>
          <div className='mb-4 flex items-center gap-2'>
            <TrendingUp size={15} className='text-[#125a98]' />
            <h2 className='text-sm font-semibold text-foreground'>
              Top Customers by Revenue
            </h2>
          </div>
          {loading ? (
            <div className='space-y-3.5'>
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className='flex items-center gap-3'>
                  <div className='h-3 w-24 animate-pulse rounded bg-muted' />
                  <div className='h-2.5 flex-1 animate-pulse rounded-full bg-muted' />
                  <div className='h-3 w-16 animate-pulse rounded bg-muted' />
                </div>
              ))}
            </div>
          ) : (
            <TopCustomersChart data={topCustomers} />
          )}
        </div>

        {/* Recent invoices */}
        <div className='tdc-card animate-rise stagger-6 p-0! overflow-hidden lg:col-span-2'>
          <div className='flex items-center gap-2 border-b border-border px-4 py-3.5'>
            <CheckCircle2 size={15} className='text-[#2f8fe0]' />
            <h2 className='text-sm font-semibold text-foreground'>
              Recent Invoices
            </h2>
          </div>
          {loading ? (
            <div className='space-y-3 p-4'>
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className='h-10 animate-pulse rounded-lg bg-muted'
                />
              ))}
            </div>
          ) : recent.length === 0 ? (
            <div className='flex h-40 flex-col items-center justify-center gap-2 text-center'>
              <FileText size={26} className='text-muted-foreground/30' />
              <p className='text-sm text-muted-foreground'>No invoices yet</p>
            </div>
          ) : (
            <div className='divide-y divide-border'>
              {recent.map((inv) => (
                <Link
                  key={inv._id}
                  href={`/invoices/${inv._id}`}
                  className='flex items-center justify-between gap-3 px-4 py-3 transition-colors hover:bg-accent'
                >
                  <div className='min-w-0'>
                    <div className='truncate text-sm font-medium text-foreground'>
                      {inv.customerName || 'Unnamed'}
                    </div>
                    <div className='text-xs text-muted-foreground'>
                      {inv.billNo || '—'} ·{' '}
                      {inv.date ? dayjs(inv.date).format('DD MMM') : '—'}
                    </div>
                  </div>
                  <div className='flex shrink-0 items-center gap-2'>
                    <span className='text-sm font-semibold text-foreground'>
                      ₹{(inv.total ?? 0).toLocaleString('en-IN')}
                    </span>
                    <Badge variant={STATUS_VARIANT[inv.status] ?? 'secondary'}>
                      {inv.status}
                    </Badge>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
