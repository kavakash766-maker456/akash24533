'use client';
import { useState } from 'react';
import { Check, Zap } from 'lucide-react';
import api from '@/lib/api';
import { useAuthStore } from '@/stores/authStore';
import { useToast } from '@/components/ui/Toast';

const plans = [
  {
    id: 'FREE', name: 'Free', price: 0, color: 'border-gray-700',
    features: ['3 active jobs', '50 workers/job', 'Basic support', '5% referral bonus'],
  },
  {
    id: 'PRO', name: 'Pro', price: 9.99, color: 'border-blue-600', highlight: true,
    features: ['25 active jobs', '500 workers/job', '1 featured slot/month', 'Priority support', '7% referral bonus', 'Advanced analytics'],
  },
  {
    id: 'PREMIUM', name: 'Premium', price: 24.99, color: 'border-purple-600',
    features: ['Unlimited jobs', 'Unlimited workers', '3 featured slots/month', '24/7 support', '10% referral bonus', 'Full analytics + export', 'API access'],
  },
];

export default function MembershipsPage() {
  const { user, updateUser } = useAuthStore();
  const { toast }            = useToast();
  const [loading, setLoading] = useState('');

  const subscribe = async (planId: string) => {
    if (planId === 'FREE') return;
    setLoading(planId);
    try {
      const { data } = await api.post('/memberships/subscribe', { plan: planId });
      updateUser({ membershipPlan: planId });
      toast(data.message, 'success');
    } catch (e: any) {
      toast(e.response?.data?.error || 'Subscription failed. Check your wallet balance.', 'error');
    }
    setLoading('');
  };

  return (
    <div className="p-6 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Membership Plans</h1>
        <p className="text-gray-400 mt-1">
          Current plan: <span className="text-blue-400 font-semibold">{user?.membershipPlan}</span>
          {' · '}Payment is deducted from your wallet balance.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {plans.map(plan => {
          const isCurrent = user?.membershipPlan === plan.id;
          return (
            <div key={plan.id} className={`relative bg-gray-900 border-2 ${plan.color} rounded-2xl p-6 flex flex-col ${plan.highlight ? 'shadow-lg shadow-blue-900/20' : ''}`}>
              {plan.highlight && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-xs font-bold px-4 py-1 rounded-full flex items-center gap-1">
                  <Zap className="w-3 h-3"/> Most Popular
                </div>
              )}

              <div className="mb-5">
                <h2 className="text-lg font-bold text-white">{plan.name}</h2>
                <div className="mt-1">
                  {plan.price === 0
                    ? <span className="text-3xl font-bold text-white">Free</span>
                    : <><span className="text-3xl font-bold text-white">${plan.price}</span><span className="text-gray-400 text-sm">/month</span></>
                  }
                </div>
              </div>

              <ul className="space-y-2.5 mb-6 flex-1">
                {plan.features.map(f => (
                  <li key={f} className="flex items-start gap-2 text-sm">
                    <Check className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5"/>
                    <span className="text-gray-300">{f}</span>
                  </li>
                ))}
              </ul>

              {isCurrent ? (
                <div className="text-center py-3 bg-green-900/20 border border-green-800/50 text-green-400 rounded-xl text-sm font-medium">
                  ✓ Current Plan
                </div>
              ) : (
                <button onClick={() => subscribe(plan.id)} disabled={!!loading || plan.id === 'FREE'}
                  className={`py-3 rounded-xl font-semibold transition text-sm disabled:opacity-50 ${
                    plan.id === 'FREE' ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                    : plan.highlight ? 'bg-blue-600 hover:bg-blue-700 text-white'
                    : 'bg-purple-600 hover:bg-purple-700 text-white'
                  }`}>
                  {loading === plan.id ? 'Processing...' : plan.id === 'FREE' ? 'Free Forever' : `Upgrade to ${plan.name}`}
                </button>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-8 bg-gray-900 border border-gray-800 rounded-xl p-5">
        <h3 className="font-semibold text-white mb-2">💡 How billing works</h3>
        <ul className="text-sm text-gray-400 space-y-1">
          <li>• Plans are paid monthly from your wallet balance</li>
          <li>• Make sure your wallet has enough funds before upgrading</li>
          <li>• Plans auto-expire after 1 month — you'll need to renew manually</li>
          <li>• No automatic charges — you stay in full control</li>
        </ul>
      </div>
    </div>
  );
}
