// src/app/(dashboard)/jobs/page.tsx
'use client';
import { useEffect, useState } from 'react';
import { Search, Filter, Clock, Users, DollarSign, Bookmark } from 'lucide-react';
import api from '@/lib/api';
import Link from 'next/link';

interface Job {
  id: string; title: string; description: string;
  budgetPerWorker: number; workersRequired: number; workersCompleted: number;
  deadline: string; proofType: string; isFeatured: boolean;
  category: { name: string; icon: string };
  employer:  { username: string };
  _count:    { submissions: number };
}

export default function BrowseJobsPage() {
  const [jobs, setJobs]       = useState<Job[]>([]);
  const [total, setTotal]     = useState(0);
  const [page, setPage]       = useState(1);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState('');
  const [category, setCategory] = useState('');
  const [categories, setCategories] = useState<any[]>([]);

  useEffect(() => {
    api.get('/categories').then(r => setCategories(r.data));
  }, []);

  useEffect(() => {
    loadJobs();
  }, [page, search, category]);

  const loadJobs = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/jobs', {
        params: { page, search: search || undefined, category: category || undefined, limit: 12 },
      });
      setJobs(data.data);
      setTotal(data.total);
    } catch {}
    setLoading(false);
  };

  const saveJob = async (jobId: string, e: React.MouseEvent) => {
    e.preventDefault();
    try { await api.post(`/jobs/${jobId}/save`); } catch {}
  };

  const daysLeft = (deadline: string) => {
    const d = Math.ceil((new Date(deadline).getTime() - Date.now()) / 86400000);
    return d <= 0 ? 'Expired' : `${d}d left`;
  };

  return (
    <div className="p-6 max-w-7xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Browse Jobs</h1>
        <p className="text-gray-400 mt-1">{total.toLocaleString()} jobs available</p>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-6 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500"/>
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search jobs..."
            className="w-full bg-gray-900 border border-gray-700 rounded-lg pl-10 pr-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"/>
        </div>
        <select value={category} onChange={e => { setCategory(e.target.value); setPage(1); }}
          className="bg-gray-900 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-blue-500">
          <option value="">All Categories</option>
          {categories.map(c => (
            <option key={c.id} value={c.slug}>{c.icon} {c.name}</option>
          ))}
        </select>
      </div>

      {/* Job Grid */}
      {loading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-gray-900 border border-gray-800 rounded-xl p-5 animate-pulse">
              <div className="w-20 h-3 bg-gray-800 rounded mb-3"/>
              <div className="w-full h-4 bg-gray-800 rounded mb-2"/>
              <div className="w-3/4 h-3 bg-gray-800 rounded mb-4"/>
              <div className="flex gap-2">
                <div className="w-16 h-5 bg-gray-800 rounded"/>
                <div className="w-16 h-5 bg-gray-800 rounded"/>
              </div>
            </div>
          ))}
        </div>
      ) : jobs.length === 0 ? (
        <div className="text-center py-20 text-gray-500">
          <p className="text-4xl mb-4">🔍</p>
          <p className="text-lg">No jobs found. Try adjusting filters.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {jobs.map(job => (
            <Link key={job.id} href={`/jobs/${job.id}`}
              className={`bg-gray-900 border rounded-xl p-5 hover:border-blue-700 transition group relative ${
                job.isFeatured ? 'border-yellow-600/50' : 'border-gray-800'
              }`}>
              {job.isFeatured && (
                <span className="absolute top-3 right-3 bg-yellow-600/20 text-yellow-400 text-xs px-2 py-0.5 rounded-full border border-yellow-600/30">
                  ⭐ Featured
                </span>
              )}

              <div className="flex items-center gap-2 mb-3">
                <span className="text-lg">{job.category.icon}</span>
                <span className="text-xs text-gray-500">{job.category.name}</span>
              </div>

              <h3 className="font-semibold text-white group-hover:text-blue-400 transition mb-2 line-clamp-2">
                {job.title}
              </h3>
              <p className="text-gray-400 text-sm mb-4 line-clamp-2">{job.description}</p>

              <div className="flex items-center justify-between text-sm mb-3">
                <span className="text-green-400 font-bold">${Number(job.budgetPerWorker).toFixed(2)}</span>
                <span className="text-gray-500">{daysLeft(job.deadline)}</span>
              </div>

              <div className="flex gap-3 text-xs text-gray-500">
                <span className="flex items-center gap-1">
                  <Users className="w-3 h-3"/>
                  {job.workersCompleted}/{job.workersRequired}
                </span>
                <span className="flex items-center gap-1">
                  <Filter className="w-3 h-3"/> {job.proofType}
                </span>
              </div>

              <button onClick={e => saveJob(job.id, e)}
                className="absolute bottom-5 right-5 text-gray-600 hover:text-blue-400 transition">
                <Bookmark className="w-4 h-4"/>
              </button>
            </Link>
          ))}
        </div>
      )}

      {/* Pagination */}
      {total > 12 && (
        <div className="flex justify-center gap-2 mt-8">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
            className="px-4 py-2 bg-gray-900 border border-gray-700 text-gray-300 rounded-lg disabled:opacity-40 hover:border-gray-500 transition text-sm">
            Previous
          </button>
          <span className="px-4 py-2 text-gray-400 text-sm">Page {page}</span>
          <button onClick={() => setPage(p => p + 1)} disabled={page * 12 >= total}
            className="px-4 py-2 bg-gray-900 border border-gray-700 text-gray-300 rounded-lg disabled:opacity-40 hover:border-gray-500 transition text-sm">
            Next
          </button>
        </div>
      )}
    </div>
  );
}
