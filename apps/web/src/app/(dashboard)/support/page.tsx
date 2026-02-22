'use client';
import { useEffect, useState } from 'react';
import { Send, Plus } from 'lucide-react';
import api from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { StatusBadge, EmptyState } from '@/components/ui/Card';
import { Modal } from '@/components/ui/Modal';
import { Input, Textarea } from '@/components/ui/Input';
import { useToast } from '@/components/ui/Toast';

export default function SupportPage() {
  const [tickets, setTickets] = useState<any[]>([]);
  const [selected, setSelected] = useState<any>(null);
  const [reply, setReply]     = useState('');
  const [loading, setLoading] = useState(true);
  const [showNew, setShowNew] = useState(false);
  const [sending, setSending] = useState(false);
  const [newForm, setNewForm] = useState({ subject: '', message: '' });
  const { toast }             = useToast();

  const load = () => api.get('/support/tickets/my').then(r => setTickets(r.data)).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const createTicket = async () => {
    if (!newForm.subject.trim() || !newForm.message.trim()) return;
    setSending(true);
    try {
      await api.post('/support/tickets', newForm);
      toast('Ticket created!', 'success');
      setShowNew(false);
      setNewForm({ subject: '', message: '' });
      load();
    } catch { toast('Failed to create ticket', 'error'); }
    setSending(false);
  };

  const sendReply = async () => {
    if (!reply.trim() || !selected) return;
    setSending(true);
    try {
      await api.post(`/support/tickets/${selected.id}/message`, { message: reply });
      setReply('');
      const { data } = await api.get('/support/tickets/my');
      const updated = data.find((t: any) => t.id === selected.id);
      setSelected(updated);
      setTickets(data);
    } catch { toast('Failed to send', 'error'); }
    setSending(false);
  };

  if (selected) return (
    <div className="p-6 max-w-2xl">
      <button onClick={() => setSelected(null)} className="text-blue-400 hover:underline text-sm mb-6">← Back to tickets</button>
      <div className="flex items-center gap-3 mb-6">
        <h1 className="text-xl font-bold text-white flex-1">{selected.subject}</h1>
        <StatusBadge status={selected.status.toUpperCase()}/>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 mb-4 space-y-4 max-h-[400px] overflow-y-auto">
        {selected.messages?.map((m: any) => (
          <div key={m.id} className={`flex ${m.isStaff ? 'justify-start' : 'justify-end'}`}>
            <div className={`max-w-xs rounded-xl px-4 py-3 text-sm ${m.isStaff ? 'bg-gray-800 text-gray-200' : 'bg-blue-600 text-white'}`}>
              {m.isStaff && <p className="text-xs text-gray-400 mb-1 font-medium">Support Team</p>}
              <p>{m.message}</p>
              <p className={`text-xs mt-1 ${m.isStaff ? 'text-gray-500' : 'text-blue-200'}`}>
                {new Date(m.createdAt).toLocaleString()}
              </p>
            </div>
          </div>
        ))}
      </div>

      {selected.status !== 'closed' && (
        <div className="flex gap-2">
          <textarea value={reply} onChange={e => setReply(e.target.value)}
            placeholder="Type your reply..." rows={3}
            className="flex-1 bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 resize-none text-sm"/>
          <Button onClick={sendReply} loading={sending} className="self-end"><Send className="w-4 h-4"/></Button>
        </div>
      )}
    </div>
  );

  return (
    <div className="p-6 max-w-2xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">Support</h1>
        <Button onClick={() => setShowNew(true)}><Plus className="w-4 h-4"/> New Ticket</Button>
      </div>

      {loading ? <div className="text-gray-400">Loading...</div>
      : tickets.length === 0 ? (
        <div className="bg-gray-900 border border-gray-800 rounded-xl">
          <EmptyState icon="🎟️" title="No support tickets" description="Need help? Open a ticket and our team will respond shortly."
            action={<Button onClick={() => setShowNew(true)}>Open a Ticket</Button>}/>
        </div>
      ) : (
        <div className="space-y-3">
          {tickets.map(t => (
            <div key={t.id} onClick={() => setSelected(t)}
              className="bg-gray-900 border border-gray-800 rounded-xl p-5 hover:border-gray-600 transition cursor-pointer">
              <div className="flex items-center justify-between mb-1">
                <p className="font-medium text-white">{t.subject}</p>
                <StatusBadge status={t.status.toUpperCase()}/>
              </div>
              <p className="text-xs text-gray-500">{t.messages?.length || 0} messages · Last updated {new Date(t.updatedAt).toLocaleDateString()}</p>
            </div>
          ))}
        </div>
      )}

      <Modal open={showNew} onClose={() => setShowNew(false)} title="New Support Ticket">
        <div className="space-y-4">
          <Input label="Subject" value={newForm.subject} onChange={e => setNewForm({...newForm, subject: e.target.value})} placeholder="What do you need help with?"/>
          <Textarea label="Message" value={newForm.message} onChange={e => setNewForm({...newForm, message: e.target.value})} placeholder="Describe your issue in detail..." rows={5}/>
          <div className="flex gap-3">
            <Button variant="secondary" className="flex-1" onClick={() => setShowNew(false)}>Cancel</Button>
            <Button className="flex-1" loading={sending} onClick={createTicket}>Submit Ticket</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
