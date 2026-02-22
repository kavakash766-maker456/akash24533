// src/app/(dashboard)/dashboard/page.tsx
'use client';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { DollarSign, Briefcase, CheckCircle, Clock, TrendingUp } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import api from '@/lib/api';

interface Stats {
  balance:      number;
  totalEarned:  number;
  activeJobs:   number;
  pendingCount: number;
}

function StatCard({ icon, label, value, color }: { icon: any; label: string; value: string; color: string }) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      className="bg-gray-900 border border-gray-800 rounded-xl p-6">
      <div className={`inline-flex p-2 rounded-lg ${color} mb-4`}>{icon}</div>
      <p className="text-gray-400 text-sm mb-1">{label}</p>
      <p className="text-2xl font-bold text-white">{value}</p>
    </motion.div>
  );
}

export default function DashboardPage() {
  const { user }      = useAuthStore();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const { data: wallet } = await api.get('/wallet');
        const { data: subs }   = await api.get('/submissions/my?limit=1');
        setStats({
          balance:      Number(wallet.balance),
          totalEarned:  Number(wallet.totalEarned),
          activeJobs:   0,
          pendingCount: 0,
        });
      } catch (e) {}
      setLoading(false);
    };
    loadStats();
  }, []);

  return (
    <div className="p-6 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">
          Good morning, {user?.firstName}! 👋
        </h1>
        <p className="text-gray-400 mt-1">Here's your overview for today.</p>
      </div>

      {/* Stat Cards */}
      {loading ? (
        <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-gray-900 border border-gray-800 rounded-xl p-6 animate-pulse">
              <div className="w-10 h-10 bg-gray-800 rounded-lg mb-4"/>
              <div className="w-24 h-3 bg-gray-800 rounded mb-2"/>
              <div className="w-16 h-6 bg-gray-800 rounded"/>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
          <StatCard icon={<DollarSign className="w-5 h-5 text-green-400"/>}
            label="Wallet Balance" value={`$${(stats?.balance || 0).toFixed(2)}`}
            color="bg-green-400/10"/>
          <StatCard icon={<TrendingUp className="w-5 h-5 text-blue-400"/>}
            label="Total Earned" value={`$${(stats?.totalEarned || 0).toFixed(2)}`}
            color="bg-blue-400/10"/>
          <StatCard icon={<Briefcase className="w-5 h-5 text-purple-400"/>}
            label="Active Jobs" value={String(stats?.activeJobs || 0)}
            color="bg-purple-400/10"/>
          <StatCard icon={<Clock className="w-5 h-5 text-yellow-400"/>}
            label="Pending Reviews" value={String(stats?.pendingCount || 0)}
            color="bg-yellow-400/10"/>
        </div>
      )}

      {/* Quick Actions */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Quick Actions</h2>
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3">
          {[
            { href: '/jobs',        label: '🔍 Browse Jobs',     desc: 'Find tasks to complete' },
            { href: '/wallet',      label: '💳 Add Funds',       desc: 'Deposit to wallet' },
            { href: '/submissions', label: '📋 My Submissions',  desc: 'Track your work' },
          ].map(a => (
            <a key={a.href} href={a.href}
              className="border border-gray-700 hover:border-blue-600 rounded-xl p-4 transition group">
              <p className="font-medium text-white group-hover:text-blue-400 transition">{a.label}</p>
              <p className="text-sm text-gray-400 mt-1">{a.desc}</p>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
