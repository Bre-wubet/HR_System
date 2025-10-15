import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Users, UserCheck, UserX, Briefcase, Calendar } from 'lucide-react';
import { cn } from '../../../lib/utils';

/**
 * StatCard Component
 * Displays individual statistics with loading states and animations
 */
const StatCard = ({ 
  title, 
  value, 
  change, 
  icon, 
  color = 'primary', 
  loading = false,
  onClick,
  className = ''
}) => {
  const colorClasses = {
    primary: 'bg-primary-50 text-primary-600',
    success: 'bg-success-50 text-success-600',
    warning: 'bg-warning-50 text-warning-600',
    error: 'bg-error-50 text-error-600',
    info: 'bg-blue-50 text-blue-600',
  };

  // Map icon names to actual components
  const iconMap = {
    Users: Users,
    UserCheck: UserCheck,
    UserX: UserX,
    Briefcase: Briefcase,
    Calendar: Calendar,
    TrendingUp: TrendingUp,
  };

  const IconComponent = typeof icon === 'string' ? iconMap[icon] : icon;

  if (loading) {
    return (
      <div className={cn("bg-white rounded-xl shadow-soft p-6 animate-pulse", className)}>
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded w-20"></div>
            <div className="h-8 bg-gray-200 rounded w-16"></div>
            <div className="h-3 bg-gray-200 rounded w-24"></div>
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
      whileHover={{ y: -2 }}
      className={cn(
        "bg-white rounded-xl shadow-soft p-4 hover:shadow-medium transition-all duration-200 cursor-pointer",
        onClick && "hover:scale-105",
        className
      )}
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mb-2">{value}</p>
          {change !== undefined && change !== null && (
            <div className={cn(
              'flex items-center text-sm',
              change > 0 ? 'text-success-600' : change < 0 ? 'text-error-600' : 'text-gray-500'
            )}>
              <TrendingUp className={cn(
                "h-3 w-3 mr-1",
                change < 0 && "rotate-180"
              )} />
              <span>
                {change > 0 ? '+' : ''}{change}% from last period
              </span>
            </div>
          )}
        </div>
        <div className={cn('p-3 rounded-lg flex-shrink-0', colorClasses[color])}>
          <IconComponent className="h-6 w-6" />
        </div>
      </div>
    </motion.div>
  );
};

export default StatCard;
