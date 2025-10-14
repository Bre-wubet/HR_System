import React from 'react';
import { Link } from 'react-router-dom';
import { X } from 'lucide-react';
import { cn } from '../../../lib/utils';

/**
 * Sidebar Logo Component
 * Displays the HR System branding and close button for mobile
 */
const SidebarLogo = ({ onClose }) => (
  <div className="flex h-16 items-center justify-between px-6 border-b border-gray-200">
    <Link 
      to="/dashboard" 
      className="flex items-center space-x-3 group"
      onClick={() => onClose?.()}
      aria-label="HR System - Go to Dashboard"
    >
      <div className="h-10 w-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow">
        <span className="text-white font-bold text-lg">HR</span>
      </div>
      <div className="flex flex-col">
        <span className="text-lg font-bold text-gray-900">HR System</span>
        <span className="text-xs text-gray-500">Management Portal</span>
      </div>
    </Link>
    
    <button
      onClick={onClose}
      className={cn(
        'lg:hidden p-2 rounded-lg',
        'text-gray-400 hover:text-gray-600 hover:bg-gray-100',
        'transition-colors duration-200',
        'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
      )}
      aria-label="Close sidebar"
      type="button"
    >
      <X className="h-5 w-5" />
    </button>
  </div>
);

export default SidebarLogo;
