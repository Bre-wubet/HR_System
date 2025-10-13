export const endpoints = {
  auth: {
    base: '/api/auth',
    login: '/api/auth/login',
    register: '/api/auth/register',
    refresh: '/api/auth/refresh-token',
    profile: '/api/auth/profile',
    rolesPermissions: '/api/auth/roles-permissions',
    updateProfile: '/api/auth/profile',
    changePassword: '/api/auth/change-password',
    logout: '/api/auth/logout',
    logoutAll: '/api/auth/logout-all',
    verifyToken: '/api/auth/verify-token',
    checkPermission: '/api/auth/check-permission',
    assignRole: '/api/auth/assign-role',
    removeRole: '/api/auth/remove-role',
    createDefaultRoles: '/api/auth/create-default-roles',
    cleanExpiredTokens: '/api/auth/clean-expired-tokens',
  },
  hr: {
    base: '/api/hr',
    employees: '/api/hr/employees',
    attendance: '/api/hr/attendance',
    recruitment: '/api/hr/recruitment',
  },
};


