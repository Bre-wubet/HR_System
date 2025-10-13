import { endpoints } from '@/app/config/endpoints.js';
import { apiFetch, jsonFetch } from '@/libs/http/fetcher.js';

export const authApi = {
  register: (payload) => jsonFetch(endpoints.auth.register, { method: 'POST', body: JSON.stringify(payload) }),
  login: (payload) => jsonFetch(endpoints.auth.login, { method: 'POST', body: JSON.stringify(payload) }),
  refresh: () => jsonFetch(endpoints.auth.refresh, { method: 'POST' }),
  logout: () => apiFetch(endpoints.auth.logout, { method: 'POST' }),
  logoutAll: () => apiFetch(endpoints.auth.logoutAll, { method: 'POST' }),
  profile: () => apiFetch(endpoints.auth.profile),
  updateProfile: (payload) => apiFetch(endpoints.auth.updateProfile, { method: 'PUT', body: JSON.stringify(payload) }),
  rolesPermissions: () => apiFetch(endpoints.auth.rolesPermissions),
  changePassword: (payload) => apiFetch(endpoints.auth.changePassword, { method: 'POST', body: JSON.stringify(payload) }),
  verifyToken: (payload) => jsonFetch(endpoints.auth.verifyToken, { method: 'POST', body: JSON.stringify(payload) }),
  checkPermission: (payload) => jsonFetch(endpoints.auth.checkPermission, { method: 'POST', body: JSON.stringify(payload) }),
  assignRole: (payload) => apiFetch(endpoints.auth.assignRole, { method: 'POST', body: JSON.stringify(payload) }),
  removeRole: (payload) => apiFetch(endpoints.auth.removeRole, { method: 'POST', body: JSON.stringify(payload) }),
  createDefaultRoles: () => apiFetch(endpoints.auth.createDefaultRoles, { method: 'POST' }),
  cleanExpiredTokens: () => apiFetch(endpoints.auth.cleanExpiredTokens, { method: 'POST' }),
};


