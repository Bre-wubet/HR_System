import { useEffect, useState } from 'react';
import { useAuthStore } from '@/features/auth/stores/auth.store.js';

export default function RolesPermissionsPage() {
  const fetchRolesPermissions = useAuthStore((s) => s.fetchRolesPermissions);
  const [data, setData] = useState(null);

  useEffect(() => {
    fetchRolesPermissions().then((res) => {
      if (res.success) setData(res.data);
    });
  }, [fetchRolesPermissions]);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Roles & Permissions</h1>
      <pre className="bg-gray-100 rounded p-4 overflow-auto text-sm">{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
}


