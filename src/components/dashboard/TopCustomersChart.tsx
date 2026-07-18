'use client';

import { Users } from 'lucide-react';
import { useEffect, useState } from 'react';

export interface CustomerRevenue {
  name: string;
  total: number;
}

interface Props {
  data: CustomerRevenue[];
  currencySymbol?: string;
}

export function TopCustomersChart({ data, currencySymbol = '₹' }: Props) {
  const [grown, setGrown] = useState(false);

  useEffect(() => {
    // Defer to next frame so the bars transition from 0 → width instead of
    // rendering already-full (CSS transitions don't fire on initial paint).
    const raf = requestAnimationFrame(() => setGrown(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  if (data.length === 0) {
    return (
      <div className='flex h-48 flex-col items-center justify-center gap-2 text-center'>
        <Users size={28} className='text-muted-foreground/30' />
        <p className='text-sm text-muted-foreground'>
          No customer revenue yet — create some invoices to see this chart.
        </p>
      </div>
    );
  }

  const max = Math.max(...data.map((d) => d.total), 1);

  return (
    <div className='space-y-3.5' role='img' aria-label='Top customers by revenue'>
      {data.map((c, i) => {
        const pct = (c.total / max) * 100;
        return (
          <div key={c.name} className='flex items-center gap-3'>
            <div
              className='w-24 shrink-0 truncate text-xs text-foreground sm:w-32 sm:text-sm'
              title={c.name}
            >
              {c.name || 'Unnamed'}
            </div>
            <div className='h-2.5 flex-1 overflow-hidden rounded-full bg-muted'>
              <div
                className='h-full rounded-full transition-[width] ease-out'
                style={{
                  width: grown ? `${pct}%` : '0%',
                  transitionDuration: '700ms',
                  transitionDelay: `${i * 60}ms`,
                  background: 'linear-gradient(90deg, #1890ff 0%, #4dabff 100%)',
                }}
              />
            </div>
            <div className='w-16 shrink-0 text-right text-xs font-semibold tabular-nums text-foreground sm:w-20 sm:text-sm'>
              {currencySymbol}
              {c.total.toLocaleString('en-IN')}
            </div>
          </div>
        );
      })}
    </div>
  );
}
