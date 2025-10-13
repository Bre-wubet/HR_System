import { useEffect } from 'react';
import AppRouter from '@/app/routes.jsx';
import { useAuthStore } from '@/features/auth/stores/auth.store.js';

export default function AppRoot() {
  const init = useAuthStore((s) => s.init);
  useEffect(() => {
    init?.();
  }, [init]);
  return <AppRouter />;
}


