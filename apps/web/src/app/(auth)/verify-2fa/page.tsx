'use client';
import { useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/stores/authStore';
import api from '@/lib/api';

export default function Verify2FAPage() {
  const params    = useSearchParams();
  const router    = useRouter();
  const tempToken = params.get('tempToken') || '';
  const { setTokens } = useAuthStore();
  const [otp,     setOtp]     = useState('');
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const { data } = await api.post('/auth/2fa/verify', { tempToken, otp });
      localStorage.setItem('accessToken',  data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);
      setTokens(data.accessToken, data.refreshToken);
      useAuthStore.setState({ user: data.user });
      router.push('/dashboard');
    } catch (e: any) { setError(e.response?.data?.error || 'Invalid code'); }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Link href="/" className="text-2xl font-bold text-blue-400">TaskEarn Pro</Link>
          <div className="text-4xl mt-6 mb-3">📱</div>
          <h1 className="text-xl font-bold text-white">Two-Factor Authentication</h1>
          <p className="text-gray-400 text-sm mt-2">Enter the 6-digit code from your authenticator app</p>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8">
          {error && <div className="bg-red-900/30 border border-red-800 text-red-300 px-4 py-3 rounded-lg mb-5 text-sm">{error}</div>}
          <form onSubmit={submit} className="space-y-5">
            <input value={otp} onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0,6))}
              type="text" inputMode="numeric" maxLength={6} placeholder="000 000" required
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-4 text-white text-center text-2xl tracking-[0.5em] font-mono focus:outline-none focus:border-blue-500"/>
            <button type="submit" disabled={loading || otp.length !== 6}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white py-3 rounded-lg font-semibold transition">
              {loading ? 'Verifying...' : 'Verify'}
            </button>
          </form>
          <p className="text-center text-gray-500 text-xs mt-4">
            Lost access?{' '}
            <Link href="/support" className="text-blue-400 hover:underline">Contact support</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
