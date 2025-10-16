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

      // Actions
      setLoading: (loading) => set({ loading }),
      setError: (error) => set({ error }),

      // Attendance Actions
      fetchAttendance: async (params = {}) => {
        try {
          set({ loading: true, error: null });
          const response = await attendanceApi.listAttendance(params);
          set({ attendance: response.data.data, loading: false });
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
          set({ currentEmployeeAttendance: response.data.data, loading: false });
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
          set({ loading: false });
          return response.data.data;
        } catch (error) {
          set({ error: error.message, loading: false });
          throw error;
        }
      },

      checkIn: async (employeeId, data = {}) => {
        try {
          set({ loading: true, error: null });
          const response = await attendanceApi.checkIn(employeeId, data);
          // Refresh current employee attendance
          if (get().currentEmployeeAttendance) {
            await get().fetchEmployeeAttendance(employeeId);
          }
          // Refresh attendance list
          await get().fetchAttendance();
          set({ loading: false });
          return response.data.data;
        } catch (error) {
          set({ error: error.message, loading: false });
          throw error;
        }
      },

      checkOut: async (employeeId, data = {}) => {
        try {
          set({ loading: true, error: null });
          const response = await attendanceApi.checkOut(employeeId, data);
          // Refresh current employee attendance
          if (get().currentEmployeeAttendance) {
            await get().fetchEmployeeAttendance(employeeId);
          }
          // Refresh attendance list
          await get().fetchAttendance();
          set({ loading: false });
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
          // Refresh leave requests list
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
          // Refresh leave requests list
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

      // Utility Actions
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
        error: null
      }),
    }),
    {
      name: 'attendance-store',
    }
  )
);

export default useAttendanceStore;
