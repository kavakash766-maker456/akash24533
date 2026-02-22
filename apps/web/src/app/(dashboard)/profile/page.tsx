'use client';
import { useState } from 'react';
import { Camera, User, Globe, FileText } from 'lucide-react';
import api from '@/lib/api';
import { useAuthStore } from '@/stores/authStore';
import { Button } from '@/components/ui/Button';
import { Input, Textarea } from '@/components/ui/Input';
import { useToast } from '@/components/ui/Toast';

export default function ProfilePage() {
  const { user, updateUser } = useAuthStore();
  const { toast }            = useToast();

  const [form, setForm] = useState({
    firstName: user?.firstName || '',
    lastName:  user?.lastName  || '',
    bio:       '',
    country:   '',
  });
  const [saving, setSaving]     = useState(false);
  const [uploading, setUploading] = useState(false);

  const save = async () => {
    setSaving(true);
    try {
      const { data } = await api.put('/users/me', form);
      updateUser({ firstName: data.firstName, lastName: data.lastName });
      toast('Profile updated!', 'success');
    } catch { toast('Failed to update profile', 'error'); }
    setSaving(false);
  };

  const uploadAvatar = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('avatar', file);
      const { data } = await api.post('/users/me/avatar', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      updateUser({ avatarUrl: data.avatarUrl });
      toast('Avatar updated!', 'success');
    } catch { toast('Upload failed', 'error'); }
    setUploading(false);
  };

  return (
    <div className="p-6 max-w-2xl">
      <h1 className="text-2xl font-bold text-white mb-6">My Profile</h1>

      {/* Avatar */}
      <div className="flex items-center gap-5 mb-8 p-5 bg-gray-900 border border-gray-800 rounded-xl">
        <div className="relative">
          {user?.avatarUrl ? (
            <img src={user.avatarUrl} alt="Avatar" className="w-20 h-20 rounded-full object-cover border-2 border-gray-700"/>
          ) : (
            <div className="w-20 h-20 rounded-full bg-blue-600 flex items-center justify-center text-2xl font-bold text-white border-2 border-gray-700">
              {user?.firstName?.[0]}{user?.lastName?.[0]}
            </div>
          )}
          <label className="absolute -bottom-1 -right-1 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center cursor-pointer hover:bg-blue-700 transition">
            <Camera className="w-4 h-4 text-white"/>
            <input type="file" accept="image/*" onChange={uploadAvatar} className="hidden"/>
          </label>
        </div>
        <div>
          <p className="font-semibold text-white">{user?.firstName} {user?.lastName}</p>
          <p className="text-gray-400 text-sm">@{user?.username}</p>
          <p className="text-xs text-blue-400 mt-1">{uploading ? 'Uploading...' : 'Click camera to update photo'}</p>
        </div>
      </div>

      {/* Form */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <Input label="First Name" value={form.firstName} onChange={e => setForm({...form, firstName: e.target.value})}/>
          <Input label="Last Name"  value={form.lastName}  onChange={e => setForm({...form, lastName:  e.target.value})}/>
        </div>
        <Textarea label="Bio" value={form.bio} onChange={e => setForm({...form, bio: e.target.value})}
          placeholder="Tell others a bit about yourself..." rows={3}/>
        <Input label="Country" value={form.country} onChange={e => setForm({...form, country: e.target.value})} placeholder="e.g. United States"/>

        <Button onClick={save} loading={saving}>Save Changes</Button>
      </div>

      {/* Account Info */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mt-4">
        <h2 className="font-semibold text-white mb-4">Account Information</h2>
        <div className="space-y-3 text-sm">
          {[
            ['Email',      user?.email,          'text-gray-300'],
            ['Username',   `@${user?.username}`,  'text-gray-300'],
            ['Plan',       user?.membershipPlan,   'text-blue-400'],
            ['Role',       user?.role,             'text-purple-400'],
          ].map(([label, value, color]) => (
            <div key={label} className="flex justify-between py-2 border-b border-gray-800 last:border-0">
              <span className="text-gray-400">{label}</span>
              <span className={color}>{value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
