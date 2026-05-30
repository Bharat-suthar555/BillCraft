'use client';

import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import {
  ChevronLeft,
  ChevronRight,
  LayoutDashboard,
  LogOut,
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
  const { user, signOut } = useAuth();

  const isActive = (href: string, exact: boolean) =>
    exact ? pathname === href : pathname.startsWith(href);

  const initials = user?.displayName
    ? user.displayName
        .split(' ')
        .map((n) => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    : '?';

  return (
    <aside
      className={cn(
        'relative flex flex-col border-r border-sidebar-border bg-sidebar transition-[width] duration-300 ease-in-out',
        collapsed ? 'w-16' : 'w-64',
      )}
    >
      {/* ── Logo ─────────────────────────────────────────── */}
      <div className='flex h-14 items-center border-b border-sidebar-border px-4'>
        <div className='gradient-primary flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs font-black text-white'>
          BC
        </div>
        {!collapsed && (
          <div className='ml-3 overflow-hidden'>
            <div className='gradient-text text-sm font-bold leading-none'>BillCraft</div>
            <div className='mt-0.5 text-xs text-muted-foreground leading-none'>Invoice System</div>
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

      {/* ── User + Settings + Collapse ───────────────────── */}
      <div className='border-t border-sidebar-border p-2 space-y-1'>
        {/* User row */}
        {user && (
          <div
            className={cn(
              'flex items-center gap-2.5 rounded-lg px-2 py-2',
              collapsed && 'justify-center px-0',
            )}
          >
            {user.photoURL ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={user.photoURL}
                alt={user.displayName ?? 'User'}
                width={28}
                height={28}
                className='h-7 w-7 shrink-0 rounded-full object-cover'
              />
            ) : (
              <div className='gradient-primary flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white'>
                {initials}
              </div>
            )}
            {!collapsed && (
              <div className='min-w-0 flex-1'>
                <div className='truncate text-xs font-medium text-foreground'>
                  {user.displayName ?? 'User'}
                </div>
                <div className='truncate text-[10px] text-muted-foreground'>
                  {user.email}
                </div>
              </div>
            )}
            {!collapsed && (
              <button
                onClick={signOut}
                title='Sign out'
                className='rounded-md p-1 text-muted-foreground hover:bg-accent hover:text-red-500 transition-colors'
              >
                <LogOut size={14} />
              </button>
            )}
          </div>
        )}

        <Link
          href='/templates'
          title={collapsed ? 'Settings' : undefined}
          className='flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-foreground transition-colors'
        >
          <Settings size={16} className='shrink-0' />
          {!collapsed && <span className='text-xs'>Settings</span>}
        </Link>

        {collapsed && user && (
          <button
            onClick={signOut}
            title='Sign out'
            className='flex w-full items-center justify-center rounded-lg p-2 text-muted-foreground hover:bg-accent hover:text-red-500 transition-colors'
          >
            <LogOut size={15} />
          </button>
        )}

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
