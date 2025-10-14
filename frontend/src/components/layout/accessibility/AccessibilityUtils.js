import React, { useEffect, useRef } from 'react';

/**
 * Accessibility utilities and hooks
 * Provides ARIA labels, keyboard navigation, and focus management
 */

/**
 * Hook for managing focus trap
 * Keeps focus within a specific element (useful for modals, dropdowns)
 */
export const useFocusTrap = (isActive) => {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!isActive || !containerRef.current) return;

    const focusableElements = containerRef.current.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    const handleTabKey = (e) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          lastElement?.focus();
          e.preventDefault();
        }
      } else {
        if (document.activeElement === lastElement) {
          firstElement?.focus();
          e.preventDefault();
        }
      }
    };

    const handleEscapeKey = (e) => {
      if (e.key === 'Escape') {
        // Close the trap (this should be handled by parent component)
        containerRef.current?.dispatchEvent(new CustomEvent('close'));
      }
    };

    containerRef.current.addEventListener('keydown', handleTabKey);
    containerRef.current.addEventListener('keydown', handleEscapeKey);

    // Focus first element when trap becomes active
    firstElement?.focus();

    return () => {
      containerRef.current?.removeEventListener('keydown', handleTabKey);
      containerRef.current?.removeEventListener('keydown', handleEscapeKey);
    };
  }, [isActive]);

  return containerRef;
};

/**
 * Hook for managing ARIA live regions
 * Announces changes to screen readers
 */
export const useAriaLive = () => {
  const announce = (message, priority = 'polite') => {
    const liveRegion = document.getElementById('aria-live-region') || createLiveRegion();
    liveRegion.setAttribute('aria-live', priority);
    liveRegion.textContent = message;
    
    // Clear after announcement
    setTimeout(() => {
      liveRegion.textContent = '';
    }, 1000);
  };

  const createLiveRegion = () => {
    const liveRegion = document.createElement('div');
    liveRegion.id = 'aria-live-region';
    liveRegion.setAttribute('aria-live', 'polite');
    liveRegion.setAttribute('aria-atomic', 'true');
    liveRegion.className = 'sr-only';
    document.body.appendChild(liveRegion);
    return liveRegion;
  };

  return { announce };
};

/**
 * Hook for keyboard navigation
 * Provides arrow key navigation for lists and menus
 */
export const useKeyboardNavigation = (items, onSelect) => {
  const [focusedIndex, setFocusedIndex] = React.useState(-1);

  const handleKeyDown = (e) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setFocusedIndex(prev => 
          prev < items.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setFocusedIndex(prev => 
          prev > 0 ? prev - 1 : items.length - 1
        );
        break;
      case 'Enter':
      case ' ':
        e.preventDefault();
        if (focusedIndex >= 0 && items[focusedIndex]) {
          onSelect(items[focusedIndex], focusedIndex);
        }
        break;
      case 'Home':
        e.preventDefault();
        setFocusedIndex(0);
        break;
      case 'End':
        e.preventDefault();
        setFocusedIndex(items.length - 1);
        break;
    }
  };

  return {
    focusedIndex,
    setFocusedIndex,
    handleKeyDown,
  };
};

/**
 * Accessibility constants
 */
export const A11Y_CONSTANTS = {
  // ARIA roles
  ROLES: {
    NAVIGATION: 'navigation',
    MENU: 'menu',
    MENUITEM: 'menuitem',
    BUTTON: 'button',
    DIALOG: 'dialog',
    ALERT: 'alert',
    STATUS: 'status',
  },

  // ARIA labels
  LABELS: {
    CLOSE_SIDEBAR: 'Close sidebar',
    OPEN_SIDEBAR: 'Open sidebar',
    USER_MENU: 'User menu',
    NOTIFICATIONS: 'Notifications',
    SEARCH: 'Search',
    MAIN_NAVIGATION: 'Main navigation',
    BREADCRUMB: 'Breadcrumb navigation',
  },

  // Keyboard shortcuts
  SHORTCUTS: {
    TOGGLE_SIDEBAR: 'Ctrl+B',
    SEARCH: 'Ctrl+K',
    NOTIFICATIONS: 'Ctrl+N',
    USER_MENU: 'Ctrl+U',
  },
};

/**
 * Accessibility utilities
 */
export const a11yUtils = {
  // Generate unique IDs for ARIA relationships
  generateId: (prefix = 'a11y') => {
    return `${prefix}-${Math.random().toString(36).substr(2, 9)}`;
  },

  // Check if element is visible to screen readers
  isVisibleToScreenReader: (element) => {
    if (!element) return false;
    
    const style = window.getComputedStyle(element);
    return (
      style.display !== 'none' &&
      style.visibility !== 'hidden' &&
      element.getAttribute('aria-hidden') !== 'true'
    );
  },

  // Announce page changes to screen readers
  announcePageChange: (pageTitle) => {
    const { announce } = useAriaLive();
    announce(`Navigated to ${pageTitle}`);
  },

  // Get accessible color contrast ratio
  getContrastRatio: (color1, color2) => {
    // This is a simplified version - in production, use a proper contrast library
    const getLuminance = (color) => {
      const rgb = color.match(/\d+/g);
      if (!rgb) return 0;
      
      const [r, g, b] = rgb.map(c => {
        c = parseInt(c) / 255;
        return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
      });
      
      return 0.2126 * r + 0.7152 * g + 0.0722 * b;
    };

    const lum1 = getLuminance(color1);
    const lum2 = getLuminance(color2);
    
    const brightest = Math.max(lum1, lum2);
    const darkest = Math.min(lum1, lum2);
    
    return (brightest + 0.05) / (darkest + 0.05);
  },
};

export default {
  useFocusTrap,
  useAriaLive,
  useKeyboardNavigation,
  A11Y_CONSTANTS,
  a11yUtils,
};
