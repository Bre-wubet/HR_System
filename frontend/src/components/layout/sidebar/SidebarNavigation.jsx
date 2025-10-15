import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { cn } from '../../../lib/utils';

/**
 * Navigation Item Component
 * Individual navigation link with active state styling and subItems support
 */
const NavigationItem = ({ item, isActive, onClick, currentPath }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const hasSubItems = item.subItems && item.subItems.length > 0;
  
  // Check if any subItem is active
  const hasActiveSubItem = hasSubItems && item.subItems.some(subItem => 
    currentPath === subItem.href || currentPath.startsWith(subItem.href)
  );

  const handleClick = () => {
    if (hasSubItems) {
      setIsExpanded(!isExpanded);
    } else {
      onClick?.();
    }
  };

  return (
    <div className="space-y-1">
      {/* Main Item */}
      <motion.div
        whileHover={{ x: 4 }}
        whileTap={{ scale: 0.98 }}
      >
        <Link
          to={item.href}
          onClick={handleClick}
          className={cn(
            'flex items-center px-4 py-3 text-sm font-medium rounded-xl',
            'transition-all duration-200 group',
            isActive || hasActiveSubItem
              ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-600 shadow-sm'
              : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
          )}
        >
          <item.icon className={cn(
            'mr-3 h-5 w-5 transition-colors',
            isActive || hasActiveSubItem ? 'text-blue-600' : 'text-gray-500 group-hover:text-gray-700'
          )} />
          <span className="flex-1">{item.name}</span>
          
          {/* Expand/Collapse Icon */}
          {hasSubItems && (
            <motion.div
              animate={{ rotate: isExpanded ? 90 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronRight className="h-4 w-4 text-gray-400" />
            </motion.div>
          )}
          
          {/* Active indicator */}
          {(isActive || hasActiveSubItem) && !hasSubItems && (
            <motion.div
              layoutId="activeIndicator"
              className="w-2 h-2 bg-blue-600 rounded-full"
              initial={false}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            />
          )}
        </Link>
      </motion.div>

      {/* Sub Items */}
      <AnimatePresence>
        {hasSubItems && isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="ml-4 space-y-1 border-l border-gray-200 pl-4">
              {item.subItems.map((subItem) => {
                const isSubItemActive = currentPath === subItem.href || 
                  (subItem.href !== '/dashboard' && currentPath.startsWith(subItem.href));
                
                return (
                  <motion.div
                    key={subItem.name}
                    whileHover={{ x: 2 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Link
                      to={subItem.href}
                      onClick={onClick}
                      className={cn(
                        'flex items-center px-3 py-2 text-sm font-medium rounded-lg',
                        'transition-all duration-200 group',
                        isSubItemActive
                          ? 'bg-blue-50 text-blue-700 shadow-sm'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      )}
                    >
                      <subItem.icon className={cn(
                        'mr-2 h-4 w-4 transition-colors',
                        isSubItemActive ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-600'
                      )} />
                      <span className="flex-1">{subItem.name}</span>
                      
                      {/* Active indicator for sub items */}
                      {isSubItemActive && (
                        <motion.div
                          layoutId={`activeIndicator-${subItem.name}`}
                          className="w-1.5 h-1.5 bg-blue-600 rounded-full"
                          initial={false}
                          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                        />
                      )}
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

/**
 * Sidebar Navigation Component
 * Renders the main navigation menu with support for subItems
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
            currentPath={currentPath}
            onClick={onItemClick}
          />
        );
      })}
    </div>
  </nav>
);

export default SidebarNavigation;
