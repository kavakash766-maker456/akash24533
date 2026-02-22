'use client';
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Skeleton } from '@/components/ui/Card';

export default function AuditLogsPage() {
  const [logs,    setLogs]    = useState<any[]>([]);
  const [page,    setPage]    = useState(1);
  const [total,   setTotal]   = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.get(`/admin/audit-logs?page=${page}`)
      .then(r => { setLogs(r.data.data); setTotal(r.data.total); })
      .finally(() => setLoading(false));
  }, [page]);

  const actionColors: Record<string, string> = {
    LOGIN:   'text-green-400',
    LOGOUT:  'text-gray-400',
    CREATE:  'text-blue-400',
    UPDATE:  'text-yellow-400',
    DELETE:  'text-red-400',
    SUSPEND: 'text-orange-400',
    BAN:     'text-red-500',
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Audit Logs</h1>
        <p className="text-gray-400 text-sm mt-1">{total.toLocaleString()} total events tracked</p>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-800 bg-gray-950">
              {['Time', 'User', 'Action', 'Entity', 'IP Address'].map(h => (
                <th key={h} className="text-left px-4 py-3 text-gray-400 font-medium text-xs uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? [...Array(10)].map((_, i) => (
              <tr key={i}><td colSpan={5} className="px-4 py-3"><Skeleton className="h-4"/></td></tr>
            )) : logs.length === 0 ? (
              <tr><td colSpan={5} className="text-center py-12 text-gray-500">No audit logs yet</td></tr>
            ) : logs.map(log => (
              <tr key={log.id} className="border-b border-gray-800/40 hover:bg-gray-800/20 transition">
                <td className="px-4 py-3 text-gray-400 text-xs whitespace-nowrap">{new Date(log.createdAt).toLocaleString()}</td>
                <td className="px-4 py-3 text-gray-300 text-xs">@{log.user?.username || 'system'}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs font-mono font-semibold ${actionColors[log.action] || 'text-gray-400'}`}>{log.action}</span>
                </td>
                <td className="px-4 py-3 text-gray-400 text-xs">{log.entity}{log.entityId ? ` · ${log.entityId.slice(0,8)}...` : ''}</td>
                <td className="px-4 py-3 text-gray-500 text-xs font-mono">{log.ipAddress || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex justify-center gap-2 mt-4">
        <button onClick={() => setPage(p => Math.max(1, p-1))} disabled={page === 1}
          className="px-4 py-2 bg-gray-900 border border-gray-700 text-gray-300 rounded-lg disabled:opacity-40 text-sm">← Prev</button>
        <span className="px-4 py-2 text-gray-400 text-sm">Page {page} of {Math.ceil(total/50)}</span>
        <button onClick={() => setPage(p => p+1)} disabled={page*50 >= total}
          className="px-4 py-2 bg-gray-900 border border-gray-700 text-gray-300 rounded-lg disabled:opacity-40 text-sm">Next →</button>
      </div>
    </div>
  );
}
