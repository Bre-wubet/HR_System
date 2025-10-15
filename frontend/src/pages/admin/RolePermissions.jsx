import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Users, Settings, Plus, Edit, Trash2 } from 'lucide-react';
import { Button } from '../../components/ui/Button';

/**
 * RolePermissions Component
 * Role and permissions management dashboard
 */
const RolePermissions = () => {
  const roles = [
    {
      id: 1,
      name: 'HR Manager',
      description: 'Full access to HR functions',
      permissions: ['employee:read', 'employee:create', 'employee:update', 'attendance:read', 'recruitment:read'],
      userCount: 2,
    },
    {
      id: 2,
      name: 'HR Assistant',
      description: 'Limited HR access',
      permissions: ['employee:read', 'attendance:read'],
      userCount: 3,
    },
    {
      id: 3,
      name: 'Admin',
      description: 'System administration access',
      permissions: ['admin:manage_users', 'admin:manage_system'],
      userCount: 1,
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Role & Permissions</h1>
          <p className="text-gray-600">Manage user roles and their permissions</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Role
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {roles.map((role) => (
          <motion.div
            key={role.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-soft p-6 hover:shadow-medium transition-shadow"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-50 rounded-lg">
                  <Shield className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{role.name}</h3>
                  <p className="text-sm text-gray-500">{role.description}</p>
                </div>
              </div>
              <div className="flex items-center space-x-1">
                <Button size="sm" variant="outline">
                  <Edit className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Users with this role:</span>
                <span className="text-sm font-medium text-gray-900">{role.userCount}</span>
              </div>
              
              <div>
                <span className="text-sm text-gray-600 mb-2 block">Permissions:</span>
                <div className="flex flex-wrap gap-1">
                  {role.permissions.map((permission) => (
                    <span
                      key={permission}
                      className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-800"
                    >
                      {permission}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default RolePermissions;
