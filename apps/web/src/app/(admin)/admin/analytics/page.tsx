'use client';
import { useEffect, useState } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import api from '@/lib/api';

const COLORS = ['#60a5fa', '#34d399', '#f59e0b', '#f87171', '#a78bfa'];

export default function AdminAnalyticsPage() {
  const [monthly, setMonthly] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/analytics').then(r => setMonthly(r.data)).finally(() => setLoading(false));
  }, []);

  const planData = [
    { name: 'Free',    value: 65 },
    { name: 'Pro',     value: 25 },
    { name: 'Premium', value: 10 },
  ];

  const tooltip = { contentStyle: { background: '#111827', border: '1px solid #374151', borderRadius: 8 }, labelStyle: { color: '#9ca3af' } };

  return (
    <div className="p-6 max-w-6xl">
      <h1 className="text-2xl font-bold text-white mb-8">Platform Analytics</h1>

      {loading ? (
        <div className="grid grid-cols-2 gap-6">{[...Array(4)].map((_, i) => <div key={i} className="h-64 bg-gray-800 rounded-xl animate-pulse"/>)}</div>
      ) : (
        <div className="space-y-6">
          {/* Revenue */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-white mb-1">Monthly Revenue (USD)</h2>
            <p className="text-gray-500 text-sm mb-6">Platform commission earnings over last 12 months</p>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={monthly}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937"/>
                <XAxis dataKey="month" tick={{ fill: '#6b7280', fontSize: 11 }}/>
                <YAxis tick={{ fill: '#6b7280', fontSize: 11 }} tickFormatter={v => `$${v}`}/>
                <Tooltip {...tooltip} formatter={(v: any) => [`$${v}`, 'Revenue']}/>
                <Bar dataKey="revenue" fill="#60a5fa" radius={[4,4,0,0]}/>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* New Users */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
              <h2 className="text-lg font-semibold text-white mb-6">New Users per Month</h2>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={monthly}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1f2937"/>
                  <XAxis dataKey="month" tick={{ fill: '#6b7280', fontSize: 10 }}/>
                  <YAxis tick={{ fill: '#6b7280', fontSize: 10 }}/>
                  <Tooltip {...tooltip} formatter={(v: any) => [v, 'New Users']}/>
                  <Line type="monotone" dataKey="newUsers" stroke="#34d399" strokeWidth={2} dot={false}/>
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* New Jobs */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
              <h2 className="text-lg font-semibold text-white mb-6">New Jobs per Month</h2>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={monthly}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1f2937"/>
                  <XAxis dataKey="month" tick={{ fill: '#6b7280', fontSize: 10 }}/>
                  <YAxis tick={{ fill: '#6b7280', fontSize: 10 }}/>
                  <Tooltip {...tooltip} formatter={(v: any) => [v, 'New Jobs']}/>
                  <Line type="monotone" dataKey="newJobs" stroke="#f59e0b" strokeWidth={2} dot={false}/>
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Plan distribution */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-white mb-6">Membership Plan Distribution (estimated)</h2>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={planData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, value }) => `${name}: ${value}%`}>
                  {planData.map((_, i) => <Cell key={i} fill={COLORS[i]}/>)}
                </Pie>
                <Legend formatter={(v) => <span className="text-gray-400 text-sm">{v}</span>}/>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}
