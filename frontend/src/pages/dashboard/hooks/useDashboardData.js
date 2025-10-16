import React from 'react';
import { useQuery } from '@tanstack/react-query';
import apiClient from '../../../api/axiosClient';
import { queryKeys } from '../../../lib/react-query';
import useAuthStore from '../../../stores/useAuthStore';

/**
 * Custom hook for fetching dashboard data
 * Centralizes all dashboard-related API calls
 */
export const useDashboardData = () => {
  const { user, isAuthenticated } = useAuthStore();

  // Main dashboard data query
  const dashboardQuery = useQuery({
    queryKey: queryKeys.dashboard.overview,
    enabled: isAuthenticated && !!user,
    queryFn: async () => {
      try {
        const [employeesRes, attendanceRes, recruitmentRes] = await Promise.all([
          apiClient.get('/hr/employees?take=1000'), // Get all employees to count total
          apiClient.get('/hr/attendance/analytics/summary'),
          apiClient.get('/hr/recruitment/kpis'),
        ]);

        return {
          employees: {
            total: employeesRes.data.data?.length || 0,
            data: employeesRes.data.data || []
          },
          attendance: attendanceRes.data.data || { total: 0, present: 0, absent: 0, late: 0, onLeave: 0 },
          recruitment: recruitmentRes.data.data || { totals: { jobs: 0, candidates: 0, hired: 0 }, metrics: {} },
        };
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        // Return default values on error
        return {
          employees: { total: 0, data: [] },
          attendance: { total: 0, present: 0, absent: 0, late: 0, onLeave: 0 },
          recruitment: { totals: { jobs: 0, candidates: 0, hired: 0 }, metrics: {} },
        };
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 10 * 60 * 1000, // 10 minutes
  });

  // Recent activities query
  const activitiesQuery = useQuery({
    queryKey: queryKeys.dashboard.recentActivities,
    enabled: isAuthenticated && !!user,
    queryFn: async () => {
      try {
        // Fetch recent data from multiple sources
        const [recentEmployeesRes, recentAttendanceRes, recentJobPostingsRes] = await Promise.all([
          apiClient.get('/hr/employees?take=5&skip=0'), // Recent employees
          apiClient.get('/hr/attendance?take=5&skip=0'), // Recent attendance
          apiClient.get('/hr/recruitment/jobs?take=5&skip=0'), // Recent job postings
        ]);

        const activities = [];

        // Process recent employees
        if (recentEmployeesRes.data.data?.length > 0) {
          recentEmployeesRes.data.data.forEach(employee => {
            activities.push({
              id: `employee-${employee.id}`,
              type: 'hire',
              description: `${employee.firstName} ${employee.lastName} was hired as ${employee.jobTitle}`,
              date: employee.createdAt,
              meta: {
                department: employee.department?.name || 'Unknown',
                status: 'completed'
              }
            });
          });
        }

        // Process recent attendance
        if (recentAttendanceRes.data.data?.length > 0) {
          recentAttendanceRes.data.data.forEach(attendance => {
            if (attendance.status === 'LATE') {
              activities.push({
                id: `attendance-${attendance.id}`,
                type: 'attendance',
                description: `${attendance.employee?.firstName} ${attendance.employee?.lastName} checked in late`,
                date: attendance.date,
                meta: {
                  department: attendance.employee?.department?.name || 'Unknown',
                  status: 'pending'
                }
              });
            }
          });
        }

        // Process recent job postings
        if (recentJobPostingsRes.data.data?.length > 0) {
          recentJobPostingsRes.data.data.forEach(job => {
            activities.push({
              id: `job-${job.id}`,
              type: 'recruitment',
              description: `New job posting created: ${job.title}`,
              date: job.createdAt,
              meta: {
                department: job.department?.name || 'Unknown',
                status: 'active'
              }
            });
          });
        }

        // Note: Candidates are fetched per job, so we'll get hired candidates from job postings
        // This would require a separate endpoint to get all candidates across jobs

        // Sort by date and return most recent
        return activities
          .sort((a, b) => new Date(b.date) - new Date(a.date))
          .slice(0, 10);

      } catch (error) {
        console.error('Error fetching recent activities:', error);
        // Return empty array if there's an error
        return [];
      }
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  // Process stats data
  const processedStats = React.useMemo(() => {
    if (!dashboardQuery.data) return [];

    const { employees, attendance, recruitment } = dashboardQuery.data;

    // Calculate attendance percentage for today
    const attendancePercentage = attendance?.total > 0 
      ? Math.round((attendance.present / attendance.total) * 100)
      : 0;

    // Calculate previous period comparison (mock for now - would need historical data)
    const previousAttendancePercentage = Math.max(0, attendancePercentage - 5);

    return [
      {
        id: 'total-employees',
        title: 'Total Employees',
        value: employees?.total || 0,
        change: null, // Would need historical data to calculate
        icon: 'Users',
        color: 'primary',
        href: '/employees',
      },
      {
        id: 'present-today',
        title: 'Present Today',
        value: attendance?.present || 0,
        change: attendancePercentage - previousAttendancePercentage,
        icon: 'UserCheck',
        color: 'success',
        href: '/attendance',
      },
      {
        id: 'absent-today',
        title: 'Absent Today',
        value: attendance?.absent || 0,
        change: null, // Would need historical data
        icon: 'UserX',
        color: 'error',
        href: '/attendance',
      },
      {
        id: 'open-positions',
        title: 'Open Positions',
        value: recruitment?.totals?.jobs || 0,
        change: null, // Would need historical data
        icon: 'Briefcase',
        color: 'primary',
        href: '/recruitment',
      },
      {
        id: 'total-candidates',
        title: 'Total Candidates',
        value: recruitment?.totals?.candidates || 0,
        change: null, // Would need historical data
        icon: 'Users',
        color: 'info',
        href: '/recruitment',
      },
      {
        id: 'hired-this-period',
        title: 'Hired This Period',
        value: recruitment?.totals?.hired || 0,
        change: null, // Would need historical data
        icon: 'UserCheck',
        color: 'success',
        href: '/recruitment',
      },
    ];
  }, [dashboardQuery.data]);

  return {
    // Data
    dashboardData: dashboardQuery.data,
    recentActivities: activitiesQuery.data || [],
    stats: processedStats,
    
    // Loading states
    isLoadingDashboard: dashboardQuery.isLoading,
    isLoadingActivities: activitiesQuery.isLoading,
    isLoading: dashboardQuery.isLoading || activitiesQuery.isLoading,
    
    // Error states
    dashboardError: dashboardQuery.error,
    activitiesError: activitiesQuery.error,
    hasError: !!dashboardQuery.error || !!activitiesQuery.error,
    
    // Refetch functions
    refetchDashboard: dashboardQuery.refetch,
    refetchActivities: activitiesQuery.refetch,
    refetchAll: () => {
      dashboardQuery.refetch();
      activitiesQuery.refetch();
    },
    
    // Query states
    isFetching: dashboardQuery.isFetching || activitiesQuery.isFetching,
    isStale: dashboardQuery.isStale || activitiesQuery.isStale,
  };
};

export default useDashboardData;
