import { create } from 'zustand';
import { endpoints } from '@/app/config/endpoints.js';
import { jsonFetch } from '@/libs/http/fetcher.js';
import { authApi } from '@/features/auth/api/auth.client.js';

const STORAGE_KEY = 'hr.auth.session';

function loadSession() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveSession(session) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  } catch {}
}

export const useAuthStore = create((set, get) => ({
  user: null,
  accessToken: null,
  isAuthenticated: false,
  initializing: true,
  async init() {
    const persisted = loadSession();
    if (persisted?.accessToken) {
      set({ accessToken: persisted.accessToken, isAuthenticated: true });
      const profile = await jsonFetch(endpoints.auth.profile, { headers: { Authorization: `Bearer ${persisted.accessToken}` } });
      if (profile.success) {
        set({ user: profile.data, initializing: false });
        return;
      }
    }
    set({ initializing: false });
  },
  setSession: ({ user, accessToken }) => {
    saveSession({ accessToken });
    set({ user, accessToken, isAuthenticated: !!accessToken });
  },
  clearSession: () => {
    saveSession({ accessToken: null });
    set({ user: null, accessToken: null, isAuthenticated: false });
  },
  async login(credentials) {
    const res = await authApi.login(credentials);
    if (!res.success) return res;
    // Extract token from common shapes: {accessToken}, {token}, {data: {accessToken|token}}
    const accessToken = (
      res.data?.accessToken ||
      res.data?.token ||
      res.data?.data?.accessToken ||
      res.data?.data?.token ||
      null
    );
    let profile;
    if (accessToken) {
      profile = await jsonFetch(endpoints.auth.profile, { headers: { Authorization: `Bearer ${accessToken}` } });
    } else {
      profile = await authApi.profile();
    }
    if (profile.success) {
      get().setSession({ user: profile.data, accessToken });
      return { success: true, data: profile.data };
    }
    return profile;
  },
  async refreshSession() {
    const res = await authApi.refresh();
    if (!res.success) {
      get().clearSession();
      return false;
    }
    const accessToken = res.data?.accessToken || res.data?.token;
    saveSession({ accessToken });
    set({ accessToken, isAuthenticated: !!accessToken });
    const profile = await jsonFetch(endpoints.auth.profile, { headers: { Authorization: `Bearer ${accessToken}` } });
    if (profile.success) {
      set({ user: profile.data });
    }
    return true;
  },
  async logout() {
    await authApi.logout();
    get().clearSession();
  },
  async fetchProfile() {
    const res = await authApi.profile();
    if (res.success) set({ user: res.data });
    return res;
  },
  async updateProfile(input) {
    const res = await authApi.updateProfile(input);
    if (res.success) set({ user: res.data });
    return res;
  },
  async fetchRolesPermissions() {
    return authApi.rolesPermissions();
  },
  async changePassword(input) {
    return authApi.changePassword(input);
  },
  async logoutAll() {
    const res = await authApi.logoutAll();
    get().clearSession();
    return res;
  },
}));


