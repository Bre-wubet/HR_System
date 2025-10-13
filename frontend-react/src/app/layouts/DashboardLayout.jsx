import { Outlet, NavLink } from 'react-router-dom';
import { useAuthStore } from '@/features/auth/stores/auth.store.js';

export default function DashboardLayout() {
  const user = useAuthStore((s) => s.user);
  const clearSession = useAuthStore((s) => s.clearSession);
  return (
    <div className="min-h-screen grid grid-cols-[240px_1fr]">
      <aside className="bg-gray-900 text-white p-4 space-y-2">
        <div className="text-lg font-semibold mb-1">HR System</div>
        <div className="text-xs text-gray-300 mb-3">{user?.email}</div>
        <nav className="flex flex-col gap-1">
          <NavLink className={({ isActive }) => `px-3 py-2 rounded ${isActive ? 'bg-gray-700' : 'hover:bg-gray-800'}`} to="/me">Profile</NavLink>
          <NavLink className={({ isActive }) => `px-3 py-2 rounded ${isActive ? 'bg-gray-700' : 'hover:bg-gray-800'}`} to="/me/change-password">Change Password</NavLink>
          <NavLink className={({ isActive }) => `px-3 py-2 rounded ${isActive ? 'bg-gray-700' : 'hover:bg-gray-800'}`} to="/me/roles-permissions">Roles & Permissions</NavLink>
          <NavLink className={({ isActive }) => `px-3 py-2 rounded ${isActive ? 'bg-gray-700' : 'hover:bg-gray-800'}`} to="/employees">Employees</NavLink>
          <NavLink className={({ isActive }) => `px-3 py-2 rounded ${isActive ? 'bg-gray-700' : 'hover:bg-gray-800'}`} to="/attendance">Attendance</NavLink>
          <NavLink className={({ isActive }) => `px-3 py-2 rounded ${isActive ? 'bg-gray-700' : 'hover:bg-gray-800'}`} to="/recruitment/kpis">Recruitment KPIs</NavLink>
        </nav>
        <button onClick={clearSession} className="mt-4 w-full bg-gray-700 hover:bg-gray-600 text-white rounded px-3 py-2 text-sm">Logout</button>
      </aside>
      <main className="p-6">
        <Outlet />
      </main>
    </div>
  );
}


