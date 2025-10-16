import { create } from 'zustand';
import { reportsApi } from '../api/reportsApi';

/**
 * Reports Store
 * Manages state for all reporting and analytics data
 */
export const useReportsStore = create((set, get) => ({
  // State
  attendanceData: null,
  attendanceSummary: null,
  absenceAnalytics: null,
  leaveRequests: [],
  
  employeeData: [],
  departments: [],
  skillAnalytics: null,
  careerProgressionAnalytics: null,
  organizationalChart: null,
  
  recruitmentData: {
    jobPostings: [],
    candidates: [],
    interviews: [],
    kpis: null
  },
  
  // Loading states
  isLoading: {
    attendance: false,
    employee: false,
    recruitment: false,
    skills: false,
    career: false,
    absence: false
  },
  
  // Error states
  errors: {
    attendance: null,
    employee: null,
    recruitment: null,
    skills: null,
    career: null,
    absence: null
  },
  
  // Pagination
  pagination: {
    attendance: { page: 1, limit: 50, total: 0 },
    employee: { page: 1, limit: 50, total: 0 },
    recruitment: { page: 1, limit: 50, total: 0 }
  },
  
  // Filters
  filters: {
    attendance: { from: null, to: null, departmentId: null },
    employee: { departmentId: null, status: null },
    recruitment: { from: null, to: null, status: null }
  },

  // Actions
  setLoading: (type, isLoading) => set((state) => ({
    isLoading: { ...state.isLoading, [type]: isLoading }
  })),

  setError: (type, error) => set((state) => ({
    errors: { ...state.errors, [type]: error }
  })),

  clearError: (type) => set((state) => ({
    errors: { ...state.errors, [type]: null }
  })),

  setFilters: (type, filters) => set((state) => ({
    filters: { ...state.filters, [type]: { ...state.filters[type], ...filters } }
  })),

  // Attendance Reports
  fetchAttendanceSummary: async (params = {}) => {
    const { setLoading, setError, clearError } = get();
    
    try {
      setLoading('attendance', true);
      clearError('attendance');
      
      const data = await reportsApi.getAttendanceSummary(params);
      
      set((state) => ({
        attendanceSummary: data.data,
        filters: {
          ...state.filters,
          attendance: { ...state.filters.attendance, ...params }
        }
      }));
      
      return data.data;
    } catch (error) {
      console.error('Error fetching attendance summary:', error);
      setError('attendance', error.message || 'Failed to fetch attendance summary');
      throw error;
    } finally {
      setLoading('attendance', false);
    }
  },

  fetchAbsenceAnalytics: async (params = {}) => {
    const { setLoading, setError, clearError } = get();
    
    try {
      setLoading('absence', true);
      clearError('absence');
      
      const data = await reportsApi.getAbsenceAnalytics(params);
      
      set({ absenceAnalytics: data.data });
      
      return data.data;
    } catch (error) {
      console.error('Error fetching absence analytics:', error);
      setError('absence', error.message || 'Failed to fetch absence analytics');
      throw error;
    } finally {
      setLoading('absence', false);
    }
  },

  fetchAttendanceData: async (params = {}) => {
    const { setLoading, setError, clearError } = get();
    
    try {
      setLoading('attendance', true);
      clearError('attendance');
      
      const data = await reportsApi.getAttendanceData(params);
      
      set((state) => ({
        attendanceData: data.data,
        pagination: {
          ...state.pagination,
          attendance: {
            page: params.page || 1,
            limit: params.take || 50,
            total: data.total || 0
          }
        }
      }));
      
      return data.data;
    } catch (error) {
      console.error('Error fetching attendance data:', error);
      setError('attendance', error.message || 'Failed to fetch attendance data');
      throw error;
    } finally {
      setLoading('attendance', false);
    }
  },

  fetchLeaveRequests: async (params = {}) => {
    const { setLoading, setError, clearError } = get();
    
    try {
      setLoading('attendance', true);
      clearError('attendance');
      
      const data = await reportsApi.getLeaveRequests(params);
      
      set({ leaveRequests: data.data || [] });
      
      return data.data;
    } catch (error) {
      console.error('Error fetching leave requests:', error);
      setError('attendance', error.message || 'Failed to fetch leave requests');
      throw error;
    } finally {
      setLoading('attendance', false);
    }
  },

  // Employee Reports
  fetchEmployeeData: async (params = {}) => {
    const { setLoading, setError, clearError } = get();
    
    try {
      setLoading('employee', true);
      clearError('employee');
      
      const data = await reportsApi.getEmployeeData(params);
      
      set((state) => ({
        employeeData: data.data || [],
        pagination: {
          ...state.pagination,
          employee: {
            page: params.page || 1,
            limit: params.take || 50,
            total: data.total || 0
          }
        }
      }));
      
      return data.data;
    } catch (error) {
      console.error('Error fetching employee data:', error);
      setError('employee', error.message || 'Failed to fetch employee data');
      throw error;
    } finally {
      setLoading('employee', false);
    }
  },

  fetchDepartments: async () => {
    const { setLoading, setError, clearError } = get();
    
    try {
      setLoading('employee', true);
      clearError('employee');
      
      const data = await reportsApi.getDepartments();
      
      set({ departments: data.data || [] });
      
      return data.data;
    } catch (error) {
      console.error('Error fetching departments:', error);
      setError('employee', error.message || 'Failed to fetch departments');
      throw error;
    } finally {
      setLoading('employee', false);
    }
  },

  fetchSkillAnalytics: async () => {
    const { setLoading, setError, clearError } = get();
    
    try {
      setLoading('skills', true);
      clearError('skills');
      
      const data = await reportsApi.getSkillAnalytics();
      
      set({ skillAnalytics: data.data });
      
      return data.data;
    } catch (error) {
      console.error('Error fetching skill analytics:', error);
      setError('skills', error.message || 'Failed to fetch skill analytics');
      throw error;
    } finally {
      setLoading('skills', false);
    }
  },

  fetchCareerProgressionAnalytics: async (params = {}) => {
    const { setLoading, setError, clearError } = get();
    
    try {
      setLoading('career', true);
      clearError('career');
      
      const data = await reportsApi.getCareerProgressionAnalytics(params);
      
      set({ careerProgressionAnalytics: data.data });
      
      return data.data;
    } catch (error) {
      console.error('Error fetching career progression analytics:', error);
      setError('career', error.message || 'Failed to fetch career progression analytics');
      throw error;
    } finally {
      setLoading('career', false);
    }
  },

  fetchOrganizationalChart: async () => {
    const { setLoading, setError, clearError } = get();
    
    try {
      setLoading('employee', true);
      clearError('employee');
      
      const data = await reportsApi.getOrganizationalChart();
      
      set({ organizationalChart: data.data });
      
      return data.data;
    } catch (error) {
      console.error('Error fetching organizational chart:', error);
      setError('employee', error.message || 'Failed to fetch organizational chart');
      throw error;
    } finally {
      setLoading('employee', false);
    }
  },

  // Recruitment Reports
  fetchRecruitmentData: async (params = {}) => {
    const { setLoading, setError, clearError } = get();
    
    try {
      setLoading('recruitment', true);
      clearError('recruitment');
      
      const [jobPostings, candidates, interviews, kpis] = await Promise.all([
        reportsApi.getJobPostings(params),
        reportsApi.getCandidates(params),
        reportsApi.getInterviews(params),
        reportsApi.getRecruitmentKpis(params)
      ]);
      
      set((state) => ({
        recruitmentData: {
          jobPostings: jobPostings.data || [],
          candidates: candidates.data || [],
          interviews: interviews.data || [],
          kpis: kpis.data
        },
        pagination: {
          ...state.pagination,
          recruitment: {
            page: params.page || 1,
            limit: params.take || 50,
            total: (jobPostings.data || []).length
          }
        }
      }));
      
      return {
        jobPostings: jobPostings.data,
        candidates: candidates.data,
        interviews: interviews.data,
        kpis: kpis.data
      };
    } catch (error) {
      console.error('Error fetching recruitment data:', error);
      setError('recruitment', error.message || 'Failed to fetch recruitment data');
      throw error;
    } finally {
      setLoading('recruitment', false);
    }
  },

  fetchRecruitmentKpis: async (params = {}) => {
    const { setLoading, setError, clearError } = get();
    
    try {
      setLoading('recruitment', true);
      clearError('recruitment');
      
      const data = await reportsApi.getRecruitmentKpis(params);
      
      set((state) => ({
        recruitmentData: {
          ...state.recruitmentData,
          kpis: data.data
        }
      }));
      
      return data.data;
    } catch (error) {
      console.error('Error fetching recruitment KPIs:', error);
      setError('recruitment', error.message || 'Failed to fetch recruitment KPIs');
      throw error;
    } finally {
      setLoading('recruitment', false);
    }
  },

  // Export Functions
  exportReport: async (type, params = {}) => {
    try {
      const data = await reportsApi.generateReport(type, params);
      return data;
    } catch (error) {
      console.error(`Error exporting ${type} report:`, error);
      throw error;
    }
  },

  // Utility Functions
  refreshAllData: async () => {
    const { fetchAttendanceSummary, fetchEmployeeData, fetchRecruitmentData } = get();
    
    try {
      await Promise.all([
        fetchAttendanceSummary(),
        fetchEmployeeData(),
        fetchRecruitmentData()
      ]);
    } catch (error) {
      console.error('Error refreshing all data:', error);
      throw error;
    }
  },

  clearAllData: () => set({
    attendanceData: null,
    attendanceSummary: null,
    absenceAnalytics: null,
    leaveRequests: [],
    employeeData: [],
    departments: [],
    skillAnalytics: null,
    careerProgressionAnalytics: null,
    organizationalChart: null,
    recruitmentData: {
      jobPostings: [],
      candidates: [],
      interviews: [],
      kpis: null
    },
    errors: {
      attendance: null,
      employee: null,
      recruitment: null,
      skills: null,
      career: null,
      absence: null
    }
  })
}));

export default useReportsStore;
