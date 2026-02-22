// src/app/(admin)/layout.tsx
'use client';
import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import {
  LayoutDashboard, Users, Briefcase, DollarSign, BarChart2,
  Settings, LogOut, MessageSquare, ScrollText, ChevronRight
} from 'lucide-react';

const adminNav = [
  { href: '/admin',              label: 'Dashboard',    icon: LayoutDashboard },
  { href: '/admin/users',        label: 'Users',        icon: Users           },
  { href: '/admin/jobs',         label: 'Jobs',         icon: Briefcase       },
  { href: '/admin/withdrawals',  label: 'Withdrawals',  icon: DollarSign      },
  { href: '/admin/analytics',    label: 'Analytics',    icon: BarChart2       },
  { href: '/admin/support',      label: 'Support',      icon: MessageSquare   },
  { href: '/admin/audit-logs',   label: 'Audit Logs',   icon: ScrollText      },
  { href: '/admin/settings',     label: 'Settings',     icon: Settings        },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuthStore();
  const router           = useRouter();
  const pathname         = usePathname();

  useEffect(() => {
    if (!user) { router.push('/login'); return; }
    if (!['ADMIN','SUPER_ADMIN','MODERATOR','SUPPORT_AGENT'].includes(user.role)) {
      router.push('/dashboard');
    }
  }, [user]);

  if (!user) return null;

  return (
    <div className="flex min-h-screen bg-gray-950">
      <aside className="w-64 bg-gray-900 border-r border-gray-800 flex flex-col">
        <div className="p-6 border-b border-gray-800">
          <span className="text-xl font-bold text-red-400">Admin Panel</span>
          <p className="text-xs text-gray-500 mt-1">TaskEarn Pro</p>
          <div className="mt-3">
            <p className="text-sm text-white font-medium">{user.firstName} {user.lastName}</p>
            <span className="text-xs bg-red-900/30 text-red-400 border border-red-800/50 px-2 py-0.5 rounded-full">
              {user.role.replace('_', ' ')}
            </span>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {adminNav.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || (href !== '/admin' && pathname.startsWith(href));
            return (
              <Link key={href} href={href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                  active ? 'bg-red-600/20 text-red-400 border border-red-600/30'
                         : 'text-gray-400 hover:text-white hover:bg-gray-800'
                }`}>
                <Icon className="w-4 h-4 flex-shrink-0"/>
                {label}
                {active && <ChevronRight className="w-3 h-3 ml-auto"/>}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-800">
          <Link href="/dashboard" className="flex items-center gap-2 px-3 py-2 text-sm text-gray-400 hover:text-white rounded-lg hover:bg-gray-800 transition mb-1">
            ← Back to Dashboard
          </Link>
          <button onClick={logout}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-400 hover:text-red-400 rounded-lg hover:bg-gray-800 transition">
            <LogOut className="w-4 h-4"/> Sign Out
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}
