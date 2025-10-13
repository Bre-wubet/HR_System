import { useState } from 'react';
import { useAuthStore } from '@/features/auth/stores/auth.store.js';
import { Navigate } from 'react-router-dom';

export default function LoginPage() {
  const setSession = useAuthStore((s) => s.setSession);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const login = useAuthStore((s) => s.login);

  const onSubmit = async (e) => {
    e.preventDefault();
    const res = await login({ email, password });
    if (!res?.success) {
      alert(res?.error || 'Login failed');
    }
  };

  if (isAuthenticated) return <Navigate to="/employees" replace />;

  return (
    <div className="w-full max-w-sm bg-white rounded shadow p-6">
      <h1 className="text-xl font-semibold mb-4">Login</h1>
      <form onSubmit={onSubmit} className="space-y-3">
        <input className="w-full border rounded px-3 py-2" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input className="w-full border rounded px-3 py-2" placeholder="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        <button className="w-full bg-gray-900 text-white rounded px-3 py-2" type="submit">Sign in</button>
      </form>
    </div>
  );
}


