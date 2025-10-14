import React, { Suspense, lazy } from 'react';
import { motion } from 'framer-motion';

/**
 * Loading Spinner Component
 * Used as fallback for lazy-loaded components
 */
const LoadingSpinner = () => (
  <div className="flex items-center justify-center h-64">
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
      className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full"
    />
  </div>
);

/**
 * Lazy Loading Wrapper
 * Provides loading states for dynamically imported components
 */
export const withLazyLoading = (Component, fallback = <LoadingSpinner />) => {
  const LazyComponent = lazy(() => Promise.resolve({ default: Component }));
  
  return (props) => (
    <Suspense fallback={fallback}>
      <LazyComponent {...props} />
    </Suspense>
  );
};

/**
 * Lazy-loaded layout components
 * These components are loaded on-demand to improve initial bundle size
 */
export const LazySidebar = withLazyLoading(
  lazy(() => import('../sidebar/Sidebar')),
  <div className="w-64 bg-white border-r border-gray-200 flex items-center justify-center">
    <LoadingSpinner />
  </div>
);

export const LazyHeader = withLazyLoading(
  lazy(() => import('../navbar/Header')),
  <div className="h-16 bg-white border-b border-gray-200 flex items-center justify-center">
    <LoadingSpinner />
  </div>
);

export const LazyMainContent = withLazyLoading(
  lazy(() => import('../MainContent')),
  <div className="flex-1 flex items-center justify-center">
    <LoadingSpinner />
  </div>
);

/**
 * Performance optimization utilities
 */
export const performanceUtils = {
  // Debounce function calls
  debounce: (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  },

  // Throttle function calls
  throttle: (func, limit) => {
    let inThrottle;
    return function() {
      const args = arguments;
      const context = this;
      if (!inThrottle) {
        func.apply(context, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  },

  // Check if component should re-render
  shouldComponentUpdate: (prevProps, nextProps, keys) => {
    return keys.some(key => prevProps[key] !== nextProps[key]);
  },
};

export default withLazyLoading;
