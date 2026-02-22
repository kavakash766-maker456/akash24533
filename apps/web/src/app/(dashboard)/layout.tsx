// src/app/(dashboard)/layout.tsx
'use client';
import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/stores/authStore';
import {
  LayoutDashboard, Briefcase, FileCheck, Wallet, TrendingUp,
  Users, Bell, Settings, LogOut, Gift, HelpCircle, ChevronRight, Zap
} from 'lucide-react';

const workerNav = [
  { href: '/dashboard',     label: 'Dashboard',    icon: LayoutDashboard },
  { href: '/jobs',          label: 'Browse Jobs',  icon: Briefcase       },
  { href: '/submissions',   label: 'Submissions',  icon: FileCheck       },
  { href: '/earnings',      label: 'Earnings',     icon: TrendingUp      },
  { href: '/wallet',        label: 'Wallet',       icon: Wallet          },
  { href: '/referrals',     label: 'Referrals',    icon: Gift            },
  { href: '/memberships',   label: 'Upgrade Plan', icon: Zap             },
  { href: '/notifications', label: 'Notifications',icon: Bell            },
  { href: '/support',       label: 'Support',      icon: HelpCircle      },
  { href: '/settings',      label: 'Settings',     icon: Settings        },
];

const employerNav = [
  { href: '/dashboard',     label: 'Dashboard',    icon: LayoutDashboard },
  { href: '/jobs/create',   label: 'Post a Job',   icon: Briefcase       },
  { href: '/my-jobs',       label: 'My Jobs',      icon: FileCheck       },
  { href: '/wallet',        label: 'Wallet',       icon: Wallet          },
  { href: '/referrals',     label: 'Referrals',    icon: Gift            },
  { href: '/notifications', label: 'Notifications',icon: Bell            },
  { href: '/support',       label: 'Support',      icon: HelpCircle      },
  { href: '/settings',      label: 'Settings',     icon: Settings        },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuthStore();
  const router           = useRouter();
  const pathname         = usePathname();

  useEffect(() => {
    if (!user) router.push('/login');
    // Redirect admins to admin panel
    if (user?.role && ['ADMIN', 'SUPER_ADMIN', 'MODERATOR'].includes(user.role)) {
      router.push('/admin');
    }
  }, [user]);

  if (!user) return null;

  const isEmployer = user.role === 'EMPLOYER';
  const navItems   = isEmployer ? employerNav : workerNav;

  return (
    <div className="flex min-h-screen bg-gray-950">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-900 border-r border-gray-800 flex flex-col">
        {/* Logo */}
        <div className="p-6 border-b border-gray-800">
          <Link href="/dashboard" className="text-xl font-bold text-blue-400">TaskEarn Pro</Link>
          <div className="mt-3 flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center text-sm font-bold text-white">
              {user.firstName[0]}{user.lastName[0]}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-medium text-white truncate">{user.firstName} {user.lastName}</p>
              <p className="text-xs text-gray-400 truncate capitalize">{user.role.toLowerCase()}</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || pathname.startsWith(href + '/');
            return (
              <Link key={href} href={href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                  active
                    ? 'bg-blue-600/20 text-blue-400 border border-blue-600/30'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800'
                }`}>
                <Icon className="w-4 h-4 flex-shrink-0"/>
                {label}
                {active && <ChevronRight className="w-3 h-3 ml-auto"/>}
              </Link>
            );
          })}
        </nav>

        {/* Bottom: wallet balance */}
        <div className="p-4 border-t border-gray-800 space-y-3">
          <Link href="/wallet" className="block bg-blue-600/10 border border-blue-600/30 rounded-xl p-3">
            <p className="text-xs text-gray-400 mb-1">Wallet Balance</p>
            <p className="text-lg font-bold text-white">$0.00</p>
            <p className="text-xs text-blue-400 mt-1">Tap to manage →</p>
          </Link>
          <button onClick={logout}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-400 hover:text-red-400 rounded-lg hover:bg-gray-800 transition">
            <LogOut className="w-4 h-4"/> Sign Out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}
