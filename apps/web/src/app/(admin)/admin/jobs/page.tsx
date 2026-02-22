'use client';
import { useEffect, useState } from 'react';
import { CheckCircle, XCircle, Eye } from 'lucide-react';
import api from '@/lib/api';
import { StatusBadge, Skeleton } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toast';

export default function AdminJobsPage() {
  const [jobs, setJobs]     = useState<any[]>([]);
  const [filter, setFilter] = useState('PENDING_REVIEW');
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<any>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [acting, setActing] = useState(false);
  const { toast }           = useToast();

  const load = () => {
    setLoading(true);
    const { prisma: _ , ...rest } = {} as any; // placeholder
    api.get('/jobs/admin').then(r => {
      const all = r.data;
      setJobs(filter ? all.filter((j: any) => j.status === filter) : all);
    }).catch(() => {
      // fallback: get jobs from employer endpoint with admin role
      api.get(`/jobs?status=${filter}&limit=50`).then(r => setJobs(r.data.data || []));
    }).finally(() => setLoading(false));
  };
  useEffect(load, [filter]);

  const approve = async (jobId: string) => {
    setActing(true);
    try { await api.put(`/jobs/${jobId}/approve`); toast('Job approved ✅', 'success'); load(); setSelected(null); }
    catch (e: any) { toast(e.response?.data?.error || 'Failed', 'error'); }
    setActing(false);
  };

  const reject = async (jobId: string) => {
    setActing(true);
    try { await api.put(`/jobs/${jobId}/reject`, { reason: rejectReason || 'Does not meet guidelines' }); toast('Job rejected', 'success'); load(); setSelected(null); }
    catch (e: any) { toast(e.response?.data?.error || 'Failed', 'error'); }
    setActing(false);
  };

  const filters = ['PENDING_REVIEW', 'ACTIVE', 'PAUSED', 'CANCELLED', 'COMPLETED'];

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-white mb-6">Job Management</h1>

      <div className="flex gap-2 mb-6 flex-wrap">
        {filters.map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${filter === f ? 'bg-blue-600 text-white' : 'bg-gray-900 border border-gray-700 text-gray-400 hover:text-white'}`}>
            {f.replace('_', ' ')}
          </button>
        ))}
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-800 bg-gray-950">
              {['Title', 'Employer', 'Budget', 'Workers', 'Status', 'Created', 'Actions'].map(h => (
                <th key={h} className="text-left px-4 py-3 text-gray-400 font-medium text-xs uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? [...Array(6)].map((_, i) => (
              <tr key={i}><td colSpan={7} className="px-4 py-3"><Skeleton className="h-5 w-full"/></td></tr>
            )) : jobs.length === 0 ? (
              <tr><td colSpan={7} className="text-center py-12 text-gray-500">No jobs with status: {filter}</td></tr>
            ) : jobs.map(j => (
              <tr key={j.id} className="border-b border-gray-800/50 hover:bg-gray-800/30 transition">
                <td className="px-4 py-3 max-w-xs">
                  <p className="text-white font-medium truncate">{j.title}</p>
                  <p className="text-gray-500 text-xs">{j.category?.name}</p>
                </td>
                <td className="px-4 py-3 text-gray-300 text-xs">@{j.employer?.username}</td>
                <td className="px-4 py-3 text-green-400 font-medium">${Number(j.budgetPerWorker).toFixed(2)}</td>
                <td className="px-4 py-3 text-gray-300">{j.workersCompleted}/{j.workersRequired}</td>
                <td className="px-4 py-3"><StatusBadge status={j.status}/></td>
                <td className="px-4 py-3 text-gray-400 text-xs">{new Date(j.createdAt).toLocaleDateString()}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1">
                    <Button size="sm" variant="ghost" onClick={() => setSelected(j)} title="View"><Eye className="w-4 h-4 text-blue-400"/></Button>
                    {j.status === 'PENDING_REVIEW' && (
                      <>
                        <Button size="sm" variant="ghost" onClick={() => approve(j.id)} title="Approve"><CheckCircle className="w-4 h-4 text-green-400"/></Button>
                        <Button size="sm" variant="ghost" onClick={() => setSelected({ ...j, showReject: true })} title="Reject"><XCircle className="w-4 h-4 text-red-400"/></Button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Job Detail / Reject Modal */}
      {selected && (
        <Modal open={!!selected} onClose={() => { setSelected(null); setRejectReason(''); }}
          title={selected.showReject ? `Reject: ${selected.title}` : selected.title} size="lg">
          {selected.showReject ? (
            <div className="space-y-4">
              <textarea value={rejectReason} onChange={e => setRejectReason(e.target.value)}
                placeholder="Reason for rejection (required)..." rows={4}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-red-500 resize-none"/>
              <div className="flex gap-3">
                <Button variant="secondary" className="flex-1" onClick={() => setSelected(null)}>Cancel</Button>
                <Button variant="danger" className="flex-1" loading={acting} onClick={() => reject(selected.id)}>Reject & Refund Employer</Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-3">
                {[
                  ['Status',    selected.status],
                  ['Budget',    `$${Number(selected.budgetPerWorker).toFixed(2)}/worker`],
                  ['Workers',   `${selected.workersRequired} required`],
                  ['Deadline',  new Date(selected.deadline).toLocaleDateString()],
                  ['ProofType', selected.proofType],
                  ['Employer',  `@${selected.employer?.username}`],
                ].map(([k, v]) => (
                  <div key={k} className="bg-gray-800 rounded-lg p-3">
                    <p className="text-gray-500 text-xs">{k}</p>
                    <p className="text-white font-medium mt-0.5">{v}</p>
                  </div>
                ))}
              </div>
              <div>
                <p className="text-gray-400 font-medium mb-1">Description</p>
                <p className="text-gray-300 bg-gray-800 rounded-lg p-3">{selected.description}</p>
              </div>
              <div>
                <p className="text-gray-400 font-medium mb-1">Instructions</p>
                <p className="text-gray-300 bg-gray-800 rounded-lg p-3">{selected.instructions}</p>
              </div>
              {selected.status === 'PENDING_REVIEW' && (
                <div className="flex gap-3 pt-2">
                  <Button variant="danger" className="flex-1" onClick={() => setSelected({ ...selected, showReject: true })}>Reject</Button>
                  <Button className="flex-1" loading={acting} onClick={() => approve(selected.id)}>✅ Approve Job</Button>
                </div>
              )}
            </div>
          )}
        </Modal>
      )}
    </div>
  );
}
