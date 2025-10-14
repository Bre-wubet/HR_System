// Main Layout Components
export { default as DashboardLayout } from './DashboardLayout';
export { default as AuthLayout } from './AuthLayout';

// Layout Components
export * from './LayoutComponents';

// Layout Context
export { LayoutProvider, useLayout, LAYOUT_CONSTANTS, layoutUtils } from './LayoutContext';

// Breadcrumb Components
export { 
  default as Breadcrumb, 
  BreadcrumbWithTitle, 
  useBreadcrumb 
} from './Breadcrumb';

// Notification System
export { 
  NotificationContainer,
  NotificationBell,
  NotificationDropdown,
  useNotifications,
} from './NotificationSystem';

// Re-export commonly used components for convenience
export {
  PageHeader,
  Card,
  StatsCard,
  LoadingSpinner,
  EmptyState,
  SectionHeader,
  Badge,
  Divider,
  Grid,
  AnimatedContainer,
  ResponsiveContainer,
  PageContainer,
  ContentSection,
} from './LayoutComponents';
