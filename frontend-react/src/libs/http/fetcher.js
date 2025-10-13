import { useAuthStore } from '@/features/auth/stores/auth.store.js';
import { withAuthHeaders } from '@/libs/http/withAuth.js';

export async function jsonFetch(url, options = {}) {
  try {
    const res = await fetch(url, {
      credentials: 'include',
      headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
      ...options,
    });
    const isJson = res.headers.get('content-type')?.includes('application/json');
    const body = isJson ? await res.json().catch(() => null) : null;
    if (!res.ok) {
      return { success: false, error: body?.error || res.statusText, code: body?.code || res.status };
    }
    return { success: true, data: body };
  } catch (e) {
    return { success: false, error: e.message };
  }
}

export async function apiFetch(url, options = {}) {
  const withAuth = { ...options, headers: withAuthHeaders(options.headers) };
  const result = await jsonFetch(url, withAuth);
  if (result.success) return result;
  if (result.code === 401) {
    const refreshed = await useAuthStore.getState().refreshSession?.();
    if (refreshed) {
      const retry = await jsonFetch(url, { ...options, headers: withAuthHeaders(options.headers) });
      return retry;
    }
  }
  return result;
}


