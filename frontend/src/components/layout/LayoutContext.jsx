import React, { createContext, useContext, useState, useEffect } from 'react';

// Layout Context
const LayoutContext = createContext();

// Layout Provider Component
export const LayoutProvider = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [breadcrumbs, setBreadcrumbs] = useState([]);
  const [pageTitle, setPageTitle] = useState('');
  const [loading, setLoading] = useState(false);

  // Handle responsive sidebar behavior
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) { // lg breakpoint
        setSidebarOpen(true);
      } else {
        setSidebarOpen(false);
      }
    };

    // Set initial state
    handleResize();

    // Listen for resize events
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuOpen && !event.target.closest('[data-user-menu]')) {
        setUserMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [userMenuOpen]);

  const value = {
    // Sidebar state
    sidebarOpen,
    setSidebarOpen,
    toggleSidebar: () => setSidebarOpen(!sidebarOpen),
    
    // User menu state
    userMenuOpen,
    setUserMenuOpen,
    toggleUserMenu: () => setUserMenuOpen(!userMenuOpen),
    
    // Notifications
    notifications,
    setNotifications,
    addNotification: (notification) => {
      setNotifications(prev => [...prev, { ...notification, id: Date.now() }]);
    },
    removeNotification: (id) => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    },
    
    // Breadcrumbs
    breadcrumbs,
    setBreadcrumbs,
    
    // Page title
    pageTitle,
    setPageTitle,
    
    // Loading state
    loading,
    setLoading,
  };

  return (
    <LayoutContext.Provider value={value}>
      {children}
    </LayoutContext.Provider>
  );
};

// Custom hook to use layout context
export const useLayout = () => {
  const context = useContext(LayoutContext);
  if (!context) {
    throw new Error('useLayout must be used within a LayoutProvider');
  }
  return context;
};

// Layout constants
export const LAYOUT_CONSTANTS = {
  SIDEBAR_WIDTH: 256,
  HEADER_HEIGHT: 64,
  BREAKPOINTS: {
    sm: 640,
    md: 768,
    lg: 1024,
    xl: 1280,
    '2xl': 1536,
  },
};

// Layout utilities
export const layoutUtils = {
  // Get responsive class based on breakpoint
  getResponsiveClass: (base, sm, md, lg, xl) => {
    const classes = [base];
    if (sm) classes.push(`sm:${sm}`);
    if (md) classes.push(`md:${md}`);
    if (lg) classes.push(`lg:${lg}`);
    if (xl) classes.push(`xl:${xl}`);
    return classes.join(' ');
  },

  // Check if screen size matches breakpoint
  isBreakpoint: (breakpoint) => {
    const width = window.innerWidth;
    const breakpoints = LAYOUT_CONSTANTS.BREAKPOINTS;
    return width >= breakpoints[breakpoint];
  },

  // Get current breakpoint
  getCurrentBreakpoint: () => {
    const width = window.innerWidth;
    const breakpoints = LAYOUT_CONSTANTS.BREAKPOINTS;
    
    if (width >= breakpoints['2xl']) return '2xl';
    if (width >= breakpoints.xl) return 'xl';
    if (width >= breakpoints.lg) return 'lg';
    if (width >= breakpoints.md) return 'md';
    if (width >= breakpoints.sm) return 'sm';
    return 'xs';
  },
};

export default LayoutContext;
