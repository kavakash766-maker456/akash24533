'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, Users, Eye, Pause, Play, Trash2 } from 'lucide-react';
import api from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { StatusBadge, EmptyState, Skeleton } from '@/components/ui/Card';
import { useToast } from '@/components/ui/Toast';

export default function MyJobsPage() {
  const [jobs, setJobs]   = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast }         = useToast();

  const load = () => {
    api.get('/jobs/my').then(r => setJobs(r.data)).finally(() => setLoading(false));
  };
  useEffect(load, []);

  const toggleStatus = async (jobId: string, current: string) => {
    const newStatus = current === 'ACTIVE' ? 'PAUSED' : 'ACTIVE';
    try {
      await api.put(`/jobs/${jobId}/status`, { status: newStatus });
      toast(`Job ${newStatus === 'ACTIVE' ? 'resumed' : 'paused'}`, 'success');
      load();
    } catch (e: any) { toast(e.response?.data?.error || 'Failed', 'error'); }
  };

  return (
    <div className="p-6 max-w-5xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">My Jobs</h1>
          <p className="text-gray-400 mt-1">{jobs.length} job{jobs.length !== 1 ? 's' : ''} posted</p>
        </div>
        <Link href="/jobs/create">
          <Button><Plus className="w-4 h-4"/> Post New Job</Button>
        </Link>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-24 w-full"/>)}
        </div>
      ) : jobs.length === 0 ? (
        <div className="bg-gray-900 border border-gray-800 rounded-xl">
          <EmptyState icon="📋" title="No jobs yet" description="Post your first job and start getting work done."
            action={<Link href="/jobs/create"><Button>Post a Job</Button></Link>}/>
        </div>
      ) : (
        <div className="space-y-3">
          {jobs.map(job => {
            const completion = Math.round((job.workersCompleted / job.workersRequired) * 100);
            return (
              <div key={job.id} className="bg-gray-900 border border-gray-800 rounded-xl p-5 hover:border-gray-700 transition">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <StatusBadge status={job.status}/>
                      {job.isFeatured && <span className="text-xs bg-yellow-900/30 text-yellow-400 border border-yellow-800/50 px-2 py-0.5 rounded-full">⭐ Featured</span>}
                    </div>
                    <Link href={`/jobs/${job.id}`} className="text-white font-semibold hover:text-blue-400 transition block truncate">
                      {job.title}
                    </Link>
                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-500 flex-wrap">
                      <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5"/> {job.workersCompleted}/{job.workersRequired} workers</span>
                      <span>${Number(job.budgetPerWorker).toFixed(2)}/worker</span>
                      <span>📋 {job._count?.submissions || 0} submissions</span>
                      <span>Deadline: {new Date(job.deadline).toLocaleDateString()}</span>
                    </div>

                    {/* Progress bar */}
                    <div className="mt-3 bg-gray-800 rounded-full h-1.5 w-full max-w-xs">
                      <div className="bg-blue-500 h-1.5 rounded-full transition-all" style={{ width: `${completion}%` }}/>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{completion}% complete</p>
                  </div>

                  <div className="flex items-center gap-2">
                    {job._count?.submissions > 0 && (
                      <Link href={`/jobs/${job.id}`}>
                        <Button variant="secondary" size="sm"><Eye className="w-3.5 h-3.5"/> Review</Button>
                      </Link>
                    )}
                    {['ACTIVE', 'PAUSED'].includes(job.status) && (
                      <Button variant="ghost" size="sm" onClick={() => toggleStatus(job.id, job.status)}>
                        {job.status === 'ACTIVE' ? <Pause className="w-3.5 h-3.5"/> : <Play className="w-3.5 h-3.5"/>}
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
