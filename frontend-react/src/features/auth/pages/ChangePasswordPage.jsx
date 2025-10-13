import { useState } from 'react';
import { useAuthStore } from '@/features/auth/stores/auth.store.js';

export default function ChangePasswordPage() {
  const changePassword = useAuthStore((s) => s.changePassword);
  const [form, setForm] = useState({ currentPassword: '', newPassword: '' });

  const onSubmit = async (e) => {
    e.preventDefault();
    const res = await changePassword(form);
    if (!res?.success) return alert(res?.error || 'Failed to change password');
    alert('Password changed');
    setForm({ currentPassword: '', newPassword: '' });
  };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Change Password</h1>
      <form onSubmit={onSubmit} className="bg-white border rounded p-4 space-y-3 max-w-md">
        <input className="w-full border rounded px-3 py-2" placeholder="Current Password" type="password" value={form.currentPassword} onChange={(e) => setForm({ ...form, currentPassword: e.target.value })} />
        <input className="w-full border rounded px-3 py-2" placeholder="New Password" type="password" value={form.newPassword} onChange={(e) => setForm({ ...form, newPassword: e.target.value })} />
        <button className="bg-gray-900 text-white rounded px-4 py-2" type="submit">Update Password</button>
      </form>
    </div>
  );
}


