'use client';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';

export default function VerifyEmailPage() {
  const params = useSearchParams();
  const token  = params.get('token');
  const [status, setStatus] = useState<'loading'|'success'|'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!token) { setStatus('error'); setMessage('No verification token provided.'); return; }
    api.post('/auth/verify-email', { token })
      .then(() => setStatus('success'))
      .catch(e => { setStatus('error'); setMessage(e.response?.data?.error || 'Verification failed.'); });
  }, [token]);

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        {status === 'loading' && (
          <>
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"/>
            <p className="text-gray-400">Verifying your email...</p>
          </>
        )}
        {status === 'success' && (
          <>
            <div className="text-5xl mb-4">✅</div>
            <h2 className="text-2xl font-bold text-white mb-3">Email Verified!</h2>
            <p className="text-gray-400 mb-6">Your account is now active. You can log in.</p>
            <Link href="/login" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-semibold transition inline-block">
              Go to Login
            </Link>
          </>
        )}
        {status === 'error' && (
          <>
            <div className="text-5xl mb-4">❌</div>
            <h2 className="text-2xl font-bold text-white mb-3">Verification Failed</h2>
            <p className="text-gray-400 mb-6">{message}</p>
            <Link href="/login" className="text-blue-400 hover:underline">Back to Login</Link>
          </>
        )}
      </div>
    </div>
  );
}
