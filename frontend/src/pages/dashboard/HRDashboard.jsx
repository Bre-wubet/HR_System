import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  Users,
  Calendar,
  Briefcase,
  TrendingUp,
  Clock,
  UserCheck,
  AlertCircle,
  CheckCircle,
} from 'lucide-react';

import apiClient from '../../api/axiosClient';
import useAuthStore from '../../stores/useAuthStore';
import { formatDate, formatCurrency, cn } from '../../lib/utils';
import { Button } from '../../components/ui/Button';

const StatCard = ({ title, value, change, icon: Icon, color = 'primary', loading = false }) => {
  const colorClasses = {
    primary: 'bg-primary-50 text-primary-600',
    success: 'bg-success-50 text-success-600',
    warning: 'bg-warning-50 text-warning-600',
    error: 'bg-error-50 text-error-600',
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-soft p-6 animate-pulse">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded w-20"></div>
            <div className="h-8 bg-gray-200 rounded w-16"></div>
          </div>
          <div className="h-12 w-12 bg-gray-200 rounded-lg"></div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl shadow-soft p-6 hover:shadow-medium transition-shadow"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          {change && (
            <p className={cn(
              'text-sm mt-1 flex items-center',
              change > 0 ? 'text-success-600' : 'text-error-600'
            )}>
              <TrendingUp className="h-3 w-3 mr-1" />
              {change > 0 ? '+' : ''}{change}% from last month
            </p>
          )}
        </div>
        <div className={cn('p-3 rounded-lg', colorClasses[color])}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </motion.div>
  );
};

const RecentActivity = ({ activities, loading }) => {
  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-soft p-6 animate-pulse">
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center space-x-3">
              <div className="h-8 w-8 bg-gray-200 rounded-full"></div>
              <div className="flex-1 space-y-1">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl shadow-soft p-6"
    >
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
      <div className="space-y-4">
        {activities?.map((activity, index) => (
          <div key={index} className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <div className="h-8 w-8 bg-primary-100 rounded-full flex items-center justify-center">
                {activity.type === 'hire' && <UserCheck className="h-4 w-4 text-primary-600" />}
                {activity.type === 'attendance' && <Clock className="h-4 w-4 text-primary-600" />}
                {activity.type === 'leave' && <Calendar className="h-4 w-4 text-primary-600" />}
                {activity.type === 'promotion' && <TrendingUp className="h-4 w-4 text-primary-600" />}
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-gray-900">{activity.description}</p>
              <p className="text-xs text-gray-500">{formatDate(activity.date)}</p>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

const QuickActions = () => {
  const actions = [
    {
      title: 'Add Employee',
      description: 'Register a new employee',
      icon: Users,
      href: '/employees/new',
      color: 'primary',
    },
    {
      title: 'Schedule Interview',
      description: 'Set up candidate interviews',
      icon: Calendar,
      href: '/recruitment',
      color: 'success',
    },
    {
      title: 'View Attendance',
      description: 'Check attendance records',
      icon: Clock,
      href: '/attendance',
      color: 'warning',
    },
    {
      title: 'Post Job',
      description: 'Create new job posting',
      icon: Briefcase,
      href: '/recruitment',
      color: 'primary',
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl shadow-soft p-6"
    >
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {actions.map((action, index) => (
          <Button
            key={index}
            variant="outline"
            className="h-auto p-4 flex flex-col items-start text-left hover:bg-gray-50"
            onClick={() => window.location.href = action.href}
          >
            <div className="flex items-center space-x-3 w-full">
              <div className={cn(
                'p-2 rounded-lg',
                action.color === 'primary' && 'bg-primary-50 text-primary-600',
                action.color === 'success' && 'bg-success-50 text-success-600',
                action.color === 'warning' && 'bg-warning-50 text-warning-600',
              )}>
                <action.icon className="h-4 w-4" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-900">{action.title}</p>
                <p className="text-sm text-gray-500">{action.description}</p>
              </div>
            </div>
          </Button>
        ))}
      </div>
    </motion.div>
  );
};

const HRDashboard = () => {
  const { user, isAuthenticated } = useAuthStore();

  // Fetch dashboard data
  const { data: dashboardData, isLoading: isLoadingDashboard } = useQuery({
    queryKey: ['dashboard', 'overview'],
    enabled: isAuthenticated && !!user,
    queryFn: async () => {
      const [employeesRes, attendanceRes, recruitmentRes] = await Promise.all([
        apiClient.get('/hr/employees?limit=5'),
        apiClient.get('/hr/attendance/analytics/summary'),
        apiClient.get('/hr/recruitment/kpis'),
      ]);

      return {
        employees: employeesRes.data.data,
        attendance: attendanceRes.data.data,
        recruitment: recruitmentRes.data.data,
      };
    },
  });

  const { data: recentActivities, isLoading: isLoadingActivities } = useQuery({
    queryKey: ['dashboard', 'recent-activities'],
    enabled: isAuthenticated && !!user,
    queryFn: async () => {
      // This would be a dedicated endpoint for recent activities
      return [
        {
          type: 'hire',
          description: 'John Doe was hired as Software Engineer',
          date: new Date().toISOString(),
        },
        {
          type: 'attendance',
          description: 'Sarah Wilson checked in late',
          date: new Date(Date.now() - 3600000).toISOString(),
        },
        {
          type: 'leave',
          description: 'Mike Johnson requested vacation leave',
          date: new Date(Date.now() - 7200000).toISOString(),
        },
        {
          type: 'promotion',
          description: 'Lisa Chen was promoted to Senior Manager',
          date: new Date(Date.now() - 86400000).toISOString(),
        },
      ];
    },
  });

  const stats = [
    {
      title: 'Total Employees',
      value: dashboardData?.employees?.total || 0,
      change: 12,
      icon: Users,
      color: 'primary',
    },
    {
      title: 'Active Today',
      value: dashboardData?.attendance?.presentToday || 0,
      change: 5,
      icon: UserCheck,
      color: 'success',
    },
    {
      title: 'Pending Interviews',
      value: dashboardData?.recruitment?.pendingInterviews || 0,
      change: -8,
      icon: Calendar,
      color: 'warning',
    },
    {
      title: 'Open Positions',
      value: dashboardData?.recruitment?.openPositions || 0,
      change: 3,
      icon: Briefcase,
      color: 'primary',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">HR Dashboard</h1>
          <p className="text-gray-600">Welcome back! Here's what's happening today.</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline" size="sm">
            Export Report
          </Button>
          <Button size="sm">
            Generate Report
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <StatCard {...stat} loading={isLoadingDashboard} />
          </motion.div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <div className="lg:col-span-2">
          <RecentActivity 
            activities={recentActivities} 
            loading={isLoadingActivities} 
          />
        </div>

        {/* Quick Actions */}
        <div>
          <QuickActions />
        </div>
      </div>

      {/* Additional sections can be added here */}
    </div>
  );
};

export default HRDashboard;
