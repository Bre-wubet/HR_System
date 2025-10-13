import { useAuthStore } from '@/features/auth/stores/auth.store.js';

export default function RequirePermission({ perm, children }) {
  const user = useAuthStore((s) => s.user);
  const permissions = user?.permissions || [];
  if (!permissions.includes(perm)) return null;
  return children;
}


