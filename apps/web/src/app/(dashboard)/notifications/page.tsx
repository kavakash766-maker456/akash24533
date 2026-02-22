'use client';
import { useEffect, useState } from 'react';
import { Bell, Check, CheckCheck } from 'lucide-react';
import api from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/Card';

const typeIcon: Record<string, string> = {
  submission:   '📤', payment: '💰', job_approved: '✅',
  job_rejected: '❌', system: '🔔', referral: '🎁',
};

export default function NotificationsPage() {
  const [notifs, setNotifs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () => api.get('/notifications').then(r => setNotifs(r.data)).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const markRead = async (id: string) => {
    await api.put(`/notifications/${id}/read`);
    setNotifs(ns => ns.map(n => n.id === id ? { ...n, isRead: true } : n));
  };

  const markAllRead = async () => {
    await api.put('/notifications/read-all');
    setNotifs(ns => ns.map(n => ({ ...n, isRead: true })));
  };

  const unread = notifs.filter(n => !n.isRead).length;

  return (
    <div className="p-6 max-w-2xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Notifications</h1>
          {unread > 0 && <p className="text-blue-400 text-sm mt-1">{unread} unread</p>}
        </div>
        {unread > 0 && <Button variant="secondary" size="sm" onClick={markAllRead}><CheckCheck className="w-4 h-4"/> Mark all read</Button>}
      </div>

      {loading ? (
        <div className="space-y-2">{[...Array(5)].map((_, i) => <div key={i} className="h-16 bg-gray-800 rounded-xl animate-pulse"/>)}</div>
      ) : notifs.length === 0 ? (
        <div className="bg-gray-900 border border-gray-800 rounded-xl">
          <EmptyState icon="🔔" title="No notifications" description="You're all caught up!"/>
        </div>
      ) : (
        <div className="space-y-2">
          {notifs.map(n => (
            <div key={n.id} onClick={() => !n.isRead && markRead(n.id)}
              className={`flex items-start gap-4 p-4 rounded-xl border transition cursor-pointer ${
                n.isRead ? 'bg-gray-900 border-gray-800' : 'bg-blue-950/30 border-blue-800/40 hover:border-blue-700/60'
              }`}>
              <span className="text-2xl flex-shrink-0">{typeIcon[n.type] || '🔔'}</span>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium ${n.isRead ? 'text-gray-300' : 'text-white'}`}>{n.title}</p>
                <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{n.message}</p>
                <p className="text-xs text-gray-600 mt-1">{new Date(n.createdAt).toLocaleString()}</p>
              </div>
              {!n.isRead && <div className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0 mt-1"/>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
