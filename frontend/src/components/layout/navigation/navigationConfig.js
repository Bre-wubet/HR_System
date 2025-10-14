import {
  Users,
  Calendar,
  Briefcase,
  BarChart3,
  Settings,
  FileText,
  Clock,
  UserCheck,
} from 'lucide-react';

/**
 * Navigation Configuration
 * Defines the main navigation items with permissions
 */
export const NAVIGATION_ITEMS = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: BarChart3,
    permission: null,
    description: 'Overview and analytics',
  },
  {
    name: 'Employees',
    href: '/employees',
    icon: Users,
    permission: 'employee:read',
    description: 'Manage team members',
  },
  {
    name: 'Attendance',
    href: '/attendance',
    icon: Calendar,
    permission: 'attendance:read',
    description: 'Track attendance',
  },
  {
    name: 'Recruitment',
    href: '/recruitment',
    icon: Briefcase,
    permission: 'recruitment:read',
    description: 'Hiring process',
  },
  {
    name: 'Leave Management',
    href: '/leave',
    icon: Clock,
    permission: 'leave:read',
    description: 'Manage leave requests',
  },
  {
    name: 'Performance',
    href: '/performance',
    icon: UserCheck,
    permission: 'performance:read',
    description: 'Performance reviews',
  },
  {
    name: 'Reports',
    href: '/reports',
    icon: FileText,
    permission: 'reports:read',
    description: 'Generate reports',
  },
  {
    name: 'Settings',
    href: '/settings',
    icon: Settings,
    permission: 'settings:read',
    description: 'System configuration',
  },
];

/**
 * Filter navigation items based on user permissions
 * @param {Array} permissions - User permissions array
 * @param {Object} user - User object
 * @returns {Array} Filtered navigation items
 */
export const filterNavigationByPermissions = (permissions = [], user = null) => {
  return NAVIGATION_ITEMS.filter(item => {
    // If no user or permissions not loaded, show all items
    if (!user || !permissions || permissions.length === 0) {
      return true;
    }
    
    // If item has no permission requirement, show it
    if (!item.permission) {
      return true;
    }
    
    // Otherwise filter by permissions
    return permissions.includes(item.permission);
  });
};

export default NAVIGATION_ITEMS;
