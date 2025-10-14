import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { cn, getInitials } from '../../../lib/utils';
import { useLayout } from '../LayoutContext';
import { useSidebarResponsive } from '../hooks/useResponsive';
import SidebarLogo from './SidebarLogo';
import SidebarNavigation from './SidebarNavigation';
import SidebarUserProfile from './SidebarUserProfile';

/**
 * Main Sidebar Component
 * Provides navigation, branding, and user profile information
 */
const Sidebar = ({ user, navigationItems }) => {
  const { sidebarOpen, setSidebarOpen } = useLayout();
  const { shouldShowOverlay } = useSidebarResponsive();
  const location = useLocation();

  return (
    <>
      {/* Mobile Sidebar Overlay */}
      {shouldShowOverlay && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: sidebarOpen ? 1 : 0 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
          style={{ pointerEvents: sidebarOpen ? 'auto' : 'none' }}
        >
          <div className="absolute inset-0 bg-gray-900/50 backdrop-blur-sm" />
        </motion.div>
      )}

      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{ 
          x: sidebarOpen ? 0 : -256,
          width: 256
        }}
        transition={{ 
          type: 'spring', 
          stiffness: 300, 
          damping: 30 
        }}
        className={cn(
          'fixed lg:relative inset-y-0 left-0 z-50',
          'bg-white border-r border-gray-200',
          'shadow-lg lg:shadow-none',
          'flex flex-col h-full'
        )}
      >
        {/* Sidebar Content */}
        <div className="flex flex-col h-full">
          <SidebarLogo onClose={() => setSidebarOpen(false)} />
          
          <SidebarNavigation 
            navigationItems={navigationItems} 
            currentPath={location.pathname}
            onItemClick={() => shouldShowOverlay && setSidebarOpen(false)}
          />
          
          <div className="mt-auto">
            <SidebarUserProfile user={user} />
          </div>
        </div>
      </motion.aside>
    </>
  );
};

export default Sidebar;
