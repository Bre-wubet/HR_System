import React from 'react';
import { motion } from 'framer-motion';
import { Download, FileText, Calendar, RefreshCw } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { cn } from '../../../lib/utils';

/**
 * DashboardHeader Component
 * Header section with title, description, and action buttons
 */
const DashboardHeader = ({
  title = "HR Dashboard",
  subtitle = "Welcome back! Here's what's happening today.",
  user,
  showActions = true,
  customActions = null,
  onExportReport,
  onGenerateReport,
  onRefresh,
  isLoading = false,
  className = ''
}) => {
  const defaultActions = [
    {
      id: 'export',
      label: 'Export Report',
      icon: Download,
      variant: 'outline',
      size: 'sm',
      onClick: onExportReport,
    },
    {
      id: 'generate',
      label: 'Generate Report',
      icon: FileText,
      variant: 'default',
      size: 'sm',
      onClick: onGenerateReport,
    },
  ];

  const actions = customActions || defaultActions;

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn("flex items-center justify-between", className)}
    >
      <div className="flex-1">
        <div className="flex items-center space-x-3 mb-2">
          <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
          {onRefresh && (
            <button
              onClick={onRefresh}
              disabled={isLoading}
              className={cn(
                "p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors",
                isLoading && "animate-spin"
              )}
              title="Refresh data"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
          )}
        </div>
        <p className="text-gray-600">{subtitle}</p>
        {user && (
          <div className="flex items-center space-x-2 mt-2">
            <div className="h-2 w-2 bg-success-500 rounded-full"></div>
            <span className="text-sm text-gray-500">
              Last updated: {new Date().toLocaleTimeString()}
            </span>
          </div>
        )}
      </div>
      
      {showActions && (
        <div className="flex items-center space-x-3">
          {actions.map((action) => (
            <Button
              key={action.id}
              variant={action.variant}
              size={action.size}
              onClick={action.onClick}
              disabled={isLoading}
              className="flex items-center space-x-2"
            >
              <action.icon className="h-4 w-4" />
              <span>{action.label}</span>
            </Button>
          ))}
        </div>
      )}
    </motion.div>
  );
};

export default DashboardHeader;
