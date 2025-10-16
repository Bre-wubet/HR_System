import axiosClient from './axiosClient';

/**
 * Reports API Client
 * Handles all reporting and analytics API calls
 */
export const reportsApi = {
  // Attendance Reports
  async getAttendanceSummary(params = {}) {
    const response = await axiosClient.get('/hr/attendance/analytics/summary', { params });
    return response.data;
  },

  async getAbsenceAnalytics(params = {}) {
    const response = await axiosClient.get('/hr/attendance/analytics/absence', { params });
    return response.data;
  },

  async getAttendanceData(params = {}) {
    const response = await axiosClient.get('/hr/attendance', { params });
    return response.data;
  },

  async getLeaveRequests(params = {}) {
    const response = await axiosClient.get('/hr/attendance/leave', { params });
    return response.data;
  },

  // Employee Reports
  async getEmployeeData(params = {}) {
    const response = await axiosClient.get('/hr/employees', { params });
    return response.data;
  },

  async getDepartments() {
    const response = await axiosClient.get('/hr/employees/departments');
    return response.data;
  },

  async getSkillAnalytics() {
    const response = await axiosClient.get('/hr/employees/skills/analytics');
    return response.data;
  },

  async getCareerProgressionAnalytics(params = {}) {
    const response = await axiosClient.get('/hr/employees/career-progressions/analytics', { params });
    return response.data;
  },

  async getOrganizationalChart() {
    const response = await axiosClient.get('/hr/employees/org-chart');
    return response.data;
  },

  // Recruitment Reports
  async getJobPostings(params = {}) {
    const response = await axiosClient.get('/hr/recruitment/jobs', { params });
    return response.data;
  },

  async getCandidates(params = {}) {
    const response = await axiosClient.get('/hr/recruitment/candidates', { params });
    return response.data;
  },

  async getRecruitmentKpis(params = {}) {
    const response = await axiosClient.get('/hr/recruitment/kpis', { params });
    return response.data;
  },

  async getInterviews(params = {}) {
    const response = await axiosClient.get('/hr/recruitment/interviews', { params });
    return response.data;
  },

  // Export Functions
  async exportAttendanceReport(params = {}) {
    const response = await axiosClient.get('/hr/attendance/analytics/summary', { 
      params,
      responseType: 'blob' // For file downloads
    });
    return response.data;
  },

  async exportEmployeeReport(params = {}) {
    const response = await axiosClient.get('/hr/employees', { 
      params,
      responseType: 'blob' // For file downloads
    });
    return response.data;
  },

  async exportRecruitmentReport(params = {}) {
    const response = await axiosClient.get('/hr/recruitment/kpis', { 
      params,
      responseType: 'blob' // For file downloads
    });
    return response.data;
  },

  // Utility Functions
  async generateReport(type, params = {}) {
    const endpoints = {
      // Attendance reports
      attendance: '/hr/attendance/analytics/summary',
      summary: '/hr/attendance/analytics/summary',
      absence: '/hr/attendance/analytics/absence',
      leave: '/hr/attendance/leave',
      
      // Employee reports
      employee: '/hr/employees',
      skills: '/hr/employees/skills/analytics',
      career: '/hr/employees/career-progressions/analytics',
      'org-chart': '/hr/employees/org-chart',
      
      // Recruitment reports
      recruitment: '/hr/recruitment/kpis',
      jobs: '/hr/recruitment/jobs',
      candidates: '/hr/recruitment/candidates',
      interviews: '/hr/recruitment/interviews',
      kpis: '/hr/recruitment/kpis'
    };

    const endpoint = endpoints[type];
    if (!endpoint) {
      throw new Error(`Unknown report type: ${type}`);
    }

    const response = await axiosClient.get(endpoint, { params });
    return response.data;
  }
};

export default reportsApi;
