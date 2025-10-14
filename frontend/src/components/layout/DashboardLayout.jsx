import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users,
  Calendar,
  Briefcase,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
  Bell,
  Search,
  User,
  ChevronDown,
} from 'lucide-react';

import useAuthStore from '../../stores/useAuthStore';
import { useLayout } from './LayoutContext';
import { cn, getInitials } from '../../lib/utils';

// Navigation configuration
const NAVIGATION_ITEMS = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: BarChart3,
    permission: null,
  },
  {
    name: 'Employees',
    href: '/employees',
    icon: Users,
    permission: 'employee:read',
  },
  {
    name: 'Attendance',
    href: '/attendance',
    icon: Calendar,
    permission: 'attendance:read',
  },
  {
    name: 'Recruitment',
    href: '/recruitment',
    icon: Briefcase,
    permission: 'recruitment:read',
  },
];

// Sidebar Logo Component
const SidebarLogo = ({ onClose }) => (
  <div className="flex h-16 items-center justify-between px-6 border-b border-gray-200">
    <Link to="/dashboard" className="flex items-center space-x-2">
      <div className="h-8 w-8 bg-primary-600 rounded-lg flex items-center justify-center">
        <span className="text-white font-bold text-sm">HR</span>
      </div>
      <span className="text-xl font-bold text-gray-900">HR System</span>
    </Link>
    <button
      onClick={onClose}
      className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-600"
    >
      <X className="h-5 w-5" />
    </button>
  </div>
);

// Navigation Item Component
const NavigationItem = ({ item, isActive }) => (
  <Link
    to={item.href}
    className={cn(
      'flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors',
      isActive
        ? 'bg-primary-50 text-primary-700 border-r-2 border-primary-600'
        : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
    )}
  >
    <item.icon className="mr-3 h-5 w-5" />
    {item.name}
  </Link>
);

// Sidebar Navigation Component
const SidebarNavigation = ({ navigationItems, currentPath }) => (
  <nav className="flex-1 px-4 py-6 space-y-2">
    {navigationItems?.map((item) => {
      const isActive = currentPath === item.href;
      return (
        <NavigationItem
          key={item.name}
          item={item}
          isActive={isActive}
        />
      );
    })}
  </nav>
);

// User Profile Component
const UserProfile = ({ user }) => (
  <div className="border-t border-gray-200 p-4">
    <div className="flex items-center space-x-3">
      <div className="h-8 w-8 bg-primary-100 rounded-full flex items-center justify-center">
        <span className="text-sm font-medium text-primary-700">
          {getInitials(user?.firstName + ' ' + user?.lastName)}
        </span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 truncate">
          {user?.firstName} {user?.lastName}
        </p>
        <p className="text-xs text-gray-500 truncate">
          {user?.email}
        </p>
      </div>
    </div>
  </div>
);

// Search Bar Component
const SearchBar = () => (
  <div className="flex-1 max-w-lg mx-4">
    <div className="relative">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
      <input
        type="text"
        placeholder="Search employees, departments..."
        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
      />
    </div>
  </div>
);

// Notification Button Component
const NotificationButton = () => (
  <button className="p-2 text-gray-400 hover:text-gray-600 relative">
    <Bell className="h-5 w-5" />
    <span className="absolute -top-1 -right-1 h-3 w-3 bg-error-500 rounded-full"></span>
  </button>
);

// User Menu Component
const UserMenu = ({ user, isOpen, onToggle, onLogout }) => (
  <div className="relative">
    <button
      onClick={onToggle}
      className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100"
    >
      <div className="h-8 w-8 bg-primary-100 rounded-full flex items-center justify-center">
        <span className="text-sm font-medium text-primary-700">
          {getInitials(user?.firstName + ' ' + user?.lastName)}
        </span>
      </div>
      <ChevronDown className="h-4 w-4 text-gray-400" />
    </button>

    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-medium border border-gray-200 py-1 z-50"
        >
          <Link
            to="/profile"
            className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            onClick={() => onToggle(false)}
          >
            <User className="mr-3 h-4 w-4" />
            Profile
          </Link>
          <Link
            to="/settings"
            className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            onClick={() => onToggle(false)}
          >
            <Settings className="mr-3 h-4 w-4" />
            Settings
          </Link>
          <hr className="my-1" />
          <button
            onClick={() => {
              onToggle(false);
              onLogout();
            }}
            className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
          >
            <LogOut className="mr-3 h-4 w-4" />
            Sign out
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  </div>
);

// Mobile Sidebar Overlay Component
const MobileSidebarOverlay = ({ isOpen, onClose }) => (
  <AnimatePresence>
    {isOpen && (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-40 lg:hidden"
        onClick={onClose}
      >
        <div className="absolute inset-0 bg-gray-600 bg-opacity-75" />
      </motion.div>
    )}
  </AnimatePresence>
);

// Sidebar Component
const Sidebar = ({ isOpen, onClose, navigationItems, currentPath, user }) => (
  <motion.div
    initial={false}
    animate={{ width: isOpen ? '256px' : '0px' }}
    className="bg-white shadow-lg overflow-hidden lg:relative lg:flex-shrink-0"
  >
    <div className="w-64 h-full flex flex-col">
      <SidebarLogo onClose={onClose} />
      <SidebarNavigation 
        navigationItems={navigationItems} 
        currentPath={currentPath} 
      />
      <UserProfile user={user} />
    </div>
  </motion.div>
);

// Header Component
const Header = ({ 
  onToggleSidebar, 
  onToggleUserMenu, 
  userMenuOpen, 
  user, 
  onLogout 
}) => (
  <header className="bg-white shadow-sm border-b border-gray-200">
    <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
      {/* Mobile menu button */}
      <button
        onClick={onToggleSidebar}
        className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-600"
      >
        <Menu className="h-6 w-6" />
      </button>

      {/* Search */}
      <SearchBar />

      {/* Right side */}
      <div className="flex items-center space-x-4">
        <NotificationButton />
        <UserMenu 
          user={user}
          isOpen={userMenuOpen}
          onToggle={onToggleUserMenu}
          onLogout={onLogout}
        />
      </div>
    </div>
  </header>
);

// Main Content Component
const MainContent = ({ children }) => (
  <main className="flex-1">
    <div className="py-4 px-4 sm:px-6 lg:px-8">
      {children}
    </div>
  </main>
);

// Custom hook for sidebar behavior - now using layout context
const useSidebarBehavior = () => {
  const { sidebarOpen, setSidebarOpen } = useLayout();
  return { sidebarOpen, setSidebarOpen };
};

// Main DashboardLayout Component
const DashboardLayout = ({ children }) => {
  const { userMenuOpen, setUserMenuOpen, toggleUserMenu } = useLayout();
  const { user, logout, permissions = [] } = useAuthStore();
  const location = useLocation();
  const { sidebarOpen, setSidebarOpen } = useSidebarBehavior();

  // Filter navigation based on permissions
  // Show all items if permissions are not loaded or user is not authenticated
  const filteredNavigation = NAVIGATION_ITEMS.filter(item => {
    // If no user or permissions not loaded, show all items
    if (!user || !permissions || permissions.length === 0) {
      return true;
    }
    // Otherwise filter by permissions
    return !item.permission || permissions.includes(item.permission);
  });

  const handleLogout = async () => {
    await logout();
  };

  const handleToggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleToggleUserMenu = (close = null) => {
    if (close === false) {
      setUserMenuOpen(false);
    } else {
      toggleUserMenu();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        navigationItems={filteredNavigation}
        currentPath={location.pathname}
        user={user}
      />

      {/* Mobile sidebar overlay */}
      <MobileSidebarOverlay
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header
          onToggleSidebar={handleToggleSidebar}
          onToggleUserMenu={handleToggleUserMenu}
          userMenuOpen={userMenuOpen}
          user={user}
          onLogout={handleLogout}
        />
        <MainContent>{children}</MainContent>
      </div>
    </div>
  );
};

export default DashboardLayout;