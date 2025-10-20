import React from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  Shield, 
  Settings, 
  Activity, 
  Database, 
  Server,
  TrendingUp,
  TrendingDown,
  CheckCircle,
  AlertTriangle,
  Clock
} from 'lucide-react';

/**
 * AdminOverview Component
 * Displays system overview and key metrics for administrators
 */
const AdminOverview = () => {
  const stats = [
    {
      title: 'Total Users',
      value: '1,234',
      change: '+12%',
      trend: 'up',
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      title: 'Active Sessions',
      value: '89',
      change: '+5%',
      trend: 'up',
      icon: Activity,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      title: 'System Health',
      value: '98.5%',
      change: '+0.2%',
      trend: 'up',
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      title: 'Storage Used',
      value: '2.4TB',
      change: '+8%',
      trend: 'up',
      icon: Database,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100'
    }
  ];

  const recentActivities = [
    {
      id: 1,
      action: 'User login',
      user: 'john.doe@company.com',
      time: '2 minutes ago',
      status: 'success'
    },
    {
      id: 2,
      action: 'Permission updated',
      user: 'admin@company.com',
      time: '5 minutes ago',
      status: 'info'
    },
    {
      id: 3,
      action: 'Failed login attempt',
      user: 'unknown@external.com',
      time: '8 minutes ago',
      status: 'warning'
    },
    {
      id: 4,
      action: 'System backup',
      user: 'system',
      time: '1 hour ago',
      status: 'success'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          const TrendIcon = stat.trend === 'up' ? TrendingUp : TrendingDown;
          
          return (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                  <div className="flex items-center mt-2">
                    <TrendIcon className={`h-4 w-4 ${stat.trend === 'up' ? 'text-green-500' : 'text-red-500'}`} />
                    <span className={`text-sm font-medium ml-1 ${stat.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                      {stat.change}
                    </span>
                  </div>
                </div>
                <div className={`p-3 rounded-full ${stat.bgColor}`}>
                  <Icon className={`h-6 w-6 ${stat.color}`} />
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Recent Activities */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Recent Activities</h3>
          <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
            View All
          </button>
        </div>
        
        <div className="space-y-4">
          {recentActivities.map((activity, index) => (
            <motion.div
              key={activity.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 + index * 0.1 }}
              className="flex items-center space-x-4 p-3 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className={`p-2 rounded-full ${
                activity.status === 'success' ? 'bg-green-100' :
                activity.status === 'warning' ? 'bg-yellow-100' :
                activity.status === 'error' ? 'bg-red-100' :
                'bg-blue-100'
              }`}>
                {activity.status === 'success' && <CheckCircle className="h-4 w-4 text-green-600" />}
                {activity.status === 'warning' && <AlertTriangle className="h-4 w-4 text-yellow-600" />}
                {activity.status === 'error' && <AlertTriangle className="h-4 w-4 text-red-600" />}
                {activity.status === 'info' && <Clock className="h-4 w-4 text-blue-600" />}
              </div>
              
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                <p className="text-sm text-gray-500 truncate">{activity.user}</p>
              </div>
              
              <div className="text-sm text-gray-500">
                {activity.time}
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* System Status */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-6">System Status</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-100 rounded-full">
              <Server className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">Web Server</p>
              <p className="text-sm text-green-600">Online</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-100 rounded-full">
              <Database className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">Database</p>
              <p className="text-sm text-green-600">Connected</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-100 rounded-full">
              <Shield className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">Security</p>
              <p className="text-sm text-green-600">Protected</p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default AdminOverview;