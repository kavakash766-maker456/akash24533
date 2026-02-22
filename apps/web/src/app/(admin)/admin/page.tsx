// src/app/(admin)/admin/page.tsx
'use client';
import { useEffect, useState } from 'react';
import { Users, Briefcase, DollarSign, Clock, AlertCircle } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import api from '@/lib/api';

interface DashStats {
  totalUsers: number; activeJobs: number;
  pendingJobs: number; pendingWithdrawals: number; platformRevenue: number;
}

export default function AdminDashboard() {
  const [stats, setStats]     = useState<DashStats | null>(null);
  const [analytics, setAnalytics] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/admin/dashboard'),
      api.get('/admin/analytics'),
    ]).then(([s, a]) => {
      setStats(s.data);
      setAnalytics(a.data);
    }).finally(() => setLoading(false));
  }, []);

  const cards = stats ? [
    { label: 'Total Users',           value: stats.totalUsers.toLocaleString(),         icon: <Users className="w-5 h-5"/>,        color: 'text-blue-400 bg-blue-400/10' },
    { label: 'Active Jobs',           value: stats.activeJobs.toLocaleString(),          icon: <Briefcase className="w-5 h-5"/>,    color: 'text-green-400 bg-green-400/10' },
    { label: 'Pending Approval',      value: stats.pendingJobs.toLocaleString(),         icon: <AlertCircle className="w-5 h-5"/>, color: 'text-yellow-400 bg-yellow-400/10' },
    { label: 'Platform Revenue',      value: `$${Number(stats.platformRevenue).toFixed(2)}`, icon: <DollarSign className="w-5 h-5"/>, color: 'text-purple-400 bg-purple-400/10' },
    { label: 'Pending Withdrawals',   value: stats.pendingWithdrawals.toLocaleString(),  icon: <Clock className="w-5 h-5"/>,       color: 'text-red-400 bg-red-400/10' },
  ] : [];

  return (
    <div className="p-6 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
        <p className="text-gray-400 mt-1">Platform overview & statistics</p>
      </div>

      {/* Stat Cards */}
      <div className="grid sm:grid-cols-2 xl:grid-cols-5 gap-4 mb-8">
        {loading ? [...Array(5)].map((_, i) => (
          <div key={i} className="bg-gray-900 border border-gray-800 rounded-xl p-5 animate-pulse">
            <div className="w-10 h-10 bg-gray-800 rounded-lg mb-3"/>
            <div className="w-20 h-3 bg-gray-800 rounded mb-2"/>
            <div className="w-16 h-6 bg-gray-800 rounded"/>
          </div>
        )) : cards.map(c => (
          <div key={c.label} className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <div className={`inline-flex p-2 rounded-lg ${c.color} mb-3`}>{c.icon}</div>
            <p className="text-gray-400 text-xs mb-1">{c.label}</p>
            <p className="text-2xl font-bold text-white">{c.value}</p>
          </div>
        ))}
      </div>

      {/* Revenue Chart */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-6">
        <h2 className="text-lg font-semibold text-white mb-6">Monthly Revenue (last 12 months)</h2>
        {analytics.length > 0 ? (
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={analytics}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f2937"/>
              <XAxis dataKey="month" tick={{ fill: '#6b7280', fontSize: 12 }}/>
              <YAxis tick={{ fill: '#6b7280', fontSize: 12 }}/>
              <Tooltip
                contentStyle={{ background: '#111827', border: '1px solid #374151', borderRadius: 8 }}
                labelStyle={{ color: '#fff' }} itemStyle={{ color: '#60a5fa' }}/>
              <Line type="monotone" dataKey="revenue" stroke="#60a5fa" strokeWidth={2} dot={false}/>
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-64 flex items-center justify-center text-gray-500">Loading chart...</div>
        )}
      </div>

      {/* Quick Admin Links */}
      <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
        {[
          { href: '/admin/jobs',        label: '📋 Review Pending Jobs',     desc: `${stats?.pendingJobs || 0} jobs awaiting review` },
          { href: '/admin/withdrawals', label: '💸 Process Withdrawals',      desc: `${stats?.pendingWithdrawals || 0} withdrawal requests` },
          { href: '/admin/users',       label: '👥 Manage Users',             desc: `${stats?.totalUsers || 0} total users` },
        ].map(a => (
          <a key={a.href} href={a.href}
            className="bg-gray-900 border border-gray-800 hover:border-blue-700 rounded-xl p-5 transition">
            <p className="font-medium text-white mb-1">{a.label}</p>
            <p className="text-sm text-gray-400">{a.desc}</p>
          </a>
        ))}
      </div>
    </div>
  );
}
