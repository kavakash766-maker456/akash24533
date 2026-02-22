'use client';
import { useState } from 'react';
import Link from 'next/link';
import api from '@/lib/api';

export default function ForgotPasswordPage() {
  const [email, setEmail]     = useState('');
  const [sent, setSent]       = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      await api.post('/auth/forgot-password', { email });
      setSent(true);
    } catch (err: any) { setError(err.response?.data?.error || 'Something went wrong'); }
    setLoading(false);
  };

  if (sent) return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="text-5xl mb-4">📧</div>
        <h2 className="text-2xl font-bold text-white mb-3">Check your email</h2>
        <p className="text-gray-400 mb-6">If <strong className="text-white">{email}</strong> is registered, we sent a reset link. Check your inbox and spam folder.</p>
        <Link href="/login" className="text-blue-400 hover:underline">Back to Login</Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="text-2xl font-bold text-blue-400">TaskEarn Pro</Link>
          <h1 className="text-2xl font-bold text-white mt-4">Forgot your password?</h1>
          <p className="text-gray-400 mt-1">Enter your email and we'll send a reset link.</p>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8">
          {error && <div className="bg-red-900/30 border border-red-800 text-red-300 px-4 py-3 rounded-lg mb-5 text-sm">{error}</div>}
          <form onSubmit={submit} className="space-y-5">
            <div>
              <label className="block text-sm text-gray-400 mb-2">Email address</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500"
                placeholder="you@example.com"/>
            </div>
            <button type="submit" disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white py-3 rounded-lg font-semibold transition">
              {loading ? 'Sending...' : 'Send Reset Link'}
            </button>
          </form>
          <div className="mt-5 text-center text-gray-400 text-sm">
            <Link href="/login" className="text-blue-400 hover:underline">Back to Login</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
