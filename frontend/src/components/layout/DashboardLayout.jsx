import React, { useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';

import useAuthStore from '../../stores/useAuthStore';
import { useLayout } from './LayoutContext';
import { filterNavigationByPermissions } from './navigation/navigationConfig';

// Import modular components
import Sidebar from './sidebar/Sidebar';
import Header from './navbar/Header';
import MainContent from './MainContent';

/**
 * DashboardLayout Component
 * Main layout component for authenticated pages
 * 
 * Features:
 * - Responsive sidebar with smooth animations
 * - Modern navbar with search and notifications
 * - Permission-based navigation filtering
 * - Mobile-first responsive design
 * - Accessibility features
 */
const DashboardLayout = ({ children, showBreadcrumb = true }) => {
  const { user, logout, permissions = [] } = useAuthStore();
  const { sidebarOpen, setSidebarOpen } = useLayout();
  const location = useLocation();

  // Memoize filtered navigation to prevent unnecessary re-renders
  const filteredNavigation = useMemo(() => {
    return filterNavigationByPermissions(permissions, user);
  }, [permissions, user]);

  // Handle logout
  const handleLogout = async () => {
    await logout();
  };

  // Handle sidebar toggle
  const handleToggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar
        user={user}
        navigationItems={filteredNavigation}
      />

      {/* Main content area */}
      <div className="lg:ml-64 flex flex-col min-h-screen">
        {/* Header */}
        <Header
          onToggleSidebar={handleToggleSidebar}
          user={user}
          onLogout={handleLogout}
        />

        {/* Main content */}
        <MainContent showBreadcrumb={showBreadcrumb}>
          {children}
        </MainContent>
      </div>
    </div>
  );
};

export default DashboardLayout;