import { Outlet, NavLink } from 'react-router-dom';

export default function DashboardLayout() {
  return (
    <div className="min-h-screen grid grid-cols-[240px_1fr]">
      <aside className="bg-gray-900 text-white p-4 space-y-2">
        <div className="text-lg font-semibold mb-4">HR System</div>
        <nav className="flex flex-col gap-1">
          <NavLink className={({ isActive }) => `px-3 py-2 rounded ${isActive ? 'bg-gray-700' : 'hover:bg-gray-800'}`} to="/employees">Employees</NavLink>
          <NavLink className={({ isActive }) => `px-3 py-2 rounded ${isActive ? 'bg-gray-700' : 'hover:bg-gray-800'}`} to="/attendance">Attendance</NavLink>
          <NavLink className={({ isActive }) => `px-3 py-2 rounded ${isActive ? 'bg-gray-700' : 'hover:bg-gray-800'}`} to="/recruitment/kpis">Recruitment KPIs</NavLink>
        </nav>
      </aside>
      <main className="p-6">
        <Outlet />
      </main>
    </div>
  );
}


