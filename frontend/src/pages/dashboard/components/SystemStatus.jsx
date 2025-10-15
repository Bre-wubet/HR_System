import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, AlertCircle, Clock, Database, Server, Users } from 'lucide-react';
import { cn } from '../../../lib/utils';

/**
 * SystemStatus Component
 * Displays real-time system status and health metrics
 */
const SystemStatus = ({ 
  title = "System Status",
  showDetails = true,
  className = ''
}) => {
  // Mock system status - in a real app, this would come from an API
  const systemMetrics = [
    {
      id: 'api-status',
      label: 'API Services',
      status: 'operational',
      icon: Server,
      color: 'success',
      lastChecked: new Date().toISOString(),
    },
    {
      id: 'database-status',
      label: 'Database',
      status: 'operational',
      icon: Database,
      color: 'success',
      lastChecked: new Date().toISOString(),
    },
    {
      id: 'auth-status',
      label: 'Authentication',
      status: 'operational',
      icon: Users,
      color: 'success',
      lastChecked: new Date().toISOString(),
    },
    {
      id: 'sync-status',
      label: 'Data Sync',
      status: 'operational',
      icon: Clock,
      color: 'success',
      lastChecked: new Date().toISOString(),
    },
  ];

  const getStatusIcon = (status) => {
    return status === 'operational' ? CheckCircle : AlertCircle;
  };

  const getStatusColor = (status) => {
    return status === 'operational' ? 'text-success-600' : 'text-error-600';
  };

  const getStatusBgColor = (status) => {
    return status === 'operational' ? 'bg-success-100' : 'bg-error-100';
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.5 }}
      className={cn("bg-white rounded-xl shadow-soft p-6", className)}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        <div className="flex items-center space-x-2">
          <div className="h-2 w-2 bg-success-500 rounded-full animate-pulse"></div>
          <span className="text-sm text-gray-500">All systems operational</span>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {systemMetrics.map((metric) => {
          const StatusIcon = getStatusIcon(metric.status);
          return (
            <div
              key={metric.id}
              className="flex items-center space-x-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
            >
              <div className={cn(
                'p-2 rounded-lg',
                getStatusBgColor(metric.status)
              )}>
                <metric.icon className={cn(
                  'h-4 w-4',
                  getStatusColor(metric.status)
                )} />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">{metric.label}</p>
                <p className="text-xs text-gray-500 capitalize">{metric.status}</p>
              </div>
              <StatusIcon className={cn(
                'h-4 w-4',
                getStatusColor(metric.status)
              )} />
            </div>
          );
        })}
      </div>

      {showDetails && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex items-center justify-between text-sm text-gray-500">
            <span>Last updated: {new Date().toLocaleTimeString()}</span>
            <span>Uptime: 99.9%</span>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default SystemStatus;
