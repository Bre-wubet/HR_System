export async function apiFetch(url, options = {}) {
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


