import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, 
  Settings, 
  LogOut, 
  ChevronDown,
  Shield,
  HelpCircle 
} from 'lucide-react';
import { cn, getInitials } from '../../../lib/utils';

/**
 * User Menu Component
 * User profile dropdown with navigation and logout
 */
const UserMenu = ({ user, onLogout }) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = () => {
    setIsOpen(false);
    onLogout();
  };

  const menuItems = [
    {
      icon: User,
      label: 'Profile',
      href: '/profile',
      onClick: () => setIsOpen(false),
    },
    {
      icon: Settings,
      label: 'Settings',
      href: '/settings',
      onClick: () => setIsOpen(false),
    },
    {
      icon: Shield,
      label: 'Security',
      href: '/security',
      onClick: () => setIsOpen(false),
    },
    {
      icon: HelpCircle,
      label: 'Help & Support',
      href: '/help',
      onClick: () => setIsOpen(false),
    },
  ];

  if (!user) return null;

  return (
    <div className="relative" data-user-menu>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'flex items-center space-x-2 p-2 rounded-lg',
          'hover:bg-gray-100 transition-colors duration-200',
          'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
        )}
        aria-label="User menu"
      >
        <div className="h-8 w-8 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center ring-2 ring-blue-50">
          <span className="text-sm font-semibold text-blue-700">
            {getInitials(`${user.firstName} ${user.lastName}`)}
          </span>
        </div>
        
        <div className="hidden sm:block text-left">
          <p className="text-sm font-medium text-gray-900">
            {user.firstName} {user.lastName}
          </p>
          <p className="text-xs text-gray-500">
            {user.role || 'User'}
          </p>
        </div>
        
        <ChevronDown className={cn(
          'h-4 w-4 text-gray-400 transition-transform',
          isOpen && 'rotate-180'
        )} />
      </button>

      {/* User menu dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50"
          >
            {/* User info header */}
            <div className="px-4 py-3 border-b border-gray-100">
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center">
                  <span className="text-sm font-semibold text-blue-700">
                    {getInitials(`${user.firstName} ${user.lastName}`)}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">
                    {user.firstName} {user.lastName}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {user.email}
                  </p>
                </div>
              </div>
            </div>

            {/* Menu items */}
            <div className="py-1">
              {menuItems.map((item) => (
                <Link
                  key={item.label}
                  to={item.href}
                  onClick={item.onClick}
                  className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <item.icon className="mr-3 h-4 w-4 text-gray-400" />
                  {item.label}
                </Link>
              ))}
            </div>

            {/* Logout button */}
            <div className="border-t border-gray-100 py-1">
              <button
                onClick={handleLogout}
                className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
              >
                <LogOut className="mr-3 h-4 w-4" />
                Sign out
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default UserMenu;
