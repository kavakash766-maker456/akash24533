'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronRight, ChevronLeft, CheckCircle } from 'lucide-react';
import api from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Input, Textarea, Select } from '@/components/ui/Input';
import { useToast } from '@/components/ui/Toast';

const STEPS = ['Basic Info', 'Budget & Workers', 'Proof & Rules', 'Review'];

const proofTypes = [
  { value: 'TEXT',  label: '📝 Text — written description' },
  { value: 'IMAGE', label: '📷 Screenshot — image upload' },
  { value: 'LINK',  label: '🔗 Link — URL to evidence' },
  { value: 'MIXED', label: '🔀 Mixed — any combination' },
];

export default function CreateJobPage() {
  const router    = useRouter();
  const { toast } = useToast();
  const [step, setStep]   = useState(0);
  const [cats, setCats]   = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    title: '', description: '', instructions: '', categoryId: '',
    budgetPerWorker: '', workersRequired: '', deadline: '',
    proofType: 'TEXT', locationRestriction: '', tags: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    api.get('/categories').then(r => setCats(r.data));
  }, []);

  const set = (field: string, value: string) => {
    setForm(f => ({ ...f, [field]: value }));
    setErrors(e => ({ ...e, [field]: '' }));
  };

  const validateStep = () => {
    const e: Record<string, string> = {};
    if (step === 0) {
      if (!form.title.trim() || form.title.length < 5)          e.title       = 'Title must be at least 5 characters';
      if (!form.description.trim() || form.description.length < 20) e.description = 'Description must be at least 20 characters';
      if (!form.instructions.trim() || form.instructions.length < 20) e.instructions = 'Instructions must be at least 20 characters';
      if (!form.categoryId) e.categoryId = 'Please select a category';
    }
    if (step === 1) {
      if (!form.budgetPerWorker || Number(form.budgetPerWorker) < 0.01) e.budgetPerWorker = 'Minimum budget is $0.01';
      if (!form.workersRequired || Number(form.workersRequired) < 1)    e.workersRequired = 'At least 1 worker required';
      if (!form.deadline) e.deadline = 'Please set a deadline';
      else if (new Date(form.deadline) <= new Date()) e.deadline = 'Deadline must be in the future';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const next = () => { if (validateStep()) setStep(s => s + 1); };
  const back = () => setStep(s => s - 1);

  const submit = async () => {
    setLoading(true);
    try {
      const total = Number(form.budgetPerWorker) * Number(form.workersRequired);
      await api.post('/jobs', {
        ...form,
        budgetPerWorker:  Number(form.budgetPerWorker),
        workersRequired:  Number(form.workersRequired),
        deadline:         new Date(form.deadline).toISOString(),
        tags:             form.tags.split(',').map(t => t.trim()).filter(Boolean),
      });
      toast(`Job posted! Total escrowed: $${total.toFixed(2)}`, 'success');
      router.push('/my-jobs');
    } catch (e: any) {
      toast(e.response?.data?.error || 'Failed to create job', 'error');
    }
    setLoading(false);
  };

  const total = Number(form.budgetPerWorker || 0) * Number(form.workersRequired || 0);

  return (
    <div className="p-6 max-w-2xl">
      <h1 className="text-2xl font-bold text-white mb-2">Post a New Job</h1>
      <p className="text-gray-400 mb-8">Fill in the details below to start hiring workers.</p>

      {/* Step Progress */}
      <div className="flex items-center gap-0 mb-10">
        {STEPS.map((label, i) => (
          <div key={label} className="flex items-center flex-1 last:flex-none">
            <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold transition ${
              i < step ? 'bg-green-500 text-white' : i === step ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-500'
            }`}>
              {i < step ? <CheckCircle className="w-4 h-4"/> : i + 1}
            </div>
            <span className={`ml-2 text-xs hidden sm:block ${i === step ? 'text-white' : 'text-gray-500'}`}>{label}</span>
            {i < STEPS.length - 1 && <div className={`flex-1 h-0.5 mx-3 ${i < step ? 'bg-green-500' : 'bg-gray-800'}`}/>}
          </div>
        ))}
      </div>

      {/* Step 0: Basic Info */}
      {step === 0 && (
        <div className="space-y-5">
          <Input label="Job Title *" value={form.title} onChange={e => set('title', e.target.value)}
            placeholder="e.g. Follow our Instagram account and like 3 posts" error={errors.title}/>
          <Textarea label="Description *" value={form.description} onChange={e => set('description', e.target.value)}
            placeholder="Explain what workers will do..." error={errors.description} rows={3}/>
          <Textarea label="Instructions *" value={form.instructions} onChange={e => set('instructions', e.target.value)}
            placeholder="Step-by-step instructions workers must follow..." error={errors.instructions} rows={4}/>
          <Select label="Category *" value={form.categoryId} onChange={e => set('categoryId', e.target.value)} error={errors.categoryId}
            options={[{ value: '', label: '— Select a category —' }, ...cats.map(c => ({ value: c.id, label: `${c.icon} ${c.name}` }))]}/>
        </div>
      )}

      {/* Step 1: Budget & Workers */}
      {step === 1 && (
        <div className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <Input label="Budget per Worker (USD) *" type="number" min="0.01" step="0.01"
              value={form.budgetPerWorker} onChange={e => set('budgetPerWorker', e.target.value)} error={errors.budgetPerWorker}
              placeholder="e.g. 0.50"/>
            <Input label="Number of Workers *" type="number" min="1" max="10000"
              value={form.workersRequired} onChange={e => set('workersRequired', e.target.value)} error={errors.workersRequired}
              placeholder="e.g. 100"/>
          </div>

          {total > 0 && (
            <div className="bg-blue-900/20 border border-blue-800/30 rounded-xl p-4">
              <p className="text-sm text-gray-400">Total budget (will be locked in escrow)</p>
              <p className="text-2xl font-bold text-blue-400">${total.toFixed(2)}</p>
              <p className="text-xs text-gray-500 mt-1">You earn back any unused slots when the job ends.</p>
            </div>
          )}

          <Input label="Deadline *" type="datetime-local" value={form.deadline} onChange={e => set('deadline', e.target.value)} error={errors.deadline}/>

          <Input label="Location Restriction (optional)" value={form.locationRestriction}
            onChange={e => set('locationRestriction', e.target.value)}
            placeholder="e.g. US, UK, CA — leave blank for all countries"/>
        </div>
      )}

      {/* Step 2: Proof & Tags */}
      {step === 2 && (
        <div className="space-y-5">
          <div>
            <label className="block text-sm text-gray-400 mb-3">Proof Type Required *</label>
            <div className="grid grid-cols-2 gap-3">
              {proofTypes.map(pt => (
                <button key={pt.value} type="button" onClick={() => set('proofType', pt.value)}
                  className={`p-4 rounded-xl border text-left text-sm transition ${form.proofType === pt.value
                    ? 'border-blue-500 bg-blue-900/20 text-white' : 'border-gray-700 bg-gray-900 text-gray-400 hover:border-gray-600'}`}>
                  {pt.label}
                </button>
              ))}
            </div>
          </div>
          <Input label="Tags (comma-separated, optional)" value={form.tags}
            onChange={e => set('tags', e.target.value)} placeholder="e.g. instagram, follow, social media"/>
        </div>
      )}

      {/* Step 3: Review */}
      {step === 3 && (
        <div className="space-y-4">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 space-y-3">
            {[
              ['Title',        form.title],
              ['Category',     cats.find(c => c.id === form.categoryId)?.name || '—'],
              ['Budget/Worker',`$${Number(form.budgetPerWorker).toFixed(2)}`],
              ['Workers',      form.workersRequired],
              ['Total Escrow', `$${total.toFixed(2)}`],
              ['Deadline',     new Date(form.deadline).toLocaleString()],
              ['Proof Type',   form.proofType],
            ].map(([label, value]) => (
              <div key={label} className="flex justify-between text-sm py-2 border-b border-gray-800 last:border-0">
                <span className="text-gray-400">{label}</span>
                <span className="text-white font-medium">{value}</span>
              </div>
            ))}
          </div>
          <div className="bg-yellow-900/20 border border-yellow-800/30 rounded-lg p-4 text-sm text-yellow-300">
            ⚠️ <strong>${total.toFixed(2)}</strong> will be deducted from your wallet and locked in escrow when you submit.
          </div>
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="flex gap-3 mt-8">
        {step > 0 && <Button variant="secondary" onClick={back} className="flex-1"><ChevronLeft className="w-4 h-4"/> Back</Button>}
        {step < STEPS.length - 1
          ? <Button onClick={next} className="flex-1">Next <ChevronRight className="w-4 h-4"/></Button>
          : <Button onClick={submit} loading={loading} className="flex-1">🚀 Post Job & Lock Escrow</Button>
        }
      </div>
    </div>
  );
}
