import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { cn } from '../../../lib/utils';

/**
 * Navigation Item Component
 * Individual navigation link with active state styling
 */
const NavigationItem = ({ item, isActive, onClick }) => (
  <motion.div
    whileHover={{ x: 4 }}
    whileTap={{ scale: 0.98 }}
  >
    <Link
      to={item.href}
      onClick={onClick}
      className={cn(
        'flex items-center px-4 py-3 text-sm font-medium rounded-xl',
        'transition-all duration-200 group',
        isActive
          ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-600 shadow-sm'
          : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
      )}
    >
      <item.icon className={cn(
        'mr-3 h-5 w-5 transition-colors',
        isActive ? 'text-blue-600' : 'text-gray-500 group-hover:text-gray-700'
      )} />
      <span className="flex-1">{item.name}</span>
      
      {/* Active indicator */}
      {isActive && (
        <motion.div
          layoutId="activeIndicator"
          className="w-2 h-2 bg-blue-600 rounded-full"
          initial={false}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        />
      )}
    </Link>
  </motion.div>
);

/**
 * Sidebar Navigation Component
 * Renders the main navigation menu
 */
const SidebarNavigation = ({ navigationItems, currentPath, onItemClick }) => (
  <nav className="flex-1 px-4 py-6">
    <div className="space-y-2">
      {navigationItems?.map((item) => {
        const isActive = currentPath === item.href || 
          (item.href !== '/dashboard' && currentPath.startsWith(item.href));
        
        return (
          <NavigationItem
            key={item.name}
            item={item}
            isActive={isActive}
            onClick={onItemClick}
          />
        );
      })}
    </div>
  </nav>
);

export default SidebarNavigation;
