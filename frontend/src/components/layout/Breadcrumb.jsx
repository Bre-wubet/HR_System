import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';
import { cn } from '../../lib/utils';

// Breadcrumb Item Component
const BreadcrumbItem = ({ 
  item, 
  isLast, 
  className = '' 
}) => {
  const content = (
    <span className={cn(
      'text-sm font-medium',
      isLast 
        ? 'text-gray-900' 
        : 'text-gray-500 hover:text-gray-700',
      className
    )}>
      {item.icon && <item.icon className="h-4 w-4 mr-1" />}
      {item.label}
    </span>
  );

  if (isLast || !item.href) {
    return content;
  }

  return (
    <Link to={item.href} className="hover:text-gray-700">
      {content}
    </Link>
  );
};

// Breadcrumb Component
export const Breadcrumb = ({ 
  items = [], 
  className = '',
  showHome = true,
  separator = <ChevronRight className="h-4 w-4 text-gray-400" />
}) => {
  const location = useLocation();
  
  // Auto-generate breadcrumbs from current route if no items provided
  const breadcrumbItems = items.length > 0 ? items : generateBreadcrumbsFromRoute(location.pathname);

  // Add home item if showHome is true and not already present
  const finalItems = showHome && breadcrumbItems[0]?.href !== '/' 
    ? [{ href: '/dashboard', label: 'Dashboard', icon: Home }, ...breadcrumbItems]
    : breadcrumbItems;

  if (finalItems.length === 0) return null;

  return (
    <nav className={cn('flex items-center space-x-1', className)} aria-label="Breadcrumb">
      <ol className="flex items-center space-x-1">
        {finalItems.map((item, index) => (
          <li key={index} className="flex items-center">
            {index > 0 && (
              <span className="mx-2">
                {separator}
              </span>
            )}
            <BreadcrumbItem 
              item={item} 
              isLast={index === finalItems.length - 1}
            />
          </li>
        ))}
      </ol>
    </nav>
  );
};

// Generate breadcrumbs from route path
const generateBreadcrumbsFromRoute = (pathname) => {
  const segments = pathname.split('/').filter(Boolean);
  const breadcrumbs = [];

  let currentPath = '';
  
  segments.forEach((segment, index) => {
    currentPath += `/${segment}`;
    
    // Convert segment to readable label
    const label = segment
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');

    breadcrumbs.push({
      href: currentPath,
      label: label,
      isLast: index === segments.length - 1
    });
  });

  return breadcrumbs;
};

// Breadcrumb with page title
export const BreadcrumbWithTitle = ({ 
  title, 
  subtitle,
  items = [], 
  actions,
  className = '' 
}) => (
  <div className={cn('mb-6', className)}>
    <Breadcrumb items={items} className="mb-2" />
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
        {subtitle && (
          <p className="text-gray-600 mt-1">{subtitle}</p>
        )}
      </div>
      {actions && (
        <div className="flex items-center space-x-3">
          {actions}
        </div>
      )}
    </div>
  </div>
);

// Dynamic breadcrumb hook
export const useBreadcrumb = (items) => {
  const location = useLocation();
  
  React.useEffect(() => {
    // Update document title based on breadcrumb
    if (items.length > 0) {
      const lastItem = items[items.length - 1];
      document.title = `${lastItem.label} - HR System`;
    }
  }, [items, location.pathname]);

  return items;
};

export default Breadcrumb;
