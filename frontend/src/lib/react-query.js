import { QueryClient } from '@tanstack/react-query';
// import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

// Create a client
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      retry: (failureCount, error) => {
        // Don't retry on 4xx errors
        if (error?.response?.status >= 400 && error?.response?.status < 500) {
          return false;
        }
        // Retry up to 3 times for other errors
        return failureCount < 3;
      },
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
    },
    mutations: {
      retry: false,
    },
  },
});

// Query keys factory for consistent key management
export const queryKeys = {
  // Auth
  auth: {
    profile: ['auth', 'profile'],
    permissions: ['auth', 'permissions'],
    roles: ['auth', 'roles'],
  },
  
  // Employees
  employees: {
    all: ['employees'],
    list: (params) => ['employees', 'list', params],
    detail: (id) => ['employees', 'detail', id],
    skills: (id) => ['employees', id, 'skills'],
    certifications: (id) => ['employees', id, 'certifications'],
    documents: (id) => ['employees', id, 'documents'],
    evaluations: (id) => ['employees', id, 'evaluations'],
    careerHistory: (id) => ['employees', id, 'career-history'],
    orgChart: (rootId, depth) => ['employees', 'org-chart', rootId, depth],
    directory: (search) => ['employees', 'directory', search],
  },
  
  // Departments
  departments: {
    all: ['departments'],
    list: ['departments', 'list'],
  },
  
  // Skills
  skills: {
    all: ['skills'],
    list: ['skills', 'list'],
    categories: ['skills', 'categories'],
    analytics: ['skills', 'analytics'],
    recommendations: (employeeId) => ['skills', 'recommendations', employeeId],
    gapAnalysis: (employeeId, jobPostingId) => ['skills', 'gap-analysis', employeeId, jobPostingId],
  },
  
  // Recruitment
  recruitment: {
    jobPostings: {
      all: ['recruitment', 'job-postings'],
      list: (params) => ['recruitment', 'job-postings', 'list', params],
      detail: (id) => ['recruitment', 'job-postings', 'detail', id],
    },
    candidates: {
      list: (jobId) => ['recruitment', 'candidates', 'list', jobId],
      detail: (id) => ['recruitment', 'candidates', 'detail', id],
      interviews: (candidateId) => ['recruitment', 'candidates', candidateId, 'interviews'],
    },
    interviews: {
      list: ['recruitment', 'interviews'],
      detail: (id) => ['recruitment', 'interviews', 'detail', id],
    },
    kpis: ['recruitment', 'kpis'],
  },
  
  // Attendance
  attendance: {
    list: (params) => ['attendance', 'list', params],
    employee: (employeeId, params) => ['attendance', 'employee', employeeId, params],
    summary: (params) => ['attendance', 'summary', params],
    analytics: (params) => ['attendance', 'analytics', params],
    leaveRequests: (params) => ['attendance', 'leave-requests', params],
  },
  
  // Career Progression
  careerProgression: {
    pending: ['career-progression', 'pending'],
    analytics: ['career-progression', 'analytics'],
  },
};

// Export React Query Devtools
// export { ReactQueryDevtools };
