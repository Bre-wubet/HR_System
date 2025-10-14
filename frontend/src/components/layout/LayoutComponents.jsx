import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';

// Page Header Component
export const PageHeader = ({ 
  title, 
  subtitle, 
  actions, 
  className = '' 
}) => (
  <div className={cn('flex items-center justify-between mb-6', className)}>
    <div>
      <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
      {subtitle && (
        <p className="text-gray-600 mt-1">{subtitle}</p>
      )}
    </div>
    {actions && (
      <div className="flex items-center space-x-3">
        {actions}
      </div>
    )}
  </div>
);

// Card Component
export const Card = ({ 
  children, 
  className = '', 
  padding = 'p-6',
  shadow = 'shadow-soft'
}) => (
  <div className={cn('bg-white rounded-xl', shadow, padding, className)}>
    {children}
  </div>
);

// Stats Card Component
export const StatsCard = ({ 
  title, 
  value, 
  change, 
  icon: Icon, 
  color = 'primary',
  loading = false,
  className = ''
}) => {
  const colorClasses = {
    primary: 'text-primary-600 bg-primary-100',
    success: 'text-success-600 bg-success-100',
    warning: 'text-warning-600 bg-warning-100',
    error: 'text-error-600 bg-error-100',
    secondary: 'text-secondary-600 bg-secondary-100',
  };

  return (
    <Card className={cn('hover:shadow-medium transition-shadow', className)}>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          {loading ? (
            <div className="h-8 w-20 bg-gray-200 rounded animate-pulse mt-2"></div>
          ) : (
            <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          )}
          {change && !loading && (
            <p className={cn(
              'text-sm mt-1',
              change.startsWith('+') ? 'text-success-600' : 'text-error-600'
            )}>
              {change}
            </p>
          )}
        </div>
        {Icon && (
          <div className={cn('p-3 rounded-lg', colorClasses[color])}>
            <Icon className="h-6 w-6" />
          </div>
        )}
      </div>
    </Card>
  );
};

// Loading Spinner Component
export const LoadingSpinner = ({ 
  size = 'md', 
  className = '' 
}) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
    xl: 'h-16 w-16',
  };

  return (
    <div className={cn('flex items-center justify-center', className)}>
      <div className={cn(
        'animate-spin rounded-full border-b-2 border-primary-600',
        sizeClasses[size]
      )}></div>
    </div>
  );
};

// Empty State Component
export const EmptyState = ({ 
  icon: Icon, 
  title, 
  description, 
  action,
  className = ''
}) => (
  <div className={cn('text-center py-12', className)}>
    {Icon && (
      <div className="mx-auto h-12 w-12 text-gray-400 mb-4">
        <Icon className="h-full w-full" />
      </div>
    )}
    <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
    {description && (
      <p className="text-gray-600 mb-6">{description}</p>
    )}
    {action && action}
  </div>
);

// Section Header Component
export const SectionHeader = ({ 
  title, 
  subtitle, 
  actions, 
  className = '' 
}) => (
  <div className={cn('flex items-center justify-between mb-4', className)}>
    <div>
      <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
      {subtitle && (
        <p className="text-sm text-gray-600 mt-1">{subtitle}</p>
      )}
    </div>
    {actions && (
      <div className="flex items-center space-x-2">
        {actions}
      </div>
    )}
  </div>
);

// Badge Component
export const Badge = ({ 
  children, 
  variant = 'default',
  size = 'md',
  className = ''
}) => {
  const variants = {
    default: 'bg-gray-100 text-gray-800',
    primary: 'bg-primary-100 text-primary-800',
    success: 'bg-success-100 text-success-800',
    warning: 'bg-warning-100 text-warning-800',
    error: 'bg-error-100 text-error-800',
    secondary: 'bg-secondary-100 text-secondary-800',
  };

  const sizes = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-2.5 py-0.5 text-sm',
    lg: 'px-3 py-1 text-sm',
  };

  return (
    <span className={cn(
      'inline-flex items-center rounded-full font-medium',
      variants[variant],
      sizes[size],
      className
    )}>
      {children}
    </span>
  );
};

// Divider Component
export const Divider = ({ 
  orientation = 'horizontal',
  className = ''
}) => {
  const orientations = {
    horizontal: 'w-full h-px',
    vertical: 'h-full w-px',
  };

  return (
    <div className={cn(
      'bg-gray-200',
      orientations[orientation],
      className
    )} />
  );
};

// Grid Component
export const Grid = ({ 
  children, 
  cols = 1,
  gap = 'gap-6',
  className = ''
}) => {
  const colClasses = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
    5: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5',
    6: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6',
  };

  return (
    <div className={cn('grid', colClasses[cols], gap, className)}>
      {children}
    </div>
  );
};

// Animated Container Component
export const AnimatedContainer = ({ 
  children, 
  delay = 0,
  className = ''
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    className={className}
  >
    {children}
  </motion.div>
);

// Responsive Container Component
export const ResponsiveContainer = ({ 
  children, 
  maxWidth = 'max-w-7xl',
  className = ''
}) => (
  <div className={cn('mx-auto px-4 sm:px-6 lg:px-8', maxWidth, className)}>
    {children}
  </div>
);

// Page Container Component
export const PageContainer = ({ 
  children, 
  className = '' 
}) => (
  <div className={cn('space-y-6', className)}>
    {children}
  </div>
);

// Content Section Component
export const ContentSection = ({ 
  children, 
  title,
  subtitle,
  actions,
  className = ''
}) => (
  <div className={cn('space-y-4', className)}>
    {(title || actions) && (
      <SectionHeader 
        title={title} 
        subtitle={subtitle} 
        actions={actions} 
      />
    )}
    {children}
  </div>
);

export default {
  PageHeader,
  Card,
  StatsCard,
  LoadingSpinner,
  EmptyState,
  SectionHeader,
  Badge,
  Divider,
  Grid,
  AnimatedContainer,
  ResponsiveContainer,
  PageContainer,
  ContentSection,
};
