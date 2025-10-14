import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  CheckCircle, 
  AlertCircle, 
  Info, 
  AlertTriangle,
  Bell 
} from 'lucide-react';
import { cn } from '../../lib/utils';

// Notification Types
const NOTIFICATION_TYPES = {
  success: {
    icon: CheckCircle,
    className: 'bg-success-50 border-success-200 text-success-800',
    iconClassName: 'text-success-600',
  },
  error: {
    icon: AlertCircle,
    className: 'bg-error-50 border-error-200 text-error-800',
    iconClassName: 'text-error-600',
  },
  warning: {
    icon: AlertTriangle,
    className: 'bg-warning-50 border-warning-200 text-warning-800',
    iconClassName: 'text-warning-600',
  },
  info: {
    icon: Info,
    className: 'bg-primary-50 border-primary-200 text-primary-800',
    iconClassName: 'text-primary-600',
  },
};

// Individual Notification Component
const NotificationItem = ({ 
  notification, 
  onRemove, 
  autoClose = true,
  duration = 5000 
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const typeConfig = NOTIFICATION_TYPES[notification.type] || NOTIFICATION_TYPES.info;
  const Icon = typeConfig.icon;

  useEffect(() => {
    if (autoClose && notification.autoClose !== false) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(() => onRemove(notification.id), 300);
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [notification.id, autoClose, duration, onRemove]);

  const handleRemove = () => {
    setIsVisible(false);
    setTimeout(() => onRemove(notification.id), 300);
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 300, scale: 0.3 }}
      animate={{ 
        opacity: isVisible ? 1 : 0, 
        x: isVisible ? 0 : 300, 
        scale: isVisible ? 1 : 0.3 
      }}
      exit={{ opacity: 0, x: 300, scale: 0.3 }}
      transition={{ duration: 0.3 }}
      className={cn(
        'relative flex items-start p-4 rounded-lg border shadow-medium',
        typeConfig.className
      )}
    >
      <Icon className={cn('h-5 w-5 mr-3 flex-shrink-0 mt-0.5', typeConfig.iconClassName)} />
      
      <div className="flex-1 min-w-0">
        {notification.title && (
          <h4 className="text-sm font-semibold mb-1">
            {notification.title}
          </h4>
        )}
        <p className="text-sm">
          {notification.message}
        </p>
        {notification.action && (
          <div className="mt-2">
            {notification.action}
          </div>
        )}
      </div>

      <button
        onClick={handleRemove}
        className="ml-3 flex-shrink-0 p-1 rounded-md hover:bg-black hover:bg-opacity-10"
      >
        <X className="h-4 w-4" />
      </button>
    </motion.div>
  );
};

// Notification Container Component
export const NotificationContainer = ({ 
  notifications = [], 
  onRemove,
  position = 'top-right',
  maxNotifications = 5,
  className = ''
}) => {
  const positionClasses = {
    'top-right': 'top-4 right-4',
    'top-left': 'top-4 left-4',
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'top-center': 'top-4 left-1/2 transform -translate-x-1/2',
    'bottom-center': 'bottom-4 left-1/2 transform -translate-x-1/2',
  };

  const displayNotifications = notifications.slice(0, maxNotifications);

  return (
    <div className={cn(
      'fixed z-50 space-y-2',
      positionClasses[position],
      className
    )}>
      <AnimatePresence>
        {displayNotifications.map((notification) => (
          <NotificationItem
            key={notification.id}
            notification={notification}
            onRemove={onRemove}
          />
        ))}
      </AnimatePresence>
    </div>
  );
};

// Notification Bell Component
export const NotificationBell = ({ 
  notifications = [], 
  onClick,
  className = ''
}) => {
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <button
      onClick={onClick}
      className={cn(
        'relative p-2 text-gray-400 hover:text-gray-600 transition-colors',
        className
      )}
    >
      <Bell className="h-5 w-5" />
      {unreadCount > 0 && (
        <span className="absolute -top-1 -right-1 h-4 w-4 bg-error-500 text-white text-xs rounded-full flex items-center justify-center">
          {unreadCount > 99 ? '99+' : unreadCount}
        </span>
      )}
    </button>
  );
};

// Notification Dropdown Component
export const NotificationDropdown = ({ 
  notifications = [], 
  isOpen,
  onClose,
  onMarkAsRead,
  onMarkAllAsRead,
  className = ''
}) => {
  const unreadNotifications = notifications.filter(n => !n.read);
  const readNotifications = notifications.filter(n => n.read);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className={cn(
            'absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-medium border border-gray-200 py-1 z-50',
            className
          )}
        >
          {/* Header */}
          <div className="px-4 py-3 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-900">
                Notifications
              </h3>
              {unreadNotifications.length > 0 && (
                <button
                  onClick={onMarkAllAsRead}
                  className="text-xs text-primary-600 hover:text-primary-700"
                >
                  Mark all as read
                </button>
              )}
            </div>
          </div>

          {/* Notifications List */}
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="px-4 py-8 text-center text-gray-500">
                <Bell className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                <p className="text-sm">No notifications</p>
              </div>
            ) : (
              <>
                {/* Unread Notifications */}
                {unreadNotifications.length > 0 && (
                  <div className="px-4 py-2">
                    <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      New ({unreadNotifications.length})
                    </h4>
                  </div>
                )}
                {unreadNotifications.map((notification) => (
                  <NotificationDropdownItem
                    key={notification.id}
                    notification={notification}
                    onMarkAsRead={() => onMarkAsRead(notification.id)}
                  />
                ))}

                {/* Read Notifications */}
                {readNotifications.length > 0 && unreadNotifications.length > 0 && (
                  <div className="px-4 py-2 border-t border-gray-100">
                    <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      Earlier
                    </h4>
                  </div>
                )}
                {readNotifications.map((notification) => (
                  <NotificationDropdownItem
                    key={notification.id}
                    notification={notification}
                    isRead={true}
                  />
                ))}
              </>
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="px-4 py-3 border-t border-gray-200">
              <button className="w-full text-sm text-primary-600 hover:text-primary-700 text-center">
                View all notifications
              </button>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Notification Dropdown Item Component
const NotificationDropdownItem = ({ 
  notification, 
  onMarkAsRead,
  isRead = false 
}) => {
  const typeConfig = NOTIFICATION_TYPES[notification.type] || NOTIFICATION_TYPES.info;
  const Icon = typeConfig.icon;

  return (
    <div
      className={cn(
        'px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors',
        !isRead && 'bg-primary-50'
      )}
      onClick={() => !isRead && onMarkAsRead && onMarkAsRead()}
    >
      <div className="flex items-start">
        <Icon className={cn('h-4 w-4 mr-3 mt-0.5 flex-shrink-0', typeConfig.iconClassName)} />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900">
            {notification.title}
          </p>
          <p className="text-sm text-gray-600 mt-1">
            {notification.message}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {formatNotificationTime(notification.timestamp)}
          </p>
        </div>
        {!isRead && (
          <div className="h-2 w-2 bg-primary-600 rounded-full flex-shrink-0 mt-2"></div>
        )}
      </div>
    </div>
  );
};

// Format notification timestamp
const formatNotificationTime = (timestamp) => {
  const now = new Date();
  const notificationTime = new Date(timestamp);
  const diffInMinutes = Math.floor((now - notificationTime) / (1000 * 60));

  if (diffInMinutes < 1) return 'Just now';
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `${diffInDays}d ago`;
  
  return notificationTime.toLocaleDateString();
};

// Notification Hook
export const useNotifications = () => {
  const [notifications, setNotifications] = useState([]);

  const addNotification = (notification) => {
    const newNotification = {
      id: Date.now() + Math.random(),
      timestamp: new Date(),
      read: false,
      ...notification,
    };
    
    setNotifications(prev => [newNotification, ...prev]);
  };

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const markAsRead = (id) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(n => ({ ...n, read: true }))
    );
  };

  const clearAll = () => {
    setNotifications([]);
  };

  return {
    notifications,
    addNotification,
    removeNotification,
    markAsRead,
    markAllAsRead,
    clearAll,
  };
};

export default {
  NotificationContainer,
  NotificationBell,
  NotificationDropdown,
  useNotifications,
};
