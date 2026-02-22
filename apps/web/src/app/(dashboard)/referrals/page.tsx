'use client';
import { useEffect, useState } from 'react';
import { Copy, Check, Users, DollarSign, Gift } from 'lucide-react';
import api from '@/lib/api';
import { Button } from '@/components/ui/Button';

export default function ReferralsPage() {
  const [data, setData]     = useState<any>(null);
  const [refLink, setRefLink] = useState('');
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.get('/referrals/my'), api.get('/referrals/link')])
      .then(([r, l]) => { setData(r.data); setRefLink(l.data.link); })
      .finally(() => setLoading(false));
  }, []);

  const copy = () => {
    navigator.clipboard.writeText(refLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) return <div className="p-6 text-gray-400">Loading...</div>;

  return (
    <div className="p-6 max-w-2xl">
      <h1 className="text-2xl font-bold text-white mb-2">Referral Program</h1>
      <p className="text-gray-400 mb-8">Invite friends and earn a bonus from their activity.</p>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { icon: <Users className="w-5 h-5"/>,     label: 'Total Referrals', value: data?.referrals?.length || 0,  color: 'text-blue-400 bg-blue-400/10' },
          { icon: <DollarSign className="w-5 h-5"/>, label: 'Total Bonus',     value: `$${Number(data?.totalBonus || 0).toFixed(2)}`, color: 'text-green-400 bg-green-400/10' },
          { icon: <Gift className="w-5 h-5"/>,       label: 'Commission Rate', value: '5%',                           color: 'text-purple-400 bg-purple-400/10' },
        ].map(c => (
          <div key={c.label} className="bg-gray-900 border border-gray-800 rounded-xl p-4 text-center">
            <div className={`inline-flex p-2 rounded-lg ${c.color} mb-2`}>{c.icon}</div>
            <p className="text-xl font-bold text-white">{c.value}</p>
            <p className="text-gray-400 text-xs mt-0.5">{c.label}</p>
          </div>
        ))}
      </div>

      {/* Referral Link */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-6">
        <h2 className="font-semibold text-white mb-4">Your Referral Link</h2>
        <div className="flex gap-2">
          <input readOnly value={refLink}
            className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-sm text-gray-300 focus:outline-none"/>
          <Button onClick={copy} variant="secondary">
            {copied ? <><Check className="w-4 h-4"/> Copied!</> : <><Copy className="w-4 h-4"/> Copy</>}
          </Button>
        </div>
        <p className="text-xs text-gray-500 mt-3">
          Share this link. When someone registers using it, you earn 5% of their first job earnings.
        </p>
      </div>

      {/* Referred Users */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
        <h2 className="font-semibold text-white mb-4">People You Referred ({data?.referrals?.length || 0})</h2>
        {!data?.referrals?.length ? (
          <p className="text-gray-500 text-sm text-center py-6">No referrals yet. Share your link!</p>
        ) : (
          <div className="space-y-3">
            {data.referrals.map((u: any) => (
              <div key={u.id} className="flex items-center justify-between py-2 border-b border-gray-800 last:border-0">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-xs font-bold text-white">
                    {u.username[0].toUpperCase()}
                  </div>
                  <div>
                    <p className="text-white text-sm font-medium">@{u.username}</p>
                    <p className="text-gray-500 text-xs">Joined {new Date(u.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
                <span className="text-xs bg-gray-800 text-gray-400 px-2 py-1 rounded-full">{u.membershipPlan}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
