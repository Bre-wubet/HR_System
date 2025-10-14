import React from 'react';
import { Menu } from 'lucide-react';
import { cn } from '../../../lib/utils';
import SearchBar from './SearchBar';
import NotificationButton from './NotificationButton';
import UserMenu from './UserMenu';

/**
 * Header Component
 * Top navigation bar with search, notifications, and user menu
 */
const Header = ({ 
  onToggleSidebar, 
  user, 
  onLogout 
}) => {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-30">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Mobile menu button */}
        <button
          onClick={onToggleSidebar}
          className={cn(
            'lg:hidden p-2 rounded-lg',
            'text-gray-400 hover:text-gray-600 hover:bg-gray-100',
            'transition-colors duration-200'
          )}
          aria-label="Toggle sidebar"
        >
          <Menu className="h-6 w-6" />
        </button>

        {/* Search Bar */}
        <SearchBar />

        {/* Right side actions */}
        <div className="flex items-center space-x-3">
          <NotificationButton />
          <UserMenu user={user} onLogout={onLogout} />
        </div>
      </div>
    </header>
  );
};

export default Header;
