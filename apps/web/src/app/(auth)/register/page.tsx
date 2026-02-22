// src/app/(auth)/register/page.tsx
'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';

export default function RegisterPage() {
  const params     = useSearchParams();
  const router     = useRouter();
  const { register } = useAuthStore();

  const [form, setForm]   = useState({
    firstName: '', lastName: '', username: '', email: '',
    password: '', referralCode: params.get('ref') || '',
  });
  const [error,   setError]   = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      await register(form);
      setSuccess(true);
    } catch (err: any) {
      const detail = err.response?.data?.details?.[0]?.message;
      setError(detail || err.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  if (success) return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="text-5xl mb-4">📧</div>
        <h2 className="text-2xl font-bold text-white mb-3">Check your email!</h2>
        <p className="text-gray-400 mb-6">
          We sent a verification link to <strong className="text-white">{form.email}</strong>.
          Click it to activate your account.
        </p>
        <Link href="/login" className="text-blue-400 hover:underline">Go to Login</Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="text-2xl font-bold text-blue-400">TaskEarn Pro</Link>
          <h1 className="text-2xl font-bold text-white mt-4">Create your account</h1>
          <p className="text-gray-400 mt-1">Free to join. Start earning today.</p>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8">
          {error && (
            <div className="bg-red-900/30 border border-red-800 text-red-300 px-4 py-3 rounded-lg mb-6 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {[
                { name: 'firstName', label: 'First Name', placeholder: 'John' },
                { name: 'lastName',  label: 'Last Name',  placeholder: 'Doe'  },
              ].map(f => (
                <div key={f.name}>
                  <label className="block text-sm text-gray-400 mb-2">{f.label}</label>
                  <input name={f.name} value={(form as any)[f.name]} onChange={handleChange} required
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                    placeholder={f.placeholder}/>
                </div>
              ))}
            </div>

            {[
              { name: 'username', label: 'Username',       type: 'text',     placeholder: 'johndoe123'     },
              { name: 'email',    label: 'Email address',  type: 'email',    placeholder: 'you@example.com' },
              { name: 'password', label: 'Password',       type: 'password', placeholder: 'Min. 8 characters' },
            ].map(f => (
              <div key={f.name}>
                <label className="block text-sm text-gray-400 mb-2">{f.label}</label>
                <input name={f.name} type={f.type} value={(form as any)[f.name]} onChange={handleChange} required
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                  placeholder={f.placeholder}/>
              </div>
            ))}

            {form.referralCode && (
              <div className="bg-green-900/20 border border-green-800 text-green-300 px-3 py-2 rounded-lg text-sm">
                🎁 Referral code applied: <strong>{form.referralCode}</strong>
              </div>
            )}

            <button type="submit" disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white py-3 rounded-lg font-semibold transition mt-2">
              {loading ? 'Creating account...' : 'Create Free Account'}
            </button>

            <p className="text-gray-500 text-xs text-center">
              By registering you agree to our{' '}
              <Link href="/terms" className="text-blue-400 hover:underline">Terms</Link> and{' '}
              <Link href="/privacy" className="text-blue-400 hover:underline">Privacy Policy</Link>.
            </p>
          </form>

          <div className="mt-6 text-center text-gray-400 text-sm">
            Already have an account?{' '}
            <Link href="/login" className="text-blue-400 hover:underline">Sign in</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
