'use client';
import { useEffect, useState } from 'react';
import { Search, Shield, Ban, CheckCircle } from 'lucide-react';
import api from '@/lib/api';
import { StatusBadge, Skeleton } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';

export default function AdminUsersPage() {
  const [users, setUsers]   = useState<any[]>([]);
  const [total, setTotal]   = useState(0);
  const [page, setPage]     = useState(1);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const { toast }           = useToast();

  const load = () => {
    setLoading(true);
    api.get(`/users?page=${page}&search=${search}`)
      .then(r => { setUsers(r.data.data); setTotal(r.data.total); })
      .finally(() => setLoading(false));
  };
  useEffect(load, [page, search]);

  const setStatus = async (userId: string, status: string) => {
    try {
      await api.put(`/users/${userId}/status`, { status });
      toast(`User ${status.toLowerCase()}`, 'success');
      load();
    } catch { toast('Action failed', 'error'); }
  };

  const roleColors: Record<string, string> = {
    SUPER_ADMIN: 'text-red-400', ADMIN: 'text-orange-400', MODERATOR: 'text-purple-400',
    EMPLOYER: 'text-blue-400', WORKER: 'text-gray-400', SUPPORT_AGENT: 'text-green-400',
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">User Management</h1>
          <p className="text-gray-400 text-sm mt-1">{total.toLocaleString()} total users</p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500"/>
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search by email or username..."
            className="bg-gray-900 border border-gray-700 rounded-lg pl-10 pr-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 w-72"/>
        </div>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-800 bg-gray-950">
              {['User', 'Role', 'Status', 'Plan', 'Balance', 'Joined', 'Actions'].map(h => (
                <th key={h} className="text-left px-4 py-3 text-gray-400 font-medium text-xs uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? [...Array(8)].map((_, i) => (
              <tr key={i}><td colSpan={7} className="px-4 py-3"><Skeleton className="h-5 w-full"/></td></tr>
            )) : users.map(u => (
              <tr key={u.id} className="border-b border-gray-800/50 hover:bg-gray-800/30 transition">
                <td className="px-4 py-3">
                  <div>
                    <p className="text-white font-medium">{u.username}</p>
                    <p className="text-gray-500 text-xs">{u.email}</p>
                  </div>
                </td>
                <td className="px-4 py-3"><span className={`font-medium text-xs ${roleColors[u.role] || 'text-gray-400'}`}>{u.role}</span></td>
                <td className="px-4 py-3"><StatusBadge status={u.status}/></td>
                <td className="px-4 py-3"><span className="text-xs text-blue-400">{u.membershipPlan}</span></td>
                <td className="px-4 py-3 text-gray-300">${Number(u.wallet?.balance || 0).toFixed(2)}</td>
                <td className="px-4 py-3 text-gray-400 text-xs">{new Date(u.createdAt).toLocaleDateString()}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1">
                    {u.status !== 'ACTIVE' && (
                      <Button size="sm" variant="ghost" onClick={() => setStatus(u.id, 'ACTIVE')} title="Activate">
                        <CheckCircle className="w-4 h-4 text-green-400"/>
                      </Button>
                    )}
                    {u.status !== 'SUSPENDED' && (
                      <Button size="sm" variant="ghost" onClick={() => setStatus(u.id, 'SUSPENDED')} title="Suspend">
                        <Shield className="w-4 h-4 text-yellow-400"/>
                      </Button>
                    )}
                    {u.status !== 'BANNED' && (
                      <Button size="sm" variant="ghost" onClick={() => setStatus(u.id, 'BANNED')} title="Ban">
                        <Ban className="w-4 h-4 text-red-400"/>
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex justify-center gap-2 mt-4">
        <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
          className="px-4 py-2 bg-gray-900 border border-gray-700 text-gray-300 rounded-lg disabled:opacity-40 hover:border-gray-500 text-sm">← Prev</button>
        <span className="px-4 py-2 text-gray-400 text-sm">Page {page} of {Math.ceil(total / 20)}</span>
        <button onClick={() => setPage(p => p + 1)} disabled={page * 20 >= total}
          className="px-4 py-2 bg-gray-900 border border-gray-700 text-gray-300 rounded-lg disabled:opacity-40 hover:border-gray-500 text-sm">Next →</button>
      </div>
    </div>
  );
}
