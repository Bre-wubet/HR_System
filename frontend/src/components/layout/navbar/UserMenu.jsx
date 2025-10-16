import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, 
  Settings, 
  LogOut, 
  ChevronDown,
  Shield,
  HelpCircle,
  Bell,
  Activity,
  Clock,
  CheckCircle,
  AlertCircle,
  Crown,
  Building,
  Mail,
  Phone,
  Calendar
} from 'lucide-react';
import { cn, getInitials } from '../../../lib/utils';
import useNotificationStore from '../../../stores/useNotificationStore';
import useAuthStore from '../../../stores/useAuthStore';

/**
 * User Menu Component
 * Enhanced user profile dropdown with notifications, status, and navigation
 */
const UserMenu = ({ user, onLogout }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [lastActiveTime, setLastActiveTime] = useState(new Date());
  const { getUnreadCount, getUrgentNotifications } = useNotificationStore();
  const { roles, permissions } = useAuthStore();

  // Update last active time
  useEffect(() => {
    const interval = setInterval(() => {
      setLastActiveTime(new Date());
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    setIsOpen(false);
    onLogout();
  };

  // Get user status based on activity and permissions
  const getUserStatus = () => {
    const urgentNotifications = getUrgentNotifications();
    if (urgentNotifications.length > 0) {
      return { status: 'urgent', color: 'red', text: 'Urgent notifications' };
    }
    
    const unreadCount = getUnreadCount();
    if (unreadCount > 5) {
      return { status: 'busy', color: 'yellow', text: 'Many notifications' };
    }
    
    if (roles?.includes('super_admin') || roles?.includes('admin')) {
      return { status: 'admin', color: 'purple', text: 'Administrator' };
    }
    
    return { status: 'active', color: 'green', text: 'Active' };
  };

  const userStatus = getUserStatus();

  // Get role display information
  const getRoleInfo = () => {
    if (!roles || roles.length === 0) return { name: 'User', icon: User, level: 'basic' };
    
    const roleHierarchy = {
      'super_admin': { name: 'Super Admin', icon: Crown, level: 'highest', color: 'text-purple-600' },
      'admin': { name: 'Administrator', icon: Shield, level: 'high', color: 'text-blue-600' },
      'hr_manager': { name: 'HR Manager', icon: Building, level: 'medium', color: 'text-green-600' },
      'hr_staff': { name: 'HR Staff', icon: User, level: 'medium', color: 'text-blue-500' },
      'manager': { name: 'Manager', icon: Building, level: 'medium', color: 'text-indigo-600' },
      'employee': { name: 'Employee', icon: User, level: 'basic', color: 'text-gray-600' }
    };

    // Find the highest role
    const highestRole = roles.reduce((highest, role) => {
      const currentRole = roleHierarchy[role];
      if (!currentRole) return highest;
      
      const levelOrder = { 'highest': 4, 'high': 3, 'medium': 2, 'basic': 1 };
      return levelOrder[currentRole.level] > levelOrder[highest.level] ? currentRole : highest;
    }, roleHierarchy['employee']);

    return highestRole;
  };

  const roleInfo = getRoleInfo();

  // Get permission count
  const permissionCount = permissions?.length || 0;

  // Menu items with conditional visibility
  const menuItems = [
    {
      icon: User,
      label: 'Profile',
      href: '/profile',
      onClick: () => setIsOpen(false),
      show: true
    },
    {
      icon: Settings,
      label: 'Settings',
      href: '/settings',
      onClick: () => setIsOpen(false),
      show: true
    },
    {
      icon: Shield,
      label: 'Security',
      href: '/security',
      onClick: () => setIsOpen(false),
      show: true
    },
    {
      icon: Bell,
      label: 'Notifications',
      href: '/notifications',
      onClick: () => setIsOpen(false),
      show: true,
      badge: getUnreadCount() > 0 ? getUnreadCount() : null
    },
    {
      icon: Building,
      label: 'Admin Panel',
      href: '/admin',
      onClick: () => setIsOpen(false),
      show: roles?.includes('super_admin') || roles?.includes('admin') || permissions?.includes('admin:manage_users')
    },
    {
      icon: HelpCircle,
      label: 'Help & Support',
      href: '/help',
      onClick: () => setIsOpen(false),
      show: true
    },
  ].filter(item => item.show);

  // Format last active time
  const formatLastActive = (time) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now - time) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    return time.toLocaleDateString();
  };

  if (!user) return null;

  return (
    <div className="relative" data-user-menu>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'flex items-center space-x-2 p-2 rounded-lg',
          'hover:bg-gray-100 transition-colors duration-200',
          'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
          'relative'
        )}
        aria-label="User menu"
      >
        <div className="relative">
          <div className={cn(
            'h-8 w-8 bg-gradient-to-br rounded-full flex items-center justify-center ring-2',
            userStatus.status === 'urgent' ? 'from-red-100 to-red-200 ring-red-50' :
            userStatus.status === 'busy' ? 'from-yellow-100 to-yellow-200 ring-yellow-50' :
            userStatus.status === 'admin' ? 'from-purple-100 to-purple-200 ring-purple-50' :
            'from-blue-100 to-blue-200 ring-blue-50'
          )}>
            <span className={cn(
              'text-sm font-semibold',
              userStatus.status === 'urgent' ? 'text-red-700' :
              userStatus.status === 'busy' ? 'text-yellow-700' :
              userStatus.status === 'admin' ? 'text-purple-700' :
              'text-blue-700'
            )}>
              {getInitials(`${String(user.firstName || '')} ${String(user.lastName || '')}`)}
            </span>
          </div>
          
          {/* Status indicator */}
          <div className={cn(
            'absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white',
            userStatus.color === 'red' ? 'bg-red-500' :
            userStatus.color === 'yellow' ? 'bg-yellow-500' :
            userStatus.color === 'purple' ? 'bg-purple-500' :
            'bg-green-500'
          )} />
        </div>
        
        <div className="hidden sm:block text-left">
          <p className="text-sm font-medium text-gray-900">
            {String(user.firstName || '')} {String(user.lastName || '')}
          </p>
          <p className="text-xs text-gray-500">
            {roleInfo.name}
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
            className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50"
          >
            {/* User info header */}
            <div className="px-4 py-3 border-b border-gray-100">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <div className={cn(
                    'h-12 w-12 bg-gradient-to-br rounded-full flex items-center justify-center',
                    userStatus.status === 'urgent' ? 'from-red-100 to-red-200' :
                    userStatus.status === 'busy' ? 'from-yellow-100 to-yellow-200' :
                    userStatus.status === 'admin' ? 'from-purple-100 to-purple-200' :
                    'from-blue-100 to-blue-200'
                  )}>
                    <span className={cn(
                      'text-lg font-semibold',
                      userStatus.status === 'urgent' ? 'text-red-700' :
                      userStatus.status === 'busy' ? 'text-yellow-700' :
                      userStatus.status === 'admin' ? 'text-purple-700' :
                      'text-blue-700'
                    )}>
                      {getInitials(`${String(user.firstName || '')} ${String(user.lastName || '')}`)}
                    </span>
                  </div>
                  
                  {/* Status indicator */}
                  <div className={cn(
                    'absolute -bottom-0.5 -right-0.5 h-4 w-4 rounded-full border-2 border-white flex items-center justify-center',
                    userStatus.color === 'red' ? 'bg-red-500' :
                    userStatus.color === 'yellow' ? 'bg-yellow-500' :
                    userStatus.color === 'purple' ? 'bg-purple-500' :
                    'bg-green-500'
                  )}>
                    {userStatus.status === 'urgent' && <AlertCircle className="h-2 w-2 text-white" />}
                    {userStatus.status === 'busy' && <Clock className="h-2 w-2 text-white" />}
                    {userStatus.status === 'admin' && <Crown className="h-2 w-2 text-white" />}
                    {userStatus.status === 'active' && <CheckCircle className="h-2 w-2 text-white" />}
                  </div>
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <p className="text-sm font-semibold text-gray-900 truncate">
                      {String(user.firstName || '')} {String(user.lastName || '')}
                    </p>
                    <roleInfo.icon className={cn('h-4 w-4', roleInfo.color)} />
                  </div>
                  <p className="text-xs text-gray-500 truncate">
                    {String(user.email || '')}
                  </p>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className={cn(
                      'text-xs px-2 py-0.5 rounded-full',
                      userStatus.color === 'red' ? 'bg-red-100 text-red-700' :
                      userStatus.color === 'yellow' ? 'bg-yellow-100 text-yellow-700' :
                      userStatus.color === 'purple' ? 'bg-purple-100 text-purple-700' :
                      'bg-green-100 text-green-700'
                    )}>
                      {userStatus.text}
                    </span>
                    <span className="text-xs text-gray-400">
                      {formatLastActive(lastActiveTime)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* User stats */}
            <div className="px-4 py-2 border-b border-gray-100">
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <p className="text-xs text-gray-500">Role Level</p>
                  <p className="text-sm font-semibold text-gray-900 capitalize">{roleInfo.level}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Permissions</p>
                  <p className="text-sm font-semibold text-gray-900">{permissionCount}</p>
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
                  className="flex items-center justify-between px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center">
                    <item.icon className="mr-3 h-4 w-4 text-gray-400" />
                    {item.label}
                  </div>
                  {item.badge && (
                    <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                      {item.badge > 99 ? '99+' : item.badge}
                    </span>
                  )}
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
