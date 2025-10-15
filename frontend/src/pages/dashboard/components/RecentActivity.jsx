import React from 'react';
import { motion } from 'framer-motion';
import { 
  UserCheck, 
  Clock, 
  Calendar, 
  TrendingUp,
  Users,
  Briefcase,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { formatDate, cn } from '../../../lib/utils';

/**
 * Activity Item Component
 * Individual activity item with icon and description
 */
const ActivityItem = ({ activity, index }) => {
  const getActivityIcon = (type) => {
    const iconMap = {
      hire: UserCheck,
      attendance: Clock,
      leave: Calendar,
      promotion: TrendingUp,
      recruitment: Users,
      job: Briefcase,
      alert: AlertCircle,
      completed: CheckCircle,
    };
    return iconMap[type] || AlertCircle;
  };

  const getActivityColor = (type) => {
    const colorMap = {
      hire: 'text-success-600',
      attendance: 'text-primary-600',
      leave: 'text-warning-600',
      promotion: 'text-purple-600',
      recruitment: 'text-blue-600',
      job: 'text-indigo-600',
      alert: 'text-error-600',
      completed: 'text-success-600',
    };
    return colorMap[type] || 'text-gray-600';
  };

  const Icon = getActivityIcon(activity.type);
  const iconColor = getActivityColor(activity.type);

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
    >
      <div className="flex-shrink-0">
        <div className="h-8 w-8 bg-primary-100 rounded-full flex items-center justify-center">
          <Icon className={cn("h-4 w-4", iconColor)} />
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-gray-900 font-medium">{activity.description}</p>
        <p className="text-xs text-gray-500 mt-1">{formatDate(activity.date)}</p>
        {activity.meta && (
          <div className="flex items-center space-x-2 mt-1">
            {activity.meta.department && (
              <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                {activity.meta.department}
              </span>
            )}
            {activity.meta.status && (
              <span className={cn(
                "text-xs px-2 py-1 rounded-full",
                activity.meta.status === 'completed' ? "bg-success-100 text-success-600" :
                activity.meta.status === 'pending' ? "bg-warning-100 text-warning-600" :
                "bg-gray-100 text-gray-600"
              )}>
                {activity.meta.status}
              </span>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
};

/**
 * RecentActivity Component
 * Displays recent HR activities with loading states
 */
const RecentActivity = ({ 
  activities = [], 
  loading = false, 
  title = "Recent Activity",
  showViewAll = true,
  onViewAll,
  maxItems = 5
}) => {
  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-soft p-6 animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-32 mb-4"></div>
        <div className="space-y-4">
          {[...Array(maxItems)].map((_, i) => (
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

  const displayActivities = activities.slice(0, maxItems);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl shadow-soft p-6"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        {showViewAll && activities.length > maxItems && (
          <button
            onClick={onViewAll}
            className="text-sm text-primary-600 hover:text-primary-700 font-medium"
          >
            View All
          </button>
        )}
      </div>
      
      {displayActivities.length === 0 ? (
        <div className="text-center py-8">
          <AlertCircle className="h-12 w-12 mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500">No recent activities</p>
        </div>
      ) : (
        <div className="space-y-1">
          {displayActivities.map((activity, index) => (
            <ActivityItem
              key={activity.id || index}
              activity={activity}
              index={index}
            />
          ))}
        </div>
      )}
    </motion.div>
  );
};

export default RecentActivity;
