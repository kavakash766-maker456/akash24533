'use client';
import { useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';

export default function ResetPasswordPage() {
  const params   = useSearchParams();
  const router   = useRouter();
  const token    = params.get('token') || '';
  const [password,  setPassword]  = useState('');
  const [confirm,   setConfirm]   = useState('');
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState('');
  const [done,      setDone]      = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) { setError('Passwords do not match'); return; }
    if (password.length < 8)  { setError('Password must be at least 8 characters'); return; }
    setLoading(true); setError('');
    try {
      await api.post('/auth/reset-password', { token, password });
      setDone(true);
      setTimeout(() => router.push('/login'), 2000);
    } catch (e: any) { setError(e.response?.data?.error || 'Reset failed'); }
    setLoading(false);
  };

  if (done) return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
      <div className="text-center">
        <div className="text-5xl mb-4">✅</div>
        <h2 className="text-2xl font-bold text-white mb-2">Password Reset!</h2>
        <p className="text-gray-400">Redirecting to login...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="text-2xl font-bold text-blue-400">TaskEarn Pro</Link>
          <h1 className="text-2xl font-bold text-white mt-4">Set New Password</h1>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8">
          {error && <div className="bg-red-900/30 border border-red-800 text-red-300 px-4 py-3 rounded-lg mb-5 text-sm">{error}</div>}
          <form onSubmit={submit} className="space-y-5">
            {[
              { label: 'New Password',     val: password, set: setPassword },
              { label: 'Confirm Password', val: confirm,  set: setConfirm  },
            ].map(f => (
              <div key={f.label}>
                <label className="block text-sm text-gray-400 mb-2">{f.label}</label>
                <input type="password" value={f.val} onChange={e => f.set(e.target.value)} required
                  minLength={8} placeholder="Min. 8 characters"
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500"/>
              </div>
            ))}
            <button type="submit" disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white py-3 rounded-lg font-semibold transition">
              {loading ? 'Resetting...' : 'Reset Password'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
