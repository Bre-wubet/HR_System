import React, { useState, useEffect } from 'react';
import { Bell, X, CheckCircle, AlertCircle, Info, AlertTriangle, Settings, Archive, Calendar, Users, User, Shield } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn, timeAgo } from '../../../lib/utils';
import useNotificationStore, { NOTIFICATION_TYPES } from '../../../stores/useNotificationStore';

/**
 * Enhanced Notification Button Component
 * Displays notification bell with badge and comprehensive dropdown
 */
const NotificationButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  const {
    notifications,
    getUnreadCount,
    getRecentNotifications,
    markAsRead,
    markAllAsRead,
    archiveAllRead,
    removeNotification,
    settings
  } = useNotificationStore();

  const unreadCount = getUnreadCount();
  const recentNotifications = getRecentNotifications(20);

  // Auto-close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isOpen && !event.target.closest('[data-notification-button]')) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const getNotificationIcon = (type) => {
    switch (type) {
      case NOTIFICATION_TYPES.SUCCESS:
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case NOTIFICATION_TYPES.WARNING:
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case NOTIFICATION_TYPES.ERROR:
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case NOTIFICATION_TYPES.ATTENDANCE:
        return <Bell className="h-4 w-4 text-blue-500" />;
      case NOTIFICATION_TYPES.LEAVE:
        return <Calendar className="h-4 w-4 text-purple-500" />;
      case NOTIFICATION_TYPES.RECRUITMENT:
        return <Users className="h-4 w-4 text-indigo-500" />;
      case NOTIFICATION_TYPES.EMPLOYEE:
        return <User className="h-4 w-4 text-green-600" />;
      case NOTIFICATION_TYPES.ADMIN:
        return <Shield className="h-4 w-4 text-purple-600" />;
      case NOTIFICATION_TYPES.SYSTEM:
        return <Settings className="h-4 w-4 text-gray-500" />;
      default:
        return <Info className="h-4 w-4 text-blue-500" />;
    }
  };

  const getNotificationColor = (type, priority) => {
    const baseColors = {
      [NOTIFICATION_TYPES.SUCCESS]: 'border-l-green-500',
      [NOTIFICATION_TYPES.WARNING]: 'border-l-yellow-500',
      [NOTIFICATION_TYPES.ERROR]: 'border-l-red-500',
      [NOTIFICATION_TYPES.ATTENDANCE]: 'border-l-blue-500',
      [NOTIFICATION_TYPES.LEAVE]: 'border-l-purple-500',
      [NOTIFICATION_TYPES.RECRUITMENT]: 'border-l-indigo-500',
      [NOTIFICATION_TYPES.EMPLOYEE]: 'border-l-green-600',
      [NOTIFICATION_TYPES.ADMIN]: 'border-l-purple-600',
      [NOTIFICATION_TYPES.SYSTEM]: 'border-l-gray-500',
      [NOTIFICATION_TYPES.INFO]: 'border-l-blue-500'
    };

    return baseColors[type] || 'border-l-blue-500';
  };

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'urgent':
        return <span className="bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full font-medium">URGENT</span>;
      case 'high':
        return <span className="bg-orange-500 text-white text-xs px-1.5 py-0.5 rounded-full font-medium">HIGH</span>;
      case 'medium':
        return <span className="bg-yellow-500 text-white text-xs px-1.5 py-0.5 rounded-full font-medium">MED</span>;
      case 'low':
        return <span className="bg-gray-500 text-white text-xs px-1.5 py-0.5 rounded-full font-medium">LOW</span>;
      default:
        return null;
    }
  };

  const handleNotificationClick = (notification) => {
    if (!notification.read) {
      markAsRead(notification.id);
    }
    
    // Handle notification actions if any
    if (notification.actions && notification.actions.length > 0) {
      // This would typically navigate to the relevant page or trigger an action
      console.log('Notification action triggered:', notification.actions[0]);
    }
  };

  const handleMarkAllAsRead = () => {
    markAllAsRead();
  };

  const handleArchiveAllRead = () => {
    archiveAllRead();
  };

  return (
    <div className="relative" data-notification-button>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'relative p-2 rounded-lg',
          'text-gray-400 hover:text-gray-600 hover:bg-gray-100',
          'transition-colors duration-200',
          'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
        )}
        aria-label="Notifications"
      >
        <Bell className="h-5 w-5" />
        
        {/* Notification badge */}
        {unreadCount > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-medium"
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </motion.span>
        )}
      </button>

      {/* Notification dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className="absolute right-0 mt-2 w-96 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-2 border-b border-gray-100">
              <div className="flex items-center space-x-2">
                <h3 className="text-sm font-semibold text-gray-900">Notifications</h3>
                {unreadCount > 0 && (
                  <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                    {unreadCount} new
                  </span>
                )}
              </div>
              <div className="flex items-center space-x-1">
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllAsRead}
                    className="p-1 rounded-md hover:bg-gray-100 transition-colors"
                    title="Mark all as read"
                  >
                    <CheckCircle className="h-4 w-4 text-gray-400" />
                  </button>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 rounded-md hover:bg-gray-100 transition-colors"
                >
                  <X className="h-4 w-4 text-gray-400" />
                </button>
              </div>
            </div>

            {/* Notifications list */}
            <div className="max-h-96 overflow-y-auto">
              {recentNotifications.length === 0 ? (
                <div className="px-4 py-8 text-center text-gray-500">
                  <Bell className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                  <p className="text-sm">No notifications</p>
                  <p className="text-xs text-gray-400 mt-1">You're all caught up!</p>
                </div>
              ) : (
                recentNotifications.map((notification) => (
                  <div
                    key={notification.id}
                    onClick={() => handleNotificationClick(notification)}
                    className={cn(
                      'px-4 py-3 border-l-4 hover:bg-gray-50 transition-colors cursor-pointer',
                      getNotificationColor(notification.type, notification.priority),
                      !notification.read && 'bg-blue-50/50'
                    )}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 mt-0.5">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <p className={cn(
                            'text-sm font-medium',
                            !notification.read ? 'text-gray-900' : 'text-gray-700'
                          )}>
                            {notification.title}
                          </p>
                          <div className="flex items-center space-x-1 ml-2">
                            {getPriorityBadge(notification.priority)}
                            {!notification.read && (
                              <div className="h-2 w-2 bg-blue-500 rounded-full" />
                            )}
                          </div>
                        </div>
                        <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                          {notification.message}
                        </p>
                        <div className="flex items-center justify-between mt-2">
                          <p className="text-xs text-gray-400">
                            {timeAgo(new Date(notification.timestamp))}
                          </p>
                          {notification.metadata?.module && (
                            <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded">
                              {notification.metadata.module}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            {recentNotifications.length > 0 && (
              <div className="border-t border-gray-100 px-4 py-2">
                <div className="flex items-center justify-between">
                  <button
                    onClick={handleArchiveAllRead}
                    className="flex items-center text-xs text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    <Archive className="h-3 w-3 mr-1" />
                    Archive read
                  </button>
                  <button
                    onClick={() => {/* Navigate to full notifications page */}}
                    className="text-xs text-blue-600 hover:text-blue-700 transition-colors"
                  >
                    View all notifications
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotificationButton;