import { useState, useEffect, useCallback } from 'react';
import { useLayout } from '../LayoutContext';

/**
 * Custom hook for responsive behavior
 * Provides breakpoint detection and responsive utilities
 */
export const useResponsive = () => {
  const [breakpoint, setBreakpoint] = useState('lg');
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [isDesktop, setIsDesktop] = useState(true);

  const breakpoints = {
    sm: 640,
    md: 768,
    lg: 1024,
    xl: 1280,
    '2xl': 1536,
  };

  const updateBreakpoint = useCallback(() => {
    const width = window.innerWidth;
    
    if (width >= breakpoints['2xl']) {
      setBreakpoint('2xl');
      setIsMobile(false);
      setIsTablet(false);
      setIsDesktop(true);
    } else if (width >= breakpoints.xl) {
      setBreakpoint('xl');
      setIsMobile(false);
      setIsTablet(false);
      setIsDesktop(true);
    } else if (width >= breakpoints.lg) {
      setBreakpoint('lg');
      setIsMobile(false);
      setIsTablet(false);
      setIsDesktop(true);
    } else if (width >= breakpoints.md) {
      setBreakpoint('md');
      setIsMobile(false);
      setIsTablet(true);
      setIsDesktop(false);
    } else {
      setBreakpoint('sm');
      setIsMobile(true);
      setIsTablet(false);
      setIsDesktop(false);
    }
  }, []);

  useEffect(() => {
    updateBreakpoint();
    window.addEventListener('resize', updateBreakpoint);
    return () => window.removeEventListener('resize', updateBreakpoint);
  }, [updateBreakpoint]);

  return {
    breakpoint,
    isMobile,
    isTablet,
    isDesktop,
    breakpoints,
  };
};

/**
 * Hook for managing sidebar responsive behavior
 */
export const useSidebarResponsive = () => {
  const { isMobile, isTablet } = useResponsive();
  const { sidebarOpen, setSidebarOpen } = useLayout();

  // Auto-close sidebar on mobile when route changes
  useEffect(() => {
    if (isMobile && sidebarOpen) {
      setSidebarOpen(false);
    }
  }, [isMobile, sidebarOpen, setSidebarOpen]);

  // Auto-open sidebar on desktop
  useEffect(() => {
    if (!isMobile && !isTablet) {
      setSidebarOpen(true);
    }
  }, [isMobile, isTablet, setSidebarOpen]);

  return {
    shouldShowOverlay: isMobile || isTablet,
    shouldAutoClose: isMobile,
  };
};

export default useResponsive;
