import React from 'react';
import { motion } from 'framer-motion';
import { Settings, Database, Server, Shield, Bell, Globe } from 'lucide-react';
import { Button } from '../../components/ui/Button';

/**
 * SystemSettings Component
 * System settings and configuration dashboard
 */
const SystemSettings = () => {
  const settingsCategories = [
    {
      id: 1,
      name: 'General Settings',
      description: 'Basic system configuration',
      icon: Settings,
      settings: [
        { name: 'Company Name', value: 'HR Management System', editable: true },
        { name: 'Timezone', value: 'UTC+0', editable: true },
        { name: 'Date Format', value: 'YYYY-MM-DD', editable: true },
      ],
    },
    {
      id: 2,
      name: 'Database Settings',
      description: 'Database connection and configuration',
      icon: Database,
      settings: [
        { name: 'Database Type', value: 'PostgreSQL', editable: false },
        { name: 'Connection Pool', value: '10', editable: true },
        { name: 'Backup Frequency', value: 'Daily', editable: true },
      ],
    },
    {
      id: 3,
      name: 'Security Settings',
      description: 'Security and authentication configuration',
      icon: Shield,
      settings: [
        { name: 'Password Policy', value: 'Strong', editable: true },
        { name: 'Session Timeout', value: '8 hours', editable: true },
        { name: 'Two-Factor Auth', value: 'Enabled', editable: true },
      ],
    },
    {
      id: 4,
      name: 'Notification Settings',
      description: 'Email and notification preferences',
      icon: Bell,
      settings: [
        { name: 'Email Notifications', value: 'Enabled', editable: true },
        { name: 'SMTP Server', value: 'smtp.company.com', editable: true },
        { name: 'Notification Frequency', value: 'Real-time', editable: true },
      ],
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
          <h1 className="text-2xl font-bold text-gray-900">System Settings</h1>
          <p className="text-gray-600">Configure system-wide settings and preferences</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button>
            Save Changes
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {settingsCategories.map((category) => (
          <motion.div
            key={category.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-soft p-6"
          >
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-2 bg-gray-50 rounded-lg">
                <category.icon className="h-6 w-6 text-gray-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{category.name}</h3>
                <p className="text-sm text-gray-500">{category.description}</p>
              </div>
            </div>

            <div className="space-y-4">
              {category.settings.map((setting, index) => (
                <div key={index} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                  <div>
                    <span className="text-sm font-medium text-gray-900">{setting.name}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600">{setting.value}</span>
                    {setting.editable && (
                      <Button size="sm" variant="outline">
                        Edit
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default SystemSettings;
