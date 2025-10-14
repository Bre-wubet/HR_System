// Layout Components
export { default as DashboardLayout } from './DashboardLayout';
export { default as AuthLayout } from './AuthLayout';
export { default as MainContent } from './MainContent';
export { default as Breadcrumb } from './Breadcrumb';

// Sidebar Components
export { default as Sidebar } from './sidebar/Sidebar';
export { default as SidebarLogo } from './sidebar/SidebarLogo';
export { default as SidebarNavigation } from './sidebar/SidebarNavigation';
export { default as SidebarUserProfile } from './sidebar/SidebarUserProfile';

// Navbar Components
export { default as Header } from './navbar/Header';
export { default as SearchBar } from './navbar/SearchBar';
export { default as NotificationButton } from './navbar/NotificationButton';
export { default as UserMenu } from './navbar/UserMenu';

// Navigation Configuration
export { NAVIGATION_ITEMS, filterNavigationByPermissions } from './navigation/navigationConfig';

// Layout Context
export { LayoutProvider, useLayout, LAYOUT_CONSTANTS, layoutUtils } from './LayoutContext';

// Responsive Hooks
export { useResponsive, useSidebarResponsive } from './hooks/useResponsive';

// Performance Components
export { 
  withLazyLoading, 
  LazySidebar, 
  LazyHeader, 
  LazyMainContent, 
  performanceUtils 
} from './performance/LazyLoading';

// Accessibility Utilities
export { 
  useFocusTrap, 
  useAriaLive, 
  useKeyboardNavigation, 
  A11Y_CONSTANTS, 
  a11yUtils 
} from './accessibility/AccessibilityUtils';