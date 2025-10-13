import { useAuthStore } from '@/features/auth/stores/auth.store.js';

export function withAuthHeaders(headers = {}) {
  const token = useAuthStore.getState().accessToken;
  return token ? { ...headers, Authorization: `Bearer ${token}` } : headers;
}


