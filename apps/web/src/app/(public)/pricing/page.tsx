'use client';
import Link from 'next/link';
import { Check } from 'lucide-react';

const plans = [
  {
    id: 'FREE', name: 'Free', price: '$0', period: 'forever', color: 'border-gray-700',
    badge: '', buttonClass: 'bg-gray-800 hover:bg-gray-700 text-white',
    features: ['3 active jobs', '50 workers per job', '72h review window', 'Basic support', '5% referral bonus'],
  },
  {
    id: 'PRO', name: 'Pro', price: '$9.99', period: '/month', color: 'border-blue-600',
    badge: 'Most Popular', buttonClass: 'bg-blue-600 hover:bg-blue-700 text-white',
    features: ['25 active jobs', '500 workers per job', '48h review window', '1 featured slot/month', 'Advanced analytics', 'Priority support', '7% referral bonus'],
  },
  {
    id: 'PREMIUM', name: 'Premium', price: '$24.99', period: '/month', color: 'border-purple-600',
    badge: 'Best Value', buttonClass: 'bg-purple-600 hover:bg-purple-700 text-white',
    features: ['Unlimited active jobs', 'Unlimited workers', '24h review window', '3 featured slots/month', 'Full analytics + export', '24/7 priority support', '10% referral bonus', 'API access'],
  },
];

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <nav className="border-b border-gray-800 px-6 py-4">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <Link href="/" className="text-xl font-bold text-blue-400">TaskEarn Pro</Link>
          <Link href="/login" className="text-gray-300 hover:text-white px-4 py-2">Login</Link>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-20">
        <div className="text-center mb-14">
          <h1 className="text-4xl font-bold mb-4">Simple, transparent pricing</h1>
          <p className="text-gray-400 text-lg">Start free. Upgrade as you grow. No hidden fees.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {plans.map(plan => (
            <div key={plan.id} className={`relative bg-gray-900 border-2 ${plan.color} rounded-2xl p-8 flex flex-col`}>
              {plan.badge && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-xs font-bold px-4 py-1 rounded-full">
                  {plan.badge}
                </span>
              )}
              <div className="mb-6">
                <h2 className="text-xl font-bold text-white mb-1">{plan.name}</h2>
                <div className="flex items-end gap-1">
                  <span className="text-4xl font-bold text-white">{plan.price}</span>
                  <span className="text-gray-400 mb-1">{plan.period}</span>
                </div>
              </div>

              <ul className="space-y-3 mb-8 flex-1">
                {plan.features.map(f => (
                  <li key={f} className="flex items-start gap-2 text-sm">
                    <Check className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5"/>
                    <span className="text-gray-300">{f}</span>
                  </li>
                ))}
              </ul>

              <Link href="/register" className={`block text-center py-3 rounded-xl font-semibold transition ${plan.buttonClass}`}>
                {plan.id === 'FREE' ? 'Get Started Free' : `Get ${plan.name}`}
              </Link>
            </div>
          ))}
        </div>

        <p className="text-center text-gray-500 mt-10 text-sm">
          All plans include: Secure escrow, email notifications, fraud protection, and mobile-friendly access.
          <br/>Plans are paid from your wallet balance. No credit card required for Free plan.
        </p>
      </div>
    </div>
  );
}
