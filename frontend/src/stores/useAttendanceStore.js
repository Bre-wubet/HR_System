import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { attendanceApi } from '../api/attendanceApi';

const useAttendanceStore = create(
  devtools(
    (set, get) => ({
      // State
      attendance: [],
      leaveRequests: [],
      attendanceSummary: null,
      absenceAnalytics: null,
      loading: false,
      error: null,
      currentEmployeeAttendance: null,
      lastUpdate: null,
      isOnline: navigator.onLine,
      notifications: [],

      // Actions
      setLoading: (loading) => set({ loading }),
      setError: (error) => set({ error }),
      setOnlineStatus: (isOnline) => set({ isOnline }),
      setLastUpdate: (lastUpdate) => set({ lastUpdate }),

      // Enhanced Attendance Actions
      fetchAttendance: async (params = {}) => {
        try {
          set({ loading: true, error: null });
          const response = await attendanceApi.listAttendance(params);
          set({ 
            attendance: response.data.data, 
            loading: false,
            lastUpdate: new Date()
          });
          return response.data.data;
        } catch (error) {
          set({ error: error.message, loading: false });
          throw error;
        }
      },

      fetchEmployeeAttendance: async (employeeId, params = {}) => {
        try {
          set({ loading: true, error: null });
          const response = await attendanceApi.getAttendanceByEmployee(employeeId, params);
          set({ 
            currentEmployeeAttendance: response.data.data, 
            loading: false,
            lastUpdate: new Date()
          });
          return response.data.data;
        } catch (error) {
          set({ error: error.message, loading: false });
          throw error;
        }
      },

      recordAttendance: async (data) => {
        try {
          set({ loading: true, error: null });
          const response = await attendanceApi.recordAttendance(data);
          // Refresh attendance list
          await get().fetchAttendance();
          set({ loading: false, lastUpdate: new Date() });
          return response.data.data;
        } catch (error) {
          set({ error: error.message, loading: false });
          throw error;
        }
      },

      updateAttendance: async (id, data) => {
        try {
          set({ loading: true, error: null });
          const response = await attendanceApi.updateAttendance(id, data);
          // Refresh attendance list
          await get().fetchAttendance();
          set({ loading: false, lastUpdate: new Date() });
          return response.data.data;
        } catch (error) {
          set({ error: error.message, loading: false });
          throw error;
        }
      },

      checkIn: async (employeeId, data = {}) => {
        try {
          set({ loading: true, error: null });
          const response = await attendanceApi.checkIn(employeeId, {
            timestamp: new Date().toISOString(),
            location: data.location || null,
            device: data.device || 'web',
            ...data
          });
          
          // Add notification
          const notifications = get().notifications;
          set({ 
            notifications: [...notifications, {
              id: Date.now(),
              type: 'success',
              message: 'Checked in successfully',
              timestamp: new Date()
            }],
            loading: false,
            lastUpdate: new Date()
          });
          
          return response.data.data;
        } catch (error) {
          set({ error: error.message, loading: false });
          throw error;
        }
      },

      checkOut: async (employeeId, data = {}) => {
        try {
          set({ loading: true, error: null });
          const response = await attendanceApi.checkOut(employeeId, {
            timestamp: new Date().toISOString(),
            location: data.location || null,
            device: data.device || 'web',
            ...data
          });
          
          // Add notification
          const notifications = get().notifications;
          set({ 
            notifications: [...notifications, {
              id: Date.now(),
              type: 'success',
              message: 'Checked out successfully',
              timestamp: new Date()
            }],
            loading: false,
            lastUpdate: new Date()
          });
          
          return response.data.data;
        } catch (error) {
          set({ error: error.message, loading: false });
          throw error;
        }
      },

      // Leave Management Actions
      fetchLeaveRequests: async (params = {}) => {
        try {
          set({ loading: true, error: null });
          const response = await attendanceApi.listLeaveRequests(params);
          set({ leaveRequests: response.data.data, loading: false });
          return response.data.data;
        } catch (error) {
          set({ error: error.message, loading: false });
          throw error;
        }
      },

      createLeaveRequest: async (data) => {
        try {
          set({ loading: true, error: null });
          const response = await attendanceApi.createLeaveRequest(data);
          await get().fetchLeaveRequests();
          set({ loading: false });
          return response.data.data;
        } catch (error) {
          set({ error: error.message, loading: false });
          throw error;
        }
      },

      updateLeaveStatus: async (leaveId, data) => {
        try {
          set({ loading: true, error: null });
          const response = await attendanceApi.updateLeaveStatus(leaveId, data);
          await get().fetchLeaveRequests();
          set({ loading: false });
          return response.data.data;
        } catch (error) {
          set({ error: error.message, loading: false });
          throw error;
        }
      },

      // Analytics Actions
      fetchAttendanceSummary: async (params = {}) => {
        try {
          set({ loading: true, error: null });
          const response = await attendanceApi.getAttendanceSummary(params);
          set({ attendanceSummary: response.data.data, loading: false });
          return response.data.data;
        } catch (error) {
          set({ error: error.message, loading: false });
          throw error;
        }
      },

      fetchAbsenceAnalytics: async (params = {}) => {
        try {
          set({ loading: true, error: null });
          const response = await attendanceApi.getAbsenceAnalytics(params);
          set({ absenceAnalytics: response.data.data, loading: false });
          return response.data.data;
        } catch (error) {
          set({ error: error.message, loading: false });
          throw error;
        }
      },

      // Enhanced Utility Actions
      getTodayAttendance: () => {
        const today = new Date().toDateString();
        return get().attendance.filter(record => 
          new Date(record.date).toDateString() === today
        );
      },

      getCurrentWeekAttendance: () => {
        const today = new Date();
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay());
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);

        return get().attendance.filter(record => {
          const recordDate = new Date(record.date);
          return recordDate >= startOfWeek && recordDate <= endOfWeek;
        });
      },

      getCurrentMonthAttendance: () => {
        const today = new Date();
        return get().attendance.filter(record => {
          const recordDate = new Date(record.date);
          return recordDate.getMonth() === today.getMonth() && 
                 recordDate.getFullYear() === today.getFullYear();
        });
      },

      getPendingLeaveRequests: () => {
        return get().leaveRequests.filter(request => 
          request.status === 'PENDING'
        );
      },

      getApprovedLeaveRequests: () => {
        return get().leaveRequests.filter(request => 
          request.status === 'APPROVED'
        );
      },

      // Real-time features
      addNotification: (notification) => {
        const notifications = get().notifications;
        set({ 
          notifications: [...notifications, {
            id: Date.now(),
            timestamp: new Date(),
            ...notification
          }]
        });
      },

      removeNotification: (notificationId) => {
        const notifications = get().notifications;
        set({ 
          notifications: notifications.filter(n => n.id !== notificationId)
        });
      },

      clearNotifications: () => set({ notifications: [] }),

      // Enhanced statistics
      getAttendanceStats: () => {
        const attendance = get().attendance;
        const todayAttendance = get().getTodayAttendance();
        const weekAttendance = get().getCurrentWeekAttendance();
        const monthAttendance = get().getCurrentMonthAttendance();

        return {
          total: attendance.length,
          presentToday: todayAttendance.filter(a => a.status === 'PRESENT').length,
          absentToday: todayAttendance.filter(a => a.status === 'ABSENT').length,
          lateToday: todayAttendance.filter(a => a.status === 'LATE').length,
          onLeaveToday: todayAttendance.filter(a => a.status === 'ON_LEAVE').length,
          attendanceRate: attendance.length > 0 ? 
            Math.round((attendance.filter(a => a.status === 'PRESENT').length / attendance.length) * 100) : 0,
          punctualityRate: weekAttendance.length > 0 ?
            Math.round((weekAttendance.filter(a => a.status === 'PRESENT').length / weekAttendance.length) * 100) : 0,
          avgWorkHours: monthAttendance.length > 0 ? 
            monthAttendance.reduce((sum, a) => {
              if (a.checkIn && a.checkOut) {
                const diffMs = new Date(a.checkOut).getTime() - new Date(a.checkIn).getTime();
                return sum + (diffMs / (1000 * 60 * 60));
              }
              return sum;
            }, 0) / monthAttendance.length : 0,
          overtimeHours: monthAttendance.reduce((sum, a) => sum + (a.overtime || 0), 0)
        };
      },

      // Reset actions
      resetAttendance: () => set({ attendance: [], currentEmployeeAttendance: null }),
      resetLeaveRequests: () => set({ leaveRequests: [] }),
      resetAnalytics: () => set({ attendanceSummary: null, absenceAnalytics: null }),
      resetAll: () => set({ 
        attendance: [], 
        leaveRequests: [], 
        attendanceSummary: null, 
        absenceAnalytics: null,
        currentEmployeeAttendance: null,
        loading: false,
        error: null,
        notifications: [],
        lastUpdate: null
      }),
    }),
    {
      name: 'attendance-store',
    }
  )
);

export default useAttendanceStore;