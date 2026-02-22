'use client';
import { useEffect, useState } from 'react';
import { Send, MessageSquare } from 'lucide-react';
import api from '@/lib/api';
import { StatusBadge, Skeleton } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';

export default function AdminSupportPage() {
  const [tickets,  setTickets]  = useState<any[]>([]);
  const [selected, setSelected] = useState<any>(null);
  const [reply,    setReply]    = useState('');
  const [filter,   setFilter]   = useState('open');
  const [loading,  setLoading]  = useState(true);
  const [sending,  setSending]  = useState(false);
  const { toast }               = useToast();

  const load = () => {
    setLoading(true);
    api.get(`/support/tickets/admin?status=${filter}`)
      .then(r => setTickets(r.data))
      .finally(() => setLoading(false));
  };
  useEffect(load, [filter]);

  const sendReply = async () => {
    if (!reply.trim() || !selected) return;
    setSending(true);
    try {
      await api.post(`/support/tickets/${selected.id}/message`, { message: reply });
      toast('Reply sent', 'success');
      setReply('');
      load();
      const { data } = await api.get(`/support/tickets/admin`);
      setSelected(data.find((t: any) => t.id === selected.id) || null);
    } catch { toast('Failed to send', 'error'); }
    setSending(false);
  };

  const closeTicket = async (id: string) => {
    await api.put(`/support/tickets/${id}/status`, { status: 'closed' });
    toast('Ticket closed', 'success');
    setSelected(null); load();
  };

  if (selected) return (
    <div className="p-6 max-w-3xl">
      <div className="flex items-center justify-between mb-6">
        <button onClick={() => setSelected(null)} className="text-blue-400 hover:underline text-sm">← All Tickets</button>
        <div className="flex items-center gap-2">
          <StatusBadge status={selected.status.toUpperCase()}/>
          {selected.status !== 'closed' && (
            <Button size="sm" variant="secondary" onClick={() => closeTicket(selected.id)}>Close Ticket</Button>
          )}
        </div>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 mb-2">
        <p className="text-white font-semibold">{selected.subject}</p>
        <p className="text-gray-400 text-xs mt-1">From: @{selected.user?.username} ({selected.user?.email})</p>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 mb-4 space-y-4 max-h-[400px] overflow-y-auto">
        {selected.messages?.map((m: any) => (
          <div key={m.id} className={`flex ${m.isStaff ? 'justify-start' : 'justify-end'}`}>
            <div className={`max-w-sm rounded-xl px-4 py-3 text-sm ${m.isStaff ? 'bg-blue-900/40 text-blue-100 border border-blue-800/50' : 'bg-gray-800 text-gray-200'}`}>
              {m.isStaff && <p className="text-xs text-blue-400 mb-1 font-medium">Staff Reply</p>}
              <p>{m.message}</p>
              <p className="text-xs text-gray-500 mt-1">{new Date(m.createdAt).toLocaleString()}</p>
            </div>
          </div>
        ))}
      </div>

      {selected.status !== 'closed' && (
        <div className="flex gap-2">
          <textarea value={reply} onChange={e => setReply(e.target.value)} rows={3} placeholder="Type your reply as support staff..."
            className="flex-1 bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 resize-none text-sm"/>
          <Button onClick={sendReply} loading={sending} className="self-end"><Send className="w-4 h-4"/></Button>
        </div>
      )}
    </div>
  );

  return (
    <div className="p-6 max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">Support Tickets</h1>
        <div className="flex gap-2">
          {['open', 'closed'].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition capitalize ${filter === f ? 'bg-blue-600 text-white' : 'bg-gray-900 border border-gray-700 text-gray-400 hover:text-white'}`}>
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        {loading ? [...Array(5)].map((_, i) => <Skeleton key={i} className="h-20"/>)
        : tickets.length === 0 ? (
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-12 text-center text-gray-500">
            <MessageSquare className="w-10 h-10 mx-auto mb-3 opacity-40"/>
            No {filter} tickets
          </div>
        ) : tickets.map(t => (
          <div key={t.id} onClick={() => setSelected(t)}
            className="bg-gray-900 border border-gray-800 rounded-xl p-5 hover:border-blue-700 transition cursor-pointer">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-white font-medium">{t.subject}</p>
                <p className="text-gray-400 text-xs mt-1">@{t.user?.username} · {t.messages?.length || 0} messages</p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <StatusBadge status={t.status.toUpperCase()}/>
                <span className="text-gray-500 text-xs">{new Date(t.updatedAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
