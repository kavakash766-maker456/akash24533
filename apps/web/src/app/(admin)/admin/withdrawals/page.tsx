'use client';
import { useEffect, useState } from 'react';
import { CheckCircle, XCircle, DollarSign } from 'lucide-react';
import api from '@/lib/api';
import { StatusBadge, Skeleton } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toast';

export default function AdminWithdrawalsPage() {
  const [items, setItems]   = useState<any[]>([]);
  const [filter, setFilter] = useState('PENDING');
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<any>(null);
  const [rejectNote, setRejectNote] = useState('');
  const [acting, setActing] = useState(false);
  const { toast }           = useToast();

  const load = () => {
    setLoading(true);
    api.get(`/withdrawals/admin?status=${filter}`).then(r => setItems(r.data)).finally(() => setLoading(false));
  };
  useEffect(load, [filter]);

  const act = async (id: string, action: 'approve' | 'reject' | 'paid', note?: string) => {
    setActing(true);
    try {
      await api.put(`/withdrawals/${id}/${action}`, note ? { note } : {});
      toast(`Withdrawal ${action}d`, 'success');
      load(); setSelected(null); setRejectNote('');
    } catch (e: any) { toast(e.response?.data?.error || 'Failed', 'error'); }
    setActing(false);
  };

  const totalPending = items.reduce((s, i) => s + Number(i.amount), 0);

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Withdrawal Requests</h1>
          {filter === 'PENDING' && items.length > 0 && (
            <p className="text-yellow-400 text-sm mt-1">⚠️ {items.length} pending · Total: ${totalPending.toFixed(2)}</p>
          )}
        </div>
      </div>

      <div className="flex gap-2 mb-6">
        {['PENDING', 'APPROVED', 'PAID', 'REJECTED'].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${filter === f ? 'bg-blue-600 text-white' : 'bg-gray-900 border border-gray-700 text-gray-400 hover:text-white'}`}>
            {f}
          </button>
        ))}
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-800 bg-gray-950">
              {['User', 'Amount', 'Net (after fee)', 'Method', 'Status', 'Requested', 'Actions'].map(h => (
                <th key={h} className="text-left px-4 py-3 text-gray-400 font-medium text-xs uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? [...Array(5)].map((_, i) => (
              <tr key={i}><td colSpan={7} className="px-4 py-3"><Skeleton className="h-5 w-full"/></td></tr>
            )) : items.length === 0 ? (
              <tr><td colSpan={7} className="text-center py-12 text-gray-500">No {filter.toLowerCase()} withdrawals</td></tr>
            ) : items.map(w => (
              <tr key={w.id} className="border-b border-gray-800/50 hover:bg-gray-800/30 transition">
                <td className="px-4 py-3">
                  <p className="text-white font-medium">{w.user?.username}</p>
                  <p className="text-gray-500 text-xs">{w.user?.email}</p>
                </td>
                <td className="px-4 py-3 text-white font-bold">${Number(w.amount).toFixed(2)}</td>
                <td className="px-4 py-3 text-green-400 font-bold">${Number(w.netAmount).toFixed(2)}</td>
                <td className="px-4 py-3 text-gray-300 capitalize">{w.method}</td>
                <td className="px-4 py-3"><StatusBadge status={w.status}/></td>
                <td className="px-4 py-3 text-gray-400 text-xs">{new Date(w.createdAt).toLocaleDateString()}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1">
                    <Button size="sm" variant="ghost" onClick={() => setSelected(w)} title="Details">
                      <DollarSign className="w-4 h-4 text-blue-400"/>
                    </Button>
                    {w.status === 'PENDING' && (
                      <>
                        <Button size="sm" variant="ghost" onClick={() => act(w.id, 'approve')} title="Approve">
                          <CheckCircle className="w-4 h-4 text-green-400"/>
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => setSelected({ ...w, showReject: true })} title="Reject">
                          <XCircle className="w-4 h-4 text-red-400"/>
                        </Button>
                      </>
                    )}
                    {w.status === 'APPROVED' && (
                      <Button size="sm" variant="ghost" onClick={() => act(w.id, 'paid')} title="Mark Paid">
                        ✅
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selected && (
        <Modal open={!!selected} onClose={() => { setSelected(null); setRejectNote(''); }}
          title={selected.showReject ? 'Reject Withdrawal' : 'Withdrawal Details'}>
          {selected.showReject ? (
            <div className="space-y-4">
              <p className="text-gray-400 text-sm">Rejecting this withdrawal will refund <strong className="text-white">${Number(selected.amount).toFixed(2)}</strong> back to the user's wallet.</p>
              <textarea value={rejectNote} onChange={e => setRejectNote(e.target.value)}
                placeholder="Reason for rejection..." rows={3}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-red-500 resize-none"/>
              <div className="flex gap-3">
                <Button variant="secondary" className="flex-1" onClick={() => setSelected(null)}>Cancel</Button>
                <Button variant="danger" className="flex-1" loading={acting} onClick={() => act(selected.id, 'reject', rejectNote)}>Reject & Refund</Button>
              </div>
            </div>
          ) : (
            <div className="space-y-3 text-sm">
              {[
                ['User',     `@${selected.user?.username} (${selected.user?.email})`],
                ['Amount',   `$${Number(selected.amount).toFixed(2)}`],
                ['Fee',      `$${Number(selected.fee).toFixed(2)} (${(Number(selected.fee)/Number(selected.amount)*100).toFixed(1)}%)`],
                ['Net',      `$${Number(selected.netAmount).toFixed(2)}`],
                ['Method',   selected.method],
                ['Status',   selected.status],
                ['Requested',new Date(selected.createdAt).toLocaleString()],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between py-2 border-b border-gray-800 last:border-0">
                  <span className="text-gray-400">{k}</span>
                  <span className="text-white font-medium">{v}</span>
                </div>
              ))}
              <div className="bg-gray-800 rounded-lg p-3 mt-2">
                <p className="text-gray-400 text-xs mb-1">Payment Details</p>
                <pre className="text-white text-xs whitespace-pre-wrap">{JSON.stringify(selected.accountDetails, null, 2)}</pre>
              </div>
            </div>
          )}
        </Modal>
      )}
    </div>
  );
}
