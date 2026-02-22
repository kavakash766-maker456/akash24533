'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ExternalLink, Clock, CheckCircle, XCircle } from 'lucide-react';
import api from '@/lib/api';
import { StatusBadge, EmptyState, Skeleton } from '@/components/ui/Card';

export default function SubmissionsPage() {
  const [subs, setSubs]   = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage]   = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    api.get(`/submissions/my?page=${page}&limit=15`)
      .then(r => { setSubs(r.data.data); setTotal(r.data.total); })
      .finally(() => setLoading(false));
  }, [page]);

  const statusIcon = (s: string) => {
    if (s === 'APPROVED') return <CheckCircle className="w-4 h-4 text-green-400"/>;
    if (s === 'REJECTED') return <XCircle className="w-4 h-4 text-red-400"/>;
    return <Clock className="w-4 h-4 text-yellow-400"/>;
  };

  return (
    <div className="p-6 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">My Submissions</h1>
        <p className="text-gray-400 mt-1">{total} submission{total !== 1 ? 's' : ''} total</p>
      </div>

      {loading ? (
        <div className="space-y-3">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-20 w-full"/>)}</div>
      ) : subs.length === 0 ? (
        <div className="bg-gray-900 border border-gray-800 rounded-xl">
          <EmptyState icon="📤" title="No submissions yet" description="Browse available jobs and start earning."
            action={<Link href="/jobs" className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition">Browse Jobs</Link>}/>
        </div>
      ) : (
        <>
          <div className="space-y-3">
            {subs.map(sub => (
              <div key={sub.id} className="bg-gray-900 border border-gray-800 rounded-xl p-5 hover:border-gray-700 transition">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      {statusIcon(sub.status)}
                      <StatusBadge status={sub.status}/>
                    </div>
                    <Link href={`/jobs/${sub.jobId}`} className="text-white font-medium hover:text-blue-400 transition flex items-center gap-1">
                      {sub.job?.title} <ExternalLink className="w-3 h-3"/>
                    </Link>
                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-500 flex-wrap">
                      <span>Submitted: {new Date(sub.submittedAt).toLocaleDateString()}</span>
                      {sub.reviewedAt && <span>Reviewed: {new Date(sub.reviewedAt).toLocaleDateString()}</span>}
                      <span>by @{sub.job?.employer?.username}</span>
                    </div>
                    {sub.feedback && (
                      <div className="mt-3 bg-gray-800 rounded-lg px-3 py-2 text-sm text-gray-300">
                        💬 <span className="text-gray-400">Feedback:</span> {sub.feedback}
                      </div>
                    )}
                  </div>
                  <div className="text-right flex-shrink-0">
                    {sub.status === 'APPROVED' && sub.earnings != null ? (
                      <div>
                        <p className="text-green-400 font-bold text-lg">+${Number(sub.earnings).toFixed(2)}</p>
                        <p className="text-xs text-gray-500">earned</p>
                      </div>
                    ) : sub.status === 'PENDING' ? (
                      <p className="text-yellow-400 text-sm">⏳ Awaiting review</p>
                    ) : null}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {total > 15 && (
            <div className="flex justify-center gap-2 mt-6">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                className="px-4 py-2 bg-gray-900 border border-gray-700 text-gray-300 rounded-lg disabled:opacity-40 hover:border-gray-500 transition text-sm">← Prev</button>
              <span className="px-4 py-2 text-gray-400 text-sm">Page {page}</span>
              <button onClick={() => setPage(p => p + 1)} disabled={page * 15 >= total}
                className="px-4 py-2 bg-gray-900 border border-gray-700 text-gray-300 rounded-lg disabled:opacity-40 hover:border-gray-500 transition text-sm">Next →</button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
