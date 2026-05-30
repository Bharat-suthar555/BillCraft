'use client';

import { cn } from '@/lib/utils';
import {
  ChevronLeft,
  ChevronRight,
  FileText,
  LayoutDashboard,
  PenTool,
  PlusCircle,
  Settings,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

const NAV = [
  {
    href: '/invoices',
    icon: LayoutDashboard,
    label: 'Invoices',
    sub: 'All saved invoices',
    exact: true,
  },
  {
    href: '/invoices/new',
    icon: PlusCircle,
    label: 'New Invoice',
    sub: 'Create & generate PDF',
    exact: true,
  },
  {
    href: '/templates',
    icon: PenTool,
    label: 'Templates',
    sub: 'Design your invoice',
    exact: false,
  },
];

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();

  const isActive = (href: string, exact: boolean) =>
    exact ? pathname === href : pathname.startsWith(href);

  return (
    <aside
      className={cn(
        'relative flex flex-col border-r border-sidebar-border bg-sidebar transition-[width] duration-300 ease-in-out',
        collapsed ? 'w-16' : 'w-64',
      )}
    >
      {/* ── Logo ─────────────────────────────────────────── */}
      <div className='flex h-14 items-center border-b border-sidebar-border px-4'>
        <div className='gradient-primary flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-sm font-black'>
          IV
        </div>
        {!collapsed && (
          <div className='ml-3 overflow-hidden'>
            <div className='gradient-text text-sm font-bold leading-none'>
              InvoiceGen
            </div>
            <div className='mt-0.5 text-xs text-muted-foreground leading-none'>
              PDF Generator
            </div>
          </div>
        )}
      </div>

      {/* ── Nav ──────────────────────────────────────────── */}
      <nav className='flex-1 space-y-1 overflow-y-auto px-2 py-4'>
        {NAV.map(({ href, icon: Icon, label, sub, exact }) => {
          const active = isActive(href, exact);
          return (
            <Link
              key={href}
              href={href}
              title={collapsed ? label : undefined}
              className={cn(
                'group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors',
                active
                  ? 'nav-item-active'
                  : 'text-muted-foreground hover:bg-accent hover:text-foreground',
              )}
            >
              <Icon size={18} className='shrink-0' />
              {!collapsed && (
                <div className='overflow-hidden'>
                  <div className='truncate font-medium leading-none'>
                    {label}
                  </div>
                  <div className='mt-0.5 truncate text-xs text-muted-foreground leading-none'>
                    {sub}
                  </div>
                </div>
              )}
            </Link>
          );
        })}
      </nav>

      {/* ── Settings + Collapse ──────────────────────────── */}
      <div className='border-t border-sidebar-border p-2 space-y-1'>
        <Link
          href='/templates'
          title={collapsed ? 'Settings' : undefined}
          className='flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-foreground transition-colors'
        >
          <Settings size={16} className='shrink-0' />
          {!collapsed && <span className='text-xs'>Settings</span>}
        </Link>

        <button
          onClick={() => setCollapsed((c) => !c)}
          className='flex w-full items-center justify-center rounded-lg p-2 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors'
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight size={15} /> : <ChevronLeft size={15} />}
        </button>
      </div>
    </aside>
  );
}

/* ── Mobile bottom nav ──────────────────────────────────────────────────── */
export function MobileBottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className='fixed bottom-0 left-0 right-0 z-50 flex border-t border-border bg-card sm:hidden'
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      {NAV.map(({ href, icon: Icon, label, exact }) => {
        const active = exact ? pathname === href : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              'flex flex-1 flex-col items-center justify-center py-3 text-xs gap-1 transition-colors',
              active ? 'text-[#1890ff] font-medium' : 'text-muted-foreground',
            )}
          >
            <Icon size={22} />
            <span>{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
