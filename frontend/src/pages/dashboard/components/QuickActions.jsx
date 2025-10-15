import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  Calendar,
  Clock,
  Briefcase,
  FileText,
  BarChart3,
  Settings,
  Plus
} from 'lucide-react';
import { cn } from '../../../lib/utils';
import { Button } from '../../../components/ui/Button';

/**
 * Quick Action Item Component
 * Individual quick action button
 */
const QuickActionItem = ({ action, index, onActionClick }) => {
  const colorClasses = {
    primary: 'bg-primary-50 text-primary-600',
    success: 'bg-success-50 text-success-600',
    warning: 'bg-warning-50 text-warning-600',
    error: 'bg-error-50 text-error-600',
    info: 'bg-blue-50 text-blue-600',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <Button
        variant="outline"
        className="h-auto p-4 flex flex-col items-start text-left hover:bg-gray-50 w-full"
        onClick={() => onActionClick(action)}
      >
        <div className="flex items-center space-x-3 w-full">
          <div className={cn(
            'p-2 rounded-lg flex-shrink-0',
            colorClasses[action.color] || colorClasses.primary
          )}>
            <action.icon className="h-4 w-4" />
          </div>
          <div className="flex-1 text-left">
            <p className="font-medium text-gray-900">{action.title}</p>
            <p className="text-sm text-gray-500">{action.description}</p>
          </div>
          {action.badge && (
            <span className={cn(
              'text-xs px-2 py-1 rounded-full',
              action.badge.color === 'success' ? 'bg-success-100 text-success-600' :
              action.badge.color === 'warning' ? 'bg-warning-100 text-warning-600' :
              action.badge.color === 'error' ? 'bg-error-100 text-error-600' :
              'bg-gray-100 text-gray-600'
            )}>
              {action.badge.text}
            </span>
          )}
        </div>
      </Button>
    </motion.div>
  );
};

/**
 * QuickActions Component
 * Displays quick action buttons for common HR tasks
 */
const QuickActions = ({ 
  title = "Quick Actions",
  showViewAll = true,
  onViewAll,
  customActions = null
}) => {
  const navigate = useNavigate();

  const defaultActions = [
    {
      id: 'add-employee',
      title: 'Add Employee',
      description: 'Register a new employee',
      icon: Users,
      href: '/employees/new',
      color: 'primary',
      badge: null,
    },
    {
      id: 'schedule-interview',
      title: 'Schedule Interview',
      description: 'Set up candidate interviews',
      icon: Calendar,
      href: '/recruitment',
      color: 'success',
      badge: null,
    },
    {
      id: 'view-attendance',
      title: 'View Attendance',
      description: 'Check attendance records',
      icon: Clock,
      href: '/attendance',
      color: 'warning',
      badge: null,
    },
    {
      id: 'post-job',
      title: 'Post Job',
      description: 'Create new job posting',
      icon: Briefcase,
      href: '/recruitment',
      color: 'primary',
      badge: null,
    },
    {
      id: 'generate-report',
      title: 'Generate Report',
      description: 'Create HR analytics report',
      icon: BarChart3,
      href: '/reports',
      color: 'info',
      badge: null,
    },
    {
      id: 'manage-settings',
      title: 'HR Settings',
      description: 'Configure HR settings',
      icon: Settings,
      href: '/settings',
      color: 'warning',
      badge: null,
    },
  ];

  const actions = customActions || defaultActions;

  const handleActionClick = (action) => {
    if (action.href) {
      navigate(action.href);
    } else if (action.onClick) {
      action.onClick();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl shadow-soft p-6"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        {showViewAll && (
          <button
            onClick={onViewAll}
            className="text-sm text-primary-600 hover:text-primary-700 font-medium"
          >
            View All
          </button>
        )}
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {actions.map((action, index) => (
          <QuickActionItem
            key={action.id || index}
            action={action}
            index={index}
            onActionClick={handleActionClick}
          />
        ))}
      </div>
    </motion.div>
  );
};

export default QuickActions;
