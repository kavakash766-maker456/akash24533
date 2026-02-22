'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Clock, Users, DollarSign, Tag, Globe, FileText, Image, Link2, CheckCircle } from 'lucide-react';
import api from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/Card';
import { Modal } from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toast';

export default function JobDetailPage() {
  const { id }   = useParams();
  const router   = useRouter();
  const { toast } = useToast();

  const [job, setJob]         = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  // Submission form state
  const [proofText, setProofText]   = useState('');
  const [proofLink, setProofLink]   = useState('');
  const [proofImage, setProofImage] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api.get(`/jobs/${id}`).then(r => setJob(r.data)).finally(() => setLoading(false));
  }, [id]);

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const formData: any = { jobId: id };
      if (proofText)  formData.proofText = proofText;
      if (proofLink)  formData.proofLink = proofLink;

      if (proofImage) {
        // Upload image first
        const fd = new FormData();
        fd.append('file', proofImage);
        fd.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_PRESET || 'taskearn');
        const res = await fetch(`https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD}/image/upload`, { method: 'POST', body: fd });
        const data = await res.json();
        formData.proofImageUrl = data.secure_url;
      }

      await api.post('/submissions', formData);
      toast('Submission sent successfully! ✅', 'success');
      setShowModal(false);
      setJob({ ...job, hasSubmitted: true });
    } catch (e: any) {
      toast(e.response?.data?.error || 'Submission failed', 'error');
    }
    setSubmitting(false);
  };

  const daysLeft = (d: string) => {
    const days = Math.ceil((new Date(d).getTime() - Date.now()) / 86400000);
    return days <= 0 ? 'Expired' : `${days} days left`;
  };

  if (loading) return (
    <div className="p-6 max-w-4xl">
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-gray-800 rounded w-2/3"/>
        <div className="h-4 bg-gray-800 rounded w-1/3"/>
        <div className="h-40 bg-gray-800 rounded mt-6"/>
      </div>
    </div>
  );

  if (!job) return <div className="p-6 text-gray-400">Job not found.</div>;

  const spotsLeft = job.workersRequired - job.workersCompleted;
  const proofType = job.proofType;

  return (
    <div className="p-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-6 flex-wrap">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="text-2xl">{job.category?.icon}</span>
            <span className="text-sm text-gray-400">{job.category?.name}</span>
            <StatusBadge status={job.status}/>
            {job.isFeatured && <span className="text-xs bg-yellow-900/30 text-yellow-400 border border-yellow-800/50 px-2 py-0.5 rounded-full">⭐ Featured</span>}
          </div>
          <h1 className="text-2xl font-bold text-white">{job.title}</h1>
          <p className="text-gray-400 text-sm mt-1">Posted by @{job.employer?.username}</p>
        </div>
        <div className="text-right">
          <p className="text-3xl font-bold text-green-400">${Number(job.budgetPerWorker).toFixed(2)}</p>
          <p className="text-gray-400 text-sm">per worker</p>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-4 mb-6">
        {[
          { icon: <Users className="w-4 h-4"/>,      label: 'Spots Left',  value: `${spotsLeft} / ${job.workersRequired}` },
          { icon: <Clock className="w-4 h-4"/>,      label: 'Deadline',    value: daysLeft(job.deadline) },
          { icon: <FileText className="w-4 h-4"/>,   label: 'Proof Type',  value: job.proofType },
        ].map(item => (
          <div key={item.label} className="bg-gray-900 border border-gray-800 rounded-xl p-4 flex items-center gap-3">
            <div className="text-blue-400">{item.icon}</div>
            <div>
              <p className="text-xs text-gray-500">{item.label}</p>
              <p className="text-white font-medium text-sm">{item.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Description */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-4">
        <h2 className="font-semibold text-white mb-3">Description</h2>
        <p className="text-gray-400 text-sm leading-relaxed whitespace-pre-wrap">{job.description}</p>
      </div>

      {/* Instructions */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-4">
        <h2 className="font-semibold text-white mb-3">📋 Instructions</h2>
        <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">{job.instructions}</p>
      </div>

      {/* Tags */}
      {job.tags?.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-6">
          {job.tags.map((t: string) => (
            <span key={t} className="flex items-center gap-1 bg-gray-800 text-gray-300 px-3 py-1 rounded-full text-xs">
              <Tag className="w-3 h-3"/> {t}
            </span>
          ))}
        </div>
      )}

      {/* Location restriction */}
      {job.locationRestriction && (
        <div className="flex items-center gap-2 text-sm text-yellow-400 bg-yellow-900/20 border border-yellow-800/30 rounded-lg p-3 mb-6">
          <Globe className="w-4 h-4 flex-shrink-0"/>
          <span>Only available in: {job.locationRestriction}</span>
        </div>
      )}

      {/* Submit Button */}
      <div className="sticky bottom-6">
        {job.hasSubmitted ? (
          <div className="flex items-center justify-center gap-2 bg-green-900/30 border border-green-800 text-green-400 px-6 py-4 rounded-xl">
            <CheckCircle className="w-5 h-5"/> You already submitted for this job
          </div>
        ) : job.status !== 'ACTIVE' ? (
          <div className="text-center text-gray-500 py-4">This job is no longer accepting submissions.</div>
        ) : spotsLeft <= 0 ? (
          <div className="text-center text-gray-500 py-4">All spots are filled.</div>
        ) : (
          <Button size="lg" className="w-full" onClick={() => setShowModal(true)}>
            Submit Proof & Earn ${Number(job.budgetPerWorker).toFixed(2)}
          </Button>
        )}
      </div>

      {/* Submission Modal */}
      <Modal open={showModal} onClose={() => setShowModal(false)} title="Submit Your Proof">
        <div className="space-y-4">
          <div className="bg-blue-900/20 border border-blue-800/30 rounded-lg p-3 text-sm text-blue-300">
            💡 Make sure your proof clearly shows you completed the task as instructed.
          </div>

          {(proofType === 'TEXT' || proofType === 'MIXED') && (
            <div>
              <label className="block text-sm text-gray-400 mb-2">Text Proof *</label>
              <textarea value={proofText} onChange={e => setProofText(e.target.value)}
                rows={4} placeholder="Describe what you did..."
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 resize-none"/>
            </div>
          )}

          {(proofType === 'LINK' || proofType === 'MIXED') && (
            <div>
              <label className="block text-sm text-gray-400 mb-2">
                <Link2 className="w-4 h-4 inline mr-1"/>Link Proof *
              </label>
              <input value={proofLink} onChange={e => setProofLink(e.target.value)}
                type="url" placeholder="https://..."
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"/>
            </div>
          )}

          {(proofType === 'IMAGE' || proofType === 'MIXED') && (
            <div>
              <label className="block text-sm text-gray-400 mb-2">
                <Image className="w-4 h-4 inline mr-1"/>Screenshot Proof *
              </label>
              <input type="file" accept="image/*" onChange={e => setProofImage(e.target.files?.[0] || null)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-gray-400 file:mr-4 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-xs file:bg-blue-600 file:text-white cursor-pointer"/>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <Button variant="secondary" className="flex-1" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button className="flex-1" loading={submitting} onClick={handleSubmit}>Submit Proof</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
