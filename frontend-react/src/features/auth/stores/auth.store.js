import { create } from 'zustand';

export const useAuthStore = create((set) => ({
  user: null,
  accessToken: null,
  isAuthenticated: false,
  setSession: ({ user, accessToken }) => set({ user, accessToken, isAuthenticated: !!accessToken }),
  clearSession: () => set({ user: null, accessToken: null, isAuthenticated: false }),
}));


