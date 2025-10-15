import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';

import useAuthStore from '../stores/useAuthStore';
import apiClient from '../api/axiosClient';

// Layout Components
import AuthLayout from '../components/layout/AuthLayout';
import DashboardLayout from '../components/layout/DashboardLayout';

// Auth Pages
import Login from '../pages/auth/Login';
import Register from '../pages/auth/Register';
import ForgotPassword from '../pages/auth/ForgotPassword';

// Dashboard Pages
import HRDashboard from '../pages/dashboard/HRDashboard';

// HR Pages
import EmployeeList from '../pages/hr/EmployeeList';
import EmployeeDetail from '../pages/hr/EmployeeDetail';
import EmployeeForm from '../pages/hr/EmployeeForm';
import Attendance from '../pages/hr/Attendance';
import LeaveRequests from '../pages/hr/LeaveRequests';
import RecruitmentList from '../pages/hr/RecruitmentList';
import RecruitmentDetail from '../pages/hr/RecruitmentDetail';
import JobCandidatesView from '../pages/hr/JobCandidatesView';
import CandidateSection from '../pages/hr/components/CandidatesSection';

// Analytics Pages
import EmployeeAnalytics from '../pages/analytics/EmployeeAnalytics';
import AttendanceAnalytics from '../pages/analytics/AttendanceAnalytics';
import RecruitmentAnalytics from '../pages/analytics/RecruitmentAnalytics';

// Reports Pages
import EmployeeReports from '../pages/reports/EmployeeReports';
import AttendanceReports from '../pages/reports/AttendanceReports';
import RecruitmentReports from '../pages/reports/RecruitmentReports';

// Admin Pages
import UserManagement from '../pages/admin/UserManagement';
import RolePermissions from '../pages/admin/RolePermissions';
import SystemSettings from '../pages/admin/SystemSettings';

// Loading Component
const LoadingSpinner = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
  </div>
);

// Protected Route Component
const ProtectedRoute = ({ children, requiredPermissions = [], requiredRoles = [] }) => {
  const { isAuthenticated, user, permissions, roles } = useAuthStore();

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  // Check permissions
  if (requiredPermissions.length > 0) {
    const hasPermission = requiredPermissions.some(permission => 
      permissions.includes(permission)
    );
    if (!hasPermission) {
      return <Navigate to="/dashboard" replace />;
    }
  }

  // Check roles
  if (requiredRoles.length > 0) {
    const hasRole = requiredRoles.some(role => roles.includes(role));
    if (!hasRole) {
      return <Navigate to="/dashboard" replace />;
    }
  }

  return children;
};

// Public Route Component (redirect if authenticated)
const PublicRoute = ({ children }) => {
  const { isAuthenticated } = useAuthStore();
  
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return children;
};

function AppRoutes() {
  const { isAuthenticated, user } = useAuthStore();

  // Fetch user profile if authenticated but user data is missing
  const { isLoading: isLoadingProfile } = useQuery({
    queryKey: ['auth', 'profile'],
    queryFn: async () => {
      const response = await apiClient.get('/auth/profile');
      return response.data.data;
    },
    enabled: isAuthenticated && !user,
    retry: false,
  });

  if (isAuthenticated && !user && isLoadingProfile) {
    return <LoadingSpinner />;
  }

  return (
    <Routes>
      {/* Public Routes */}
      <Route
        path="/login"
        element={
          <PublicRoute>
            <AuthLayout>
              <Login />
            </AuthLayout>
          </PublicRoute>
        }
      />
      <Route
        path="/register"
        element={
          <PublicRoute>
            <AuthLayout>
              <Register />
            </AuthLayout>
          </PublicRoute>
        }
      />
      <Route
        path="/forgot-password"
        element={
          <PublicRoute>
            <AuthLayout>
              <ForgotPassword />
            </AuthLayout>
          </PublicRoute>
        }
      />

      {/* Protected Routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <HRDashboard />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      {/* Employee Management Routes */}
      <Route
        path="/employees"
        element={
          <ProtectedRoute requiredPermissions={['employee:read']}>
            <DashboardLayout>
              <EmployeeList />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/employees/new"
        element={
          <ProtectedRoute requiredPermissions={['employee:create']}>
            <DashboardLayout>
              <EmployeeForm />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/employees/:id"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <EmployeeDetail />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/employees/:id/edit"
        element={
          <ProtectedRoute requiredPermissions={['employee:update']}>
            <DashboardLayout>
              <EmployeeForm />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      {/* Attendance Routes */}
      <Route
        path="/attendance"
        element={
          <ProtectedRoute requiredPermissions={['attendance:read']}>
            <DashboardLayout>
              <Attendance />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/attendance/leave"
        element={
          <ProtectedRoute requiredPermissions={['attendance:read']}>
            <DashboardLayout>
              <LeaveRequests />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      {/* Recruitment Routes */}
      <Route
        path="/recruitment"
        element={
          <ProtectedRoute requiredPermissions={['recruitment:read']}>
            <DashboardLayout>
              <RecruitmentList />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/recruitment/:id"
        element={
          <ProtectedRoute requiredPermissions={['recruitment:read']}>
            <DashboardLayout>
              <RecruitmentDetail />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/recruitment/:id/candidates"
        element={
          <ProtectedRoute requiredPermissions={['recruitment:read']}>
            <DashboardLayout>
              <JobCandidatesView />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/recruitment/candidates"
        element={
          <ProtectedRoute requiredPermissions={['recruitment:read']}>
            <DashboardLayout>
              <CandidateSection />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/recruitment/interviews"
        element={
          <ProtectedRoute requiredPermissions={['recruitment:read']}>
            <DashboardLayout>
              <div className="p-6">
                <h1 className="text-2xl font-bold text-gray-900 mb-4">Interview Management</h1>
                <p className="text-gray-600">Interview scheduling and management will be implemented here</p>
              </div>
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      {/* Analytics Routes */}
      <Route
        path="/analytics"
        element={
          <ProtectedRoute requiredPermissions={['employee:read']}>
            <DashboardLayout>
              <div className="p-6">
                <h1 className="text-2xl font-bold text-gray-900 mb-4">Analytics Dashboard</h1>
                <p className="text-gray-600">Choose an analytics category to view detailed insights</p>
              </div>
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/analytics/employees"
        element={
          <ProtectedRoute requiredPermissions={['employee:read']}>
            <DashboardLayout>
              <EmployeeAnalytics />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/analytics/attendance"
        element={
          <ProtectedRoute requiredPermissions={['attendance:read']}>
            <DashboardLayout>
              <AttendanceAnalytics />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/analytics/recruitment"
        element={
          <ProtectedRoute requiredPermissions={['recruitment:read']}>
            <DashboardLayout>
              <RecruitmentAnalytics />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      {/* Reports Routes */}
      <Route
        path="/reports"
        element={
          <ProtectedRoute requiredPermissions={['employee:read']}>
            <DashboardLayout>
              <div className="p-6">
                <h1 className="text-2xl font-bold text-gray-900 mb-4">Reports Dashboard</h1>
                <p className="text-gray-600">Choose a report category to generate and download reports</p>
              </div>
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/reports/employees"
        element={
          <ProtectedRoute requiredPermissions={['employee:read']}>
            <DashboardLayout>
              <EmployeeReports />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/reports/attendance"
        element={
          <ProtectedRoute requiredPermissions={['attendance:read']}>
            <DashboardLayout>
              <AttendanceReports />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/reports/recruitment"
        element={
          <ProtectedRoute requiredPermissions={['recruitment:read']}>
            <DashboardLayout>
              <RecruitmentReports />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      {/* Administration Routes */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute requiredPermissions={['admin:manage_users']}>
            <DashboardLayout>
              <div className="p-6">
                <h1 className="text-2xl font-bold text-gray-900 mb-4">Administration Dashboard</h1>
                <p className="text-gray-600">System administration and user management</p>
              </div>
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/users"
        element={
          <ProtectedRoute requiredPermissions={['admin:manage_users']}>
            <DashboardLayout>
              <UserManagement />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/roles"
        element={
          <ProtectedRoute requiredPermissions={['admin:manage_users']}>
            <DashboardLayout>
              <RolePermissions />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/settings"
        element={
          <ProtectedRoute requiredPermissions={['admin:manage_system']}>
            <DashboardLayout>
              <SystemSettings />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      {/* Default redirect */}
      <Route
        path="/"
        element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />}
      />

      {/* 404 Route */}
      <Route
        path="*"
        element={
          <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">404</h1>
              <p className="text-gray-600 mb-8">Page not found</p>
              <a
                href="/dashboard"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
              >
                Go to Dashboard
              </a>
            </div>
          </div>
        }
      />
    </Routes>
  );
}

export default AppRoutes;
