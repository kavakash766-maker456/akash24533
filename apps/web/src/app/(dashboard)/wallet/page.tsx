// src/app/(dashboard)/wallet/page.tsx
'use client';
import { useEffect, useState } from 'react';
import { DollarSign, ArrowDown, ArrowUp, Clock } from 'lucide-react';
import api from '@/lib/api';

interface Transaction {
  id: string; type: string; amount: number; netAmount: number;
  status: string; description: string; createdAt: string;
}

interface Wallet {
  balance: number; totalEarned: number; escrowBalance: number;
}

const typeColor: Record<string, string> = {
  DEPOSIT:    'text-green-400',
  EARNING:    'text-green-400',
  WITHDRAWAL: 'text-red-400',
  JOB_PAYMENT:'text-orange-400',
  REFUND:     'text-blue-400',
};

export default function WalletPage() {
  const [wallet, setWallet]   = useState<Wallet | null>(null);
  const [txns, setTxns]       = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [depositAmt, setDepositAmt] = useState('');
  const [depositing, setDepositing] = useState(false);
  const [depositMsg, setDepositMsg] = useState('');

  useEffect(() => {
    loadWallet();
  }, []);

  const loadWallet = async () => {
    try {
      const [w, t] = await Promise.all([
        api.get('/wallet'),
        api.get('/wallet/transactions'),
      ]);
      setWallet(w.data);
      setTxns(t.data.data);
    } catch {}
    setLoading(false);
  };

  const handleDeposit = async () => {
    const amount = parseFloat(depositAmt);
    if (!amount || amount < 1) return;
    setDepositing(true);
    try {
      // In a real app, you'd use Stripe.js here.
      // This creates the payment intent and you'd show Stripe's card UI.
      const { data } = await api.post('/wallet/deposit', { amount });
      setDepositMsg(`Payment intent created. Client secret: ${data.clientSecret?.slice(0, 20)}... (integrate Stripe.js to complete payment)`);
    } catch (e: any) {
      setDepositMsg(e.response?.data?.error || 'Deposit failed');
    }
    setDepositing(false);
  };

  if (loading) return (
    <div className="p-6">
      <div className="animate-pulse space-y-4">
        <div className="w-48 h-6 bg-gray-800 rounded"/>
        <div className="grid sm:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => <div key={i} className="h-28 bg-gray-800 rounded-xl"/>)}
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-6 max-w-4xl">
      <h1 className="text-2xl font-bold text-white mb-6">My Wallet</h1>

      {/* Wallet Cards */}
      <div className="grid sm:grid-cols-3 gap-4 mb-8">
        {[
          { label: 'Available Balance', value: wallet?.balance, icon: <DollarSign className="w-5 h-5"/>, color: 'text-green-400 bg-green-400/10' },
          { label: 'Total Earned',      value: wallet?.totalEarned, icon: <ArrowDown className="w-5 h-5"/>, color: 'text-blue-400 bg-blue-400/10' },
          { label: 'In Escrow',         value: wallet?.escrowBalance, icon: <Clock className="w-5 h-5"/>, color: 'text-yellow-400 bg-yellow-400/10' },
        ].map(c => (
          <div key={c.label} className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <div className={`inline-flex p-2 rounded-lg ${c.color} mb-3`}>{c.icon}</div>
            <p className="text-gray-400 text-sm mb-1">{c.label}</p>
            <p className="text-2xl font-bold text-white">${Number(c.value || 0).toFixed(2)}</p>
          </div>
        ))}
      </div>

      {/* Deposit */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-6">
        <h2 className="text-lg font-semibold text-white mb-4">Deposit Funds</h2>
        <div className="flex gap-3">
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
            <input type="number" min="1" max="10000" value={depositAmt}
              onChange={e => setDepositAmt(e.target.value)} placeholder="0.00"
              className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-8 pr-4 py-3 text-white focus:outline-none focus:border-blue-500"/>
          </div>
          <button onClick={handleDeposit} disabled={depositing || !depositAmt}
            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-6 py-3 rounded-lg font-medium transition">
            {depositing ? 'Processing...' : 'Deposit'}
          </button>
        </div>
        {depositMsg && <p className="mt-3 text-sm text-yellow-400">{depositMsg}</p>}
        <p className="text-xs text-gray-500 mt-2">Powered by Stripe. Your card details are never stored on our servers.</p>
      </div>

      {/* Transactions */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Transaction History</h2>
        {txns.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No transactions yet</p>
        ) : (
          <div className="space-y-3">
            {txns.map(t => (
              <div key={t.id} className="flex items-center justify-between py-3 border-b border-gray-800 last:border-0">
                <div>
                  <p className="text-white text-sm font-medium">{t.description || t.type.replace('_', ' ')}</p>
                  <p className="text-gray-500 text-xs mt-0.5">
                    {new Date(t.createdAt).toLocaleDateString()} · {t.status}
                  </p>
                </div>
                <div className="text-right">
                  <p className={`font-bold ${typeColor[t.type] || 'text-white'}`}>
                    {['WITHDRAWAL','JOB_PAYMENT','PLATFORM_FEE'].includes(t.type) ? '-' : '+'}
                    ${Number(t.netAmount).toFixed(2)}
                  </p>
                  <p className="text-xs text-gray-500">{t.type.replace('_', ' ')}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
