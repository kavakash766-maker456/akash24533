'use client';
import { useEffect, useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, DollarSign, CheckCircle } from 'lucide-react';
import api from '@/lib/api';
import { Skeleton } from '@/components/ui/Card';

export default function EarningsPage() {
  const [wallet, setWallet] = useState<any>(null);
  const [txns, setTxns]     = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.get('/wallet'), api.get('/wallet/transactions?limit=100')])
      .then(([w, t]) => { setWallet(w.data); setTxns(t.data.data); })
      .finally(() => setLoading(false));
  }, []);

  // Build last-30-days chart data
  const chartData = (() => {
    const days: Record<string, number> = {};
    for (let i = 29; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i);
      days[d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })] = 0;
    }
    txns.filter(t => t.type === 'EARNING').forEach(t => {
      const d = new Date(t.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      if (d in days) days[d] += Number(t.netAmount);
    });
    return Object.entries(days).map(([date, earned]) => ({ date, earned: +earned.toFixed(2) }));
  })();

  const earnings = txns.filter(t => t.type === 'EARNING');
  const thisMonth = earnings
    .filter(t => new Date(t.createdAt).getMonth() === new Date().getMonth())
    .reduce((s, t) => s + Number(t.netAmount), 0);

  if (loading) return <div className="p-6 space-y-4">{[...Array(4)].map((_, i) => <Skeleton key={i} className="h-24"/>)}</div>;

  return (
    <div className="p-6 max-w-4xl">
      <h1 className="text-2xl font-bold text-white mb-6">Earnings</h1>

      {/* Stat Cards */}
      <div className="grid sm:grid-cols-3 gap-4 mb-8">
        {[
          { icon: <DollarSign className="w-5 h-5"/>, label: 'Total Earned',   value: `$${Number(wallet?.totalEarned || 0).toFixed(2)}`, color: 'text-green-400 bg-green-400/10' },
          { icon: <TrendingUp className="w-5 h-5"/>,  label: 'This Month',     value: `$${thisMonth.toFixed(2)}`,                          color: 'text-blue-400 bg-blue-400/10' },
          { icon: <CheckCircle className="w-5 h-5"/>, label: 'Tasks Approved', value: String(earnings.length),                             color: 'text-purple-400 bg-purple-400/10' },
        ].map(c => (
          <div key={c.label} className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <div className={`inline-flex p-2 rounded-lg ${c.color} mb-3`}>{c.icon}</div>
            <p className="text-gray-400 text-sm mb-1">{c.label}</p>
            <p className="text-2xl font-bold text-white">{c.value}</p>
          </div>
        ))}
      </div>

      {/* Chart */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-6">
        <h2 className="text-lg font-semibold text-white mb-6">Daily Earnings (Last 30 Days)</h2>
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="earn" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#22c55e" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1f2937"/>
            <XAxis dataKey="date" tick={{ fill: '#6b7280', fontSize: 10 }} interval={6}/>
            <YAxis tick={{ fill: '#6b7280', fontSize: 10 }} tickFormatter={v => `$${v}`}/>
            <Tooltip contentStyle={{ background: '#111827', border: '1px solid #374151', borderRadius: 8 }}
              formatter={(v: any) => [`$${v}`, 'Earned']} labelStyle={{ color: '#9ca3af' }}/>
            <Area type="monotone" dataKey="earned" stroke="#22c55e" strokeWidth={2} fill="url(#earn)"/>
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Transaction list */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Earning History</h2>
        {earnings.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No earnings yet. Complete jobs to earn money!</p>
        ) : (
          <div className="space-y-3">
            {earnings.map(t => (
              <div key={t.id} className="flex items-center justify-between py-3 border-b border-gray-800 last:border-0">
                <div>
                  <p className="text-white text-sm font-medium">{t.description || 'Task earnings'}</p>
                  <p className="text-gray-500 text-xs mt-0.5">{new Date(t.createdAt).toLocaleDateString()}</p>
                </div>
                <div className="text-right">
                  <p className="text-green-400 font-bold">+${Number(t.netAmount).toFixed(2)}</p>
                  {Number(t.fee) > 0 && <p className="text-xs text-gray-500">fee: ${Number(t.fee).toFixed(2)}</p>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
