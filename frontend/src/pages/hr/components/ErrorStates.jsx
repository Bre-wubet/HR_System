import React from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';
import { Button } from '../../../components/ui/Button';

/**
 * Error Boundary Component
 * Handles errors gracefully with retry functionality
 */
const ErrorBoundary = ({ 
  error, 
  onRetry, 
  onGoHome, 
  isLoading = false 
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center min-h-[400px] text-center"
    >
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 max-w-md">
        <AlertCircle className="h-16 w-16 mx-auto text-red-500 mb-4" />
        
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Something went wrong
        </h2>
        
        <p className="text-gray-600 mb-6">
          {error?.message || 'An unexpected error occurred. Please try again.'}
        </p>
        
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          {onRetry && (
            <Button
              onClick={onRetry}
              disabled={isLoading}
              className="flex items-center space-x-2"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Try Again</span>
            </Button>
          )}
          
          {onGoHome && (
            <Button
              variant="outline"
              onClick={onGoHome}
              className="flex items-center space-x-2"
            >
              <Home className="h-4 w-4" />
              <span>Go Home</span>
            </Button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

/**
 * Empty State Component
 * Displays when there's no data to show
 */
const EmptyState = ({ 
  icon: Icon, 
  title, 
  description, 
  action, 
  actionLabel = 'Get Started' 
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-12 text-center"
    >
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 max-w-md">
        {Icon && (
          <Icon className="h-16 w-16 mx-auto text-gray-400 mb-4" />
        )}
        
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          {title}
        </h3>
        
        <p className="text-gray-600 mb-6">
          {description}
        </p>
        
        {action && (
          <Button onClick={action}>
            {actionLabel}
          </Button>
        )}
      </div>
    </motion.div>
  );
};

/**
 * Not Found Component
 * Displays when employee is not found
 */
const EmployeeNotFound = ({ onBack }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center min-h-[400px] text-center"
    >
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 max-w-md">
        <AlertCircle className="h-16 w-16 mx-auto text-gray-400 mb-4" />
        
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Employee Not Found
        </h2>
        
        <p className="text-gray-600 mb-6">
          The employee you're looking for doesn't exist or has been removed.
        </p>
        
        <Button onClick={onBack}>
          Back to Employees
        </Button>
      </div>
    </motion.div>
  );
};

export { ErrorBoundary, EmptyState, EmployeeNotFound };
