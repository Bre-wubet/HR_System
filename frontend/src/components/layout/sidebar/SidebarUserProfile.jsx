import React from 'react';
import { cn, getInitials } from '../../../lib/utils';

/**
 * Sidebar User Profile Component
 * Displays user information at the bottom of the sidebar
 */
const SidebarUserProfile = ({ user }) => {
  if (!user) return null;

  return (
    <div className="border-t border-gray-200 p-4">
      <div className="flex items-center space-x-3">
        <div className="h-10 w-10 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center ring-2 ring-blue-50">
          <span className="text-sm font-semibold text-blue-700">
            {getInitials(`${user.firstName} ${user.lastName}`)}
          </span>
        </div>
        
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-900 truncate">
            {user.firstName} {user.lastName}
          </p>
          <p className="text-xs text-gray-500 truncate">
            {user.email}
          </p>
          {user.role && (
            <p className="text-xs text-blue-600 font-medium truncate">
              {user.role}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default SidebarUserProfile;
