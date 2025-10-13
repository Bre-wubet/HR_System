import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import PublicLayout from '@/app/layouts/PublicLayout.jsx';
import DashboardLayout from '@/app/layouts/DashboardLayout.jsx';
import ProtectedRoute from '@/app/guards/ProtectedRoute.jsx';
import RequirePermission from '@/app/guards/RequirePermission.jsx';
import LoginPage from '@/features/auth/pages/LoginPage.jsx';
import ProfilePage from '@/features/auth/pages/ProfilePage.jsx';
import ChangePasswordPage from '@/features/auth/pages/ChangePasswordPage.jsx';
import RolesPermissionsPage from '@/features/auth/pages/RolesPermissionsPage.jsx';
import EmployeesPage from '@/features/employees/pages/EmployeesPage.jsx';
import EmployeeDetailPage from '@/features/employees/pages/EmployeeDetailPage.jsx';
import AttendancePage from '@/features/attendance/pages/AttendancePage.jsx';
import RecruitmentKpisPage from '@/features/recruitment/pages/RecruitmentKpisPage.jsx';

const router = createBrowserRouter([
  {
    element: <PublicLayout />,
    children: [
      { path: '/', element: <LoginPage /> },
      { path: '/login', element: <LoginPage /> },
    ],
  },
  {
    element: (
      <ProtectedRoute>
        <DashboardLayout />
      </ProtectedRoute>
    ),
    children: [
      { path: '/me', element: <ProfilePage /> },
      { path: '/me/change-password', element: <ChangePasswordPage /> },
      { path: '/me/roles-permissions', element: <RolesPermissionsPage /> },
      { path: '/employees', element: <RequirePermission perm="employee:read"><EmployeesPage /></RequirePermission> },
      { path: '/employees/:id', element: <RequirePermission perm="employee:read"><EmployeeDetailPage /></RequirePermission> },
      { path: '/attendance', element: <RequirePermission perm="attendance:read"><AttendancePage /></RequirePermission> },
      { path: '/recruitment/kpis', element: <RequirePermission perm="recruitment:read"><RecruitmentKpisPage /></RequirePermission> },
    ],
  },
]);

export default function AppRouter() {
  return <RouterProvider router={router} />;
}


