import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';
import { cn } from '../../lib/utils';

/**
 * Breadcrumb Component
 * Dynamic breadcrumb navigation based on current route
 */
const Breadcrumb = () => {
  const location = useLocation();
  
  // Generate breadcrumbs from pathname
  const generateBreadcrumbs = (pathname) => {
    const segments = pathname.split('/').filter(Boolean);
    const breadcrumbs = [
      { name: 'Dashboard', href: '/dashboard', icon: Home }
    ];

    let currentPath = '';
    segments.forEach((segment, index) => {
      currentPath += `/${segment}`;
      
      // Convert segment to readable name
      const name = segment
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
      
      breadcrumbs.push({
        name,
        href: currentPath,
        isLast: index === segments.length - 1
      });
    });

    return breadcrumbs;
  };

  const breadcrumbs = generateBreadcrumbs(location.pathname);

  // Don't show breadcrumb on dashboard page
  if (location.pathname === '/dashboard') {
    return null;
  }

  return (
    <nav className="bg-white border-b border-gray-200 px-4 sm:px-6 lg:px-8">
      <div className="flex items-center space-x-2 py-3">
        {breadcrumbs.map((breadcrumb, index) => (
          <React.Fragment key={breadcrumb.href}>
            {index > 0 && (
              <ChevronRight className="h-4 w-4 text-gray-400" />
            )}
            
            {breadcrumb.isLast ? (
              <span className="text-sm font-medium text-gray-900">
                {breadcrumb.name}
              </span>
            ) : (
              <Link
                to={breadcrumb.href}
                className={cn(
                  'flex items-center space-x-1 text-sm',
                  'text-gray-500 hover:text-gray-700',
                  'transition-colors duration-200'
                )}
              >
                {breadcrumb.icon && (
                  <breadcrumb.icon className="h-4 w-4" />
                )}
                <span>{breadcrumb.name}</span>
              </Link>
            )}
          </React.Fragment>
        ))}
      </div>
    </nav>
  );
};

export default Breadcrumb;