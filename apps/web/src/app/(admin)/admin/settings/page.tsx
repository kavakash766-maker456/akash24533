'use client';
import { useEffect, useState } from 'react';
import { Settings, Save } from 'lucide-react';
import api from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useToast } from '@/components/ui/Toast';

const SETTINGS_FIELDS = [
  { key: 'platform_commission_percent', label: 'Platform Commission (%)', type: 'number', hint: 'Percentage taken from each approved submission' },
  { key: 'withdrawal_fee_percent',      label: 'Withdrawal Fee (%)',      type: 'number', hint: 'Fee charged when workers withdraw earnings' },
  { key: 'min_withdrawal_amount',       label: 'Minimum Withdrawal ($)',  type: 'number', hint: 'Minimum amount a worker can withdraw' },
  { key: 'max_job_budget',              label: 'Max Job Budget ($)',       type: 'number', hint: 'Maximum total budget allowed per job' },
  { key: 'referral_bonus_percent',      label: 'Referral Bonus (%)',       type: 'number', hint: 'Commission earned from referring new users' },
  { key: 'allow_registrations',         label: 'Allow Registrations',     type: 'text',   hint: 'Set to "false" to close new signups' },
  { key: 'maintenance_mode',            label: 'Maintenance Mode',         type: 'text',   hint: 'Set to "true" to show maintenance page' },
];

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState(false);
  const { toast }               = useToast();

  useEffect(() => {
    api.get('/admin/settings').then(r => setSettings(r.data)).finally(() => setLoading(false));
  }, []);

  const save = async () => {
    setSaving(true);
    try {
      await api.put('/admin/settings', settings);
      toast('Settings saved!', 'success');
    } catch { toast('Failed to save', 'error'); }
    setSaving(false);
  };

  return (
    <div className="p-6 max-w-2xl">
      <div className="flex items-center gap-3 mb-8">
        <Settings className="w-6 h-6 text-blue-400"/>
        <div>
          <h1 className="text-2xl font-bold text-white">Platform Settings</h1>
          <p className="text-gray-400 text-sm mt-1">Configure global platform parameters</p>
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">{[...Array(6)].map((_, i) => <div key={i} className="h-16 bg-gray-800 rounded-xl animate-pulse"/>)}</div>
      ) : (
        <div className="bg-gray-900 border border-gray-800 rounded-xl divide-y divide-gray-800">
          {SETTINGS_FIELDS.map(f => (
            <div key={f.key} className="p-5 flex items-center gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-white mb-0.5">{f.label}</label>
                <p className="text-xs text-gray-500">{f.hint}</p>
              </div>
              <input
                type={f.type} value={settings[f.key] || ''} step="0.1"
                onChange={e => setSettings({ ...settings, [f.key]: e.target.value })}
                className="w-32 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500 text-right"
              />
            </div>
          ))}
        </div>
      )}

      <div className="mt-6">
        <Button onClick={save} loading={saving} size="lg">
          <Save className="w-4 h-4"/> Save All Settings
        </Button>
        <p className="text-xs text-gray-500 mt-2">Changes take effect immediately across the platform.</p>
      </div>
    </div>
  );
}
