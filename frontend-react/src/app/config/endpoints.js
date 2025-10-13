export const endpoints = {
  auth: {
    base: '/api/auth',
    login: '/api/auth/login',
    register: '/api/auth/register',
    refresh: '/api/auth/refresh-token',
    profile: '/api/auth/profile',
    rolesPermissions: '/api/auth/roles-permissions',
    assignRole: '/api/auth/assign-role',
    removeRole: '/api/auth/remove-role',
  },
  hr: {
    base: '/api/hr',
    employees: '/api/hr/employees',
    attendance: '/api/hr/attendance',
    recruitment: '/api/hr/recruitment',
  },
};


