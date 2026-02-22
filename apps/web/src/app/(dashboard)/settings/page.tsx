'use client';
import { useState } from 'react';
import { Shield, Key, Smartphone, LogOut } from 'lucide-react';
import api from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useToast } from '@/components/ui/Toast';
import { Modal } from '@/components/ui/Modal';

export default function SettingsPage() {
  const { toast }          = useToast();
  const [pwForm, setPwForm] = useState({ current: '', newPass: '', confirm: '' });
  const [pwLoading, setPwLoading] = useState(false);
  const [show2FA, setShow2FA] = useState(false);
  const [qr, setQr]         = useState('');
  const [otp, setOtp]       = useState('');
  const [enabling, setEnabling] = useState(false);

  const changePassword = async () => {
    if (pwForm.newPass !== pwForm.confirm) return toast('Passwords do not match', 'error');
    if (pwForm.newPass.length < 8) return toast('Password must be at least 8 characters', 'error');
    setPwLoading(true);
    try {
      await api.post('/auth/change-password', { currentPassword: pwForm.current, newPassword: pwForm.newPass });
      toast('Password changed successfully!', 'success');
      setPwForm({ current: '', newPass: '', confirm: '' });
    } catch (e: any) { toast(e.response?.data?.error || 'Failed', 'error'); }
    setPwLoading(false);
  };

  const setup2FA = async () => {
    const { data } = await api.post('/auth/2fa/setup');
    setQr(data.qrCodeUrl);
    setShow2FA(true);
  };

  const enable2FA = async () => {
    setEnabling(true);
    try {
      await api.post('/auth/2fa/enable', { otp });
      toast('2FA enabled successfully! 🔐', 'success');
      setShow2FA(false);
    } catch (e: any) { toast(e.response?.data?.error || 'Invalid OTP', 'error'); }
    setEnabling(false);
  };

  return (
    <div className="p-6 max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold text-white">Settings & Security</h1>

      {/* Change Password */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
        <div className="flex items-center gap-2 mb-5">
          <Key className="w-5 h-5 text-blue-400"/>
          <h2 className="font-semibold text-white">Change Password</h2>
        </div>
        <div className="space-y-4">
          <Input type="password" label="Current Password" value={pwForm.current} onChange={e => setPwForm({...pwForm, current: e.target.value})} placeholder="••••••••"/>
          <Input type="password" label="New Password"     value={pwForm.newPass} onChange={e => setPwForm({...pwForm, newPass: e.target.value})} placeholder="Min. 8 characters"/>
          <Input type="password" label="Confirm Password" value={pwForm.confirm} onChange={e => setPwForm({...pwForm, confirm: e.target.value})} placeholder="Repeat new password"/>
          <Button onClick={changePassword} loading={pwLoading}>Update Password</Button>
        </div>
      </div>

      {/* 2FA */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
        <div className="flex items-center gap-2 mb-2">
          <Smartphone className="w-5 h-5 text-green-400"/>
          <h2 className="font-semibold text-white">Two-Factor Authentication</h2>
        </div>
        <p className="text-gray-400 text-sm mb-5">Add an extra layer of security using Google Authenticator or Authy.</p>
        <Button variant="secondary" onClick={setup2FA}><Shield className="w-4 h-4"/> Set Up 2FA</Button>
      </div>

      {/* Danger Zone */}
      <div className="bg-red-950/20 border border-red-900/50 rounded-xl p-6">
        <h2 className="font-semibold text-red-400 mb-2">Danger Zone</h2>
        <p className="text-gray-400 text-sm mb-4">Permanently delete your account and all data. This cannot be undone.</p>
        <Button variant="danger" onClick={() => toast('Please contact support to delete your account.', 'info')}>
          Delete Account
        </Button>
      </div>

      {/* 2FA Modal */}
      <Modal open={show2FA} onClose={() => setShow2FA(false)} title="Set Up Two-Factor Authentication">
        <div className="space-y-5">
          <div className="steps text-sm text-gray-400 space-y-2">
            <p>1. Download <strong className="text-white">Google Authenticator</strong> or <strong className="text-white">Authy</strong></p>
            <p>2. Scan the QR code below with the app</p>
            <p>3. Enter the 6-digit code to confirm</p>
          </div>
          {qr && (
            <div className="flex justify-center">
              <img src={qr} alt="QR Code" className="w-44 h-44 rounded-xl bg-white p-2"/>
            </div>
          )}
          <Input label="Enter 6-digit code" value={otp} onChange={e => setOtp(e.target.value)}
            placeholder="000000" maxLength={6} className="text-center text-2xl tracking-widest"/>
          <div className="flex gap-3">
            <Button variant="secondary" className="flex-1" onClick={() => setShow2FA(false)}>Cancel</Button>
            <Button className="flex-1" loading={enabling} onClick={enable2FA}>Enable 2FA</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
