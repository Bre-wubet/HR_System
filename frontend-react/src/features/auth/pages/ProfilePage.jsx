import { useEffect, useState } from 'react';
import { useAuthStore } from '@/features/auth/stores/auth.store.js';

export default function ProfilePage() {
  const user = useAuthStore((s) => s.user);
  const updateProfile = useAuthStore((s) => s.updateProfile);
  const fetchProfile = useAuthStore((s) => s.fetchProfile);
  const [form, setForm] = useState({ email: user?.email || '', name: user?.name || '' });

  useEffect(() => {
    if (!user) fetchProfile();
  }, [user, fetchProfile]);

  const onSubmit = async (e) => {
    e.preventDefault();
    const res = await updateProfile(form);
    if (!res?.success) alert(res?.error || 'Failed to update profile');
  };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Profile</h1>
      <form onSubmit={onSubmit} className="bg-white border rounded p-4 space-y-3 max-w-md">
        <label className="block text-sm">Email</label>
        <input className="w-full border rounded px-3 py-2" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        <label className="block text-sm">Name</label>
        <input className="w-full border rounded px-3 py-2" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <button className="bg-gray-900 text-white rounded px-4 py-2" type="submit">Save</button>
      </form>
    </div>
  );
}


