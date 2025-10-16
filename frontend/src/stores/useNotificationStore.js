import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Notification types
export const NOTIFICATION_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info',
  SYSTEM: 'system',
  ATTENDANCE: 'attendance',
  LEAVE: 'leave',
  RECRUITMENT: 'recruitment',
  EMPLOYEE: 'employee',
  ADMIN: 'admin'
};

// Notification priorities
export const NOTIFICATION_PRIORITIES = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  URGENT: 'urgent'
};

const useNotificationStore = create(
  persist(
    (set, get) => ({
      // State
      notifications: [],
      settings: {
        desktop: true,
        sound: true,
        email: false,
        autoMarkAsRead: false,
        maxNotifications: 50,
        retentionDays: 30
      },
      isConnected: true,
      lastSyncTime: null,

      // Actions
      addNotification: (notification) => {
        const newNotification = {
          id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          timestamp: new Date().toISOString(),
          read: false,
          archived: false,
          priority: NOTIFICATION_PRIORITIES.MEDIUM,
          type: NOTIFICATION_TYPES.INFO,
          autoClose: true,
          duration: 5000,
          actions: [],
          metadata: {},
          ...notification
        };

        set((state) => ({
          notifications: [newNotification, ...state.notifications].slice(0, state.settings.maxNotifications),
          lastSyncTime: new Date().toISOString()
        }));

        // Auto-archive old notifications
        get().cleanupOldNotifications();

        return newNotification.id;
      },

      removeNotification: (id) => {
        set((state) => ({
          notifications: state.notifications.filter(n => n.id !== id)
        }));
      },

      markAsRead: (id) => {
        set((state) => ({
          notifications: state.notifications.map(n => 
            n.id === id ? { ...n, read: true, readAt: new Date().toISOString() } : n
          )
        }));
      },

      markAllAsRead: () => {
        const now = new Date().toISOString();
        set((state) => ({
          notifications: state.notifications.map(n => 
            !n.read ? { ...n, read: true, readAt: now } : n
          )
        }));
      },

      archiveNotification: (id) => {
        set((state) => ({
          notifications: state.notifications.map(n => 
            n.id === id ? { ...n, archived: true, archivedAt: new Date().toISOString() } : n
          )
        }));
      },

      archiveAllRead: () => {
        const now = new Date().toISOString();
        set((state) => ({
          notifications: state.notifications.map(n => 
            n.read && !n.archived ? { ...n, archived: true, archivedAt: now } : n
          )
        }));
      },

      clearAll: () => {
        set({ notifications: [] });
      },

      clearArchived: () => {
        set((state) => ({
          notifications: state.notifications.filter(n => !n.archived)
        }));
      },

      updateSettings: (newSettings) => {
        set((state) => ({
          settings: { ...state.settings, ...newSettings }
        }));
      },

      cleanupOldNotifications: () => {
        const { settings } = get();
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - settings.retentionDays);

        set((state) => ({
          notifications: state.notifications.filter(n => 
            new Date(n.timestamp) > cutoffDate || n.priority === NOTIFICATION_PRIORITIES.URGENT
          )
        }));
      },

      // Notification generators for different modules
      addAttendanceNotification: (data) => {
        const { type, employee, message, metadata = {} } = data;
        
        let title, notificationType, priority;
        
        switch (type) {
          case 'check_in':
            title = 'Employee Checked In';
            notificationType = NOTIFICATION_TYPES.ATTENDANCE;
            priority = NOTIFICATION_PRIORITIES.LOW;
            break;
          case 'check_out':
            title = 'Employee Checked Out';
            notificationType = NOTIFICATION_TYPES.ATTENDANCE;
            priority = NOTIFICATION_PRIORITIES.LOW;
            break;
          case 'late_arrival':
            title = 'Late Arrival Alert';
            notificationType = NOTIFICATION_TYPES.WARNING;
            priority = NOTIFICATION_PRIORITIES.MEDIUM;
            break;
          case 'absence':
            title = 'Employee Absent';
            notificationType = NOTIFICATION_TYPES.WARNING;
            priority = NOTIFICATION_PRIORITIES.HIGH;
            break;
          default:
            title = 'Attendance Update';
            notificationType = NOTIFICATION_TYPES.ATTENDANCE;
            priority = NOTIFICATION_PRIORITIES.LOW;
        }

        return get().addNotification({
          title,
          message: message || `${employee?.firstName} ${employee?.lastName} - ${title}`,
          type: notificationType,
          priority,
          metadata: {
            module: 'attendance',
            employeeId: employee?.id,
            ...metadata
          }
        });
      },

      addLeaveNotification: (data) => {
        const { type, employee, leaveRequest, message, metadata = {} } = data;
        
        let title, notificationType, priority;
        
        switch (type) {
          case 'request_submitted':
            title = 'New Leave Request';
            notificationType = NOTIFICATION_TYPES.INFO;
            priority = NOTIFICATION_PRIORITIES.MEDIUM;
            break;
          case 'request_approved':
            title = 'Leave Request Approved';
            notificationType = NOTIFICATION_TYPES.SUCCESS;
            priority = NOTIFICATION_PRIORITIES.LOW;
            break;
          case 'request_rejected':
            title = 'Leave Request Rejected';
            notificationType = NOTIFICATION_TYPES.WARNING;
            priority = NOTIFICATION_PRIORITIES.MEDIUM;
            break;
          case 'request_expiring':
            title = 'Leave Request Expiring Soon';
            notificationType = NOTIFICATION_TYPES.WARNING;
            priority = NOTIFICATION_PRIORITIES.HIGH;
            break;
          default:
            title = 'Leave Request Update';
            notificationType = NOTIFICATION_TYPES.INFO;
            priority = NOTIFICATION_PRIORITIES.MEDIUM;
        }

        return get().addNotification({
          title,
          message: message || `${employee?.firstName} ${employee?.lastName} - ${title}`,
          type: notificationType,
          priority,
          metadata: {
            module: 'leave',
            employeeId: employee?.id,
            leaveRequestId: leaveRequest?.id,
            ...metadata
          }
        });
      },

      addRecruitmentNotification: (data) => {
        const { type, candidate, jobPosting, message, metadata = {} } = data;
        
        let title, notificationType, priority;
        
        switch (type) {
          case 'new_application':
            title = 'New Job Application';
            notificationType = NOTIFICATION_TYPES.INFO;
            priority = NOTIFICATION_PRIORITIES.MEDIUM;
            break;
          case 'interview_scheduled':
            title = 'Interview Scheduled';
            notificationType = NOTIFICATION_TYPES.INFO;
            priority = NOTIFICATION_PRIORITIES.MEDIUM;
            break;
          case 'candidate_hired':
            title = 'Candidate Hired';
            notificationType = NOTIFICATION_TYPES.SUCCESS;
            priority = NOTIFICATION_PRIORITIES.HIGH;
            break;
          case 'job_posting_expired':
            title = 'Job Posting Expired';
            notificationType = NOTIFICATION_TYPES.WARNING;
            priority = NOTIFICATION_PRIORITIES.MEDIUM;
            break;
          default:
            title = 'Recruitment Update';
            notificationType = NOTIFICATION_TYPES.INFO;
            priority = NOTIFICATION_PRIORITIES.MEDIUM;
        }

        return get().addNotification({
          title,
          message: message || `${candidate?.firstName} ${candidate?.lastName} - ${title}`,
          type: notificationType,
          priority,
          metadata: {
            module: 'recruitment',
            candidateId: candidate?.id,
            jobPostingId: jobPosting?.id,
            ...metadata
          }
        });
      },

      addEmployeeNotification: (data) => {
        const { type, employee, message, metadata = {} } = data;
        
        let title, notificationType, priority;
        
        switch (type) {
          case 'new_employee':
            title = 'New Employee Added';
            notificationType = NOTIFICATION_TYPES.SUCCESS;
            priority = NOTIFICATION_PRIORITIES.MEDIUM;
            break;
          case 'employee_updated':
            title = 'Employee Profile Updated';
            notificationType = NOTIFICATION_TYPES.INFO;
            priority = NOTIFICATION_PRIORITIES.LOW;
            break;
          case 'employee_terminated':
            title = 'Employee Terminated';
            notificationType = NOTIFICATION_TYPES.WARNING;
            priority = NOTIFICATION_PRIORITIES.HIGH;
            break;
          case 'performance_review_due':
            title = 'Performance Review Due';
            notificationType = NOTIFICATION_TYPES.WARNING;
            priority = NOTIFICATION_PRIORITIES.HIGH;
            break;
          default:
            title = 'Employee Update';
            notificationType = NOTIFICATION_TYPES.INFO;
            priority = NOTIFICATION_PRIORITIES.MEDIUM;
        }

        return get().addNotification({
          title,
          message: message || `${employee?.firstName} ${employee?.lastName} - ${title}`,
          type: notificationType,
          priority,
          metadata: {
            module: 'employee',
            employeeId: employee?.id,
            ...metadata
          }
        });
      },

      addSystemNotification: (data) => {
        const { type, message, metadata = {} } = data;
        
        let title, notificationType, priority;
        
        switch (type) {
          case 'system_maintenance':
            title = 'System Maintenance';
            notificationType = NOTIFICATION_TYPES.WARNING;
            priority = NOTIFICATION_PRIORITIES.HIGH;
            break;
          case 'security_alert':
            title = 'Security Alert';
            notificationType = NOTIFICATION_TYPES.ERROR;
            priority = NOTIFICATION_PRIORITIES.URGENT;
            break;
          case 'backup_completed':
            title = 'Backup Completed';
            notificationType = NOTIFICATION_TYPES.SUCCESS;
            priority = NOTIFICATION_PRIORITIES.LOW;
            break;
          case 'update_available':
            title = 'System Update Available';
            notificationType = NOTIFICATION_TYPES.INFO;
            priority = NOTIFICATION_PRIORITIES.MEDIUM;
            break;
          default:
            title = 'System Notification';
            notificationType = NOTIFICATION_TYPES.SYSTEM;
            priority = NOTIFICATION_PRIORITIES.MEDIUM;
        }

        return get().addNotification({
          title,
          message,
          type: notificationType,
          priority,
          metadata: {
            module: 'system',
            ...metadata
          }
        });
      },

      // Getters
      getUnreadCount: () => {
        return get().notifications.filter(n => !n.read && !n.archived).length;
      },

      getNotificationsByType: (type) => {
        return get().notifications.filter(n => n.type === type && !n.archived);
      },

      getNotificationsByPriority: (priority) => {
        return get().notifications.filter(n => n.priority === priority && !n.archived);
      },

      getRecentNotifications: (limit = 10) => {
        return get().notifications
          .filter(n => !n.archived)
          .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
          .slice(0, limit);
      },

      getUrgentNotifications: () => {
        return get().notifications.filter(n => 
          n.priority === NOTIFICATION_PRIORITIES.URGENT && !n.read && !n.archived
        );
      },

      // Connection status
      setConnectionStatus: (isConnected) => {
        set({ isConnected });
      },

      // Sync with backend (placeholder for future implementation)
      syncWithBackend: async () => {
        // This would integrate with a backend notification service
        // For now, it's a placeholder
        set({ lastSyncTime: new Date().toISOString() });
      }
    }),
    {
      name: 'notification-store',
      partialize: (state) => ({
        notifications: state.notifications.slice(0, 100), // Only persist recent notifications
        settings: state.settings,
        lastSyncTime: state.lastSyncTime
      })
    }
  )
);

export default useNotificationStore;
