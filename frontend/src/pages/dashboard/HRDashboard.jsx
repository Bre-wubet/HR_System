import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';

import useAuthStore from '../../stores/useAuthStore';
import { 
  DashboardHeader, 
  StatsGrid, 
  RecentActivity, 
  QuickActions,
  SystemStatus,
  useDashboardData 
} from './components';

/**
 * HRDashboard Component
 * Main dashboard page for HR management system
 * 
 * Features:
 * - Real-time statistics and KPIs
 * - Recent activity feed
 * - Quick action buttons
 * - Responsive design
 * - Data refresh capabilities
 */
const HRDashboard = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  
  // Custom hook for dashboard data
  const {
    stats,
    recentActivities,
    isLoading,
    hasError,
    refetchAll,
    isFetching
  } = useDashboardData();

  // Event handlers
  const handleExportReport = () => {
    toast.success('Exporting report...');
    // TODO: Implement export functionality
  };

  const handleGenerateReport = () => {
    toast.success('Generating report...');
    // TODO: Implement report generation
  };

  const handleRefresh = () => {
    refetchAll();
    toast.success('Data refreshed');
  };

  const handleStatClick = (stat) => {
    if (stat.href) {
      navigate(stat.href);
    }
  };

  const handleViewAllActivities = () => {
    navigate('/activities');
  };

  const handleViewAllActions = () => {
    navigate('/actions');
  };

  // Error state
  if (hasError) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Unable to load dashboard data
          </h2>
          <p className="text-gray-600 mb-4">
            There was an error loading your dashboard information.
          </p>
          <button
            onClick={handleRefresh}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <DashboardHeader
        user={user}
        onExportReport={handleExportReport}
        onGenerateReport={handleGenerateReport}
        onRefresh={handleRefresh}
        isLoading={isFetching}
      />

      {/* Stats Grid */}
      <StatsGrid
        stats={stats}
        loading={isLoading}
        onStatClick={handleStatClick}
        columns={{ default: 1, md: 2, lg: 3 }}
      />

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <div className="lg:col-span-2">
          <RecentActivity
            activities={recentActivities}
            loading={isLoading}
            onViewAll={handleViewAllActivities}
            maxItems={5}
          />
        </div>

        {/* Quick Actions */}
        <div>
          <QuickActions
            onViewAll={handleViewAllActions}
          />
        </div>
      </div>

      {/* System Status */}
      <SystemStatus />
    </div>
  );
};

export default HRDashboard;
