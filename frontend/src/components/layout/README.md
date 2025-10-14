# Layout System Documentation

## Overview

The layout system has been refactored into a modular, maintainable architecture that provides consistent UI components and layout management across the HR System application.

## Architecture

### Core Components

1. **DashboardLayout** - Main dashboard layout with sidebar and header
2. **AuthLayout** - Authentication pages layout
3. **LayoutComponents** - Reusable UI components
4. **LayoutContext** - Global layout state management
5. **Breadcrumb** - Navigation breadcrumb system
6. **NotificationSystem** - Toast and notification management

## File Structure

```
src/components/layout/
├── DashboardLayout.jsx      # Main dashboard layout
├── AuthLayout.jsx          # Authentication layout
├── LayoutComponents.jsx   # Reusable UI components
├── LayoutContext.jsx       # Layout state management
├── Breadcrumb.jsx          # Breadcrumb navigation
├── NotificationSystem.jsx # Notification components
└── index.js               # Export all components
```

## Components

### DashboardLayout

The main dashboard layout component that provides:
- Responsive sidebar navigation
- Header with search and user menu
- Mobile-friendly overlay
- Permission-based navigation filtering

**Key Features:**
- Modular component architecture
- Responsive design with mobile-first approach
- Smooth animations with Framer Motion
- Permission-based access control
- Context-aware state management

### LayoutComponents

A collection of reusable UI components:

#### PageHeader
```jsx
<PageHeader 
  title="Employee Management"
  subtitle="Manage your team members"
  actions={<Button>Add Employee</Button>}
/>
```

#### Card
```jsx
<Card className="mb-6">
  <h3>Employee Details</h3>
  <p>Employee information goes here</p>
</Card>
```

#### StatsCard
```jsx
<StatsCard
  title="Total Employees"
  value="156"
  change="+12%"
  icon={Users}
  color="primary"
/>
```

#### LoadingSpinner
```jsx
<LoadingSpinner size="lg" className="mt-8" />
```

#### EmptyState
```jsx
<EmptyState
  icon={Users}
  title="No employees found"
  description="Get started by adding your first employee"
  action={<Button>Add Employee</Button>}
/>
```

#### Grid
```jsx
<Grid cols={3} gap="gap-4">
  <Card>Item 1</Card>
  <Card>Item 2</Card>
  <Card>Item 3</Card>
</Grid>
```

### LayoutContext

Global layout state management using React Context:

```jsx
const {
  sidebarOpen,
  setSidebarOpen,
  toggleSidebar,
  userMenuOpen,
  setUserMenuOpen,
  toggleUserMenu,
  notifications,
  addNotification,
  breadcrumbs,
  setBreadcrumbs,
  pageTitle,
  setPageTitle,
  loading,
  setLoading,
} = useLayout();
```

**Features:**
- Responsive sidebar behavior
- Global notification management
- Breadcrumb state
- Page title management
- Loading states

### Breadcrumb

Navigation breadcrumb system:

```jsx
<Breadcrumb 
  items={[
    { href: '/dashboard', label: 'Dashboard' },
    { href: '/employees', label: 'Employees' },
    { label: 'John Doe' }
  ]}
/>
```

**Features:**
- Auto-generation from routes
- Custom breadcrumb items
- Home button integration
- Responsive design

### NotificationSystem

Comprehensive notification management:

```jsx
const { notifications, addNotification } = useNotifications();

// Add notification
addNotification({
  type: 'success',
  title: 'Employee Added',
  message: 'John Doe has been successfully added to the system.',
  autoClose: true,
  duration: 5000
});
```

**Components:**
- `NotificationContainer` - Toast notifications
- `NotificationBell` - Notification indicator
- `NotificationDropdown` - Notification list
- `useNotifications` - Hook for notification management

## Usage Examples

### Basic Page Layout

```jsx
import { 
  PageContainer, 
  PageHeader, 
  Card, 
  Grid,
  StatsCard 
} from '../components/layout';

const EmployeeDashboard = () => {
  return (
    <PageContainer>
      <PageHeader
        title="Employee Dashboard"
        subtitle="Overview of your team"
        actions={<Button>Add Employee</Button>}
      />
      
      <Grid cols={4} gap="gap-6">
        <StatsCard
          title="Total Employees"
          value="156"
          change="+12%"
          icon={Users}
          color="primary"
        />
        <StatsCard
          title="Active Projects"
          value="23"
          change="+5%"
          icon={Briefcase}
          color="success"
        />
        <StatsCard
          title="Pending Reviews"
          value="8"
          change="-2%"
          icon={Calendar}
          color="warning"
        />
        <StatsCard
          title="Open Positions"
          value="12"
          change="+3%"
          icon={AlertCircle}
          color="error"
        />
      </Grid>
      
      <Card className="mt-6">
        <h3>Recent Activity</h3>
        {/* Activity content */}
      </Card>
    </PageContainer>
  );
};
```

### Using Layout Context

```jsx
import { useLayout } from '../components/layout';

const MyComponent = () => {
  const { 
    sidebarOpen, 
    toggleSidebar, 
    addNotification,
    setPageTitle 
  } = useLayout();

  useEffect(() => {
    setPageTitle('Employee Management');
  }, []);

  const handleSuccess = () => {
    addNotification({
      type: 'success',
      title: 'Success!',
      message: 'Operation completed successfully.'
    });
  };

  return (
    <div>
      <button onClick={toggleSidebar}>
        Toggle Sidebar
      </button>
      <button onClick={handleSuccess}>
        Show Success Notification
      </button>
    </div>
  );
};
```

### Custom Breadcrumbs

```jsx
import { BreadcrumbWithTitle } from '../components/layout';

const EmployeeDetail = ({ employee }) => {
  const breadcrumbItems = [
    { href: '/dashboard', label: 'Dashboard' },
    { href: '/employees', label: 'Employees' },
    { label: employee.name }
  ];

  return (
    <BreadcrumbWithTitle
      title={employee.name}
      subtitle={`${employee.position} • ${employee.department}`}
      items={breadcrumbItems}
      actions={
        <div className="flex space-x-2">
          <Button variant="outline">Edit</Button>
          <Button variant="primary">Export</Button>
        </div>
      }
    />
  );
};
```

## Best Practices

### Component Composition

1. **Use Layout Components**: Prefer layout components over custom styling
2. **Consistent Spacing**: Use the spacing system (`space-y-6`, `gap-4`, etc.)
3. **Responsive Design**: Always consider mobile-first approach
4. **Accessibility**: Include proper ARIA labels and keyboard navigation

### State Management

1. **Use Layout Context**: For global layout state
2. **Local State**: For component-specific state
3. **Notifications**: Use the notification system for user feedback
4. **Breadcrumbs**: Update breadcrumbs for better navigation

### Performance

1. **Lazy Loading**: Use dynamic imports for heavy components
2. **Memoization**: Memoize expensive calculations
3. **Animation**: Use Framer Motion for smooth transitions
4. **Bundle Size**: Import only needed components

## Migration Guide

### From Old Layout System

1. **Replace Custom Layouts**: Use `DashboardLayout` and `AuthLayout`
2. **Update Imports**: Import from `../components/layout`
3. **Use Context**: Replace local state with `useLayout` hook
4. **Component Updates**: Use new layout components

### Example Migration

**Before:**
```jsx
const MyPage = () => (
  <div className="p-6">
    <div className="bg-white rounded-lg p-6">
      <h1>Page Title</h1>
      <p>Content</p>
    </div>
  </div>
);
```

**After:**
```jsx
import { PageContainer, PageHeader, Card } from '../components/layout';

const MyPage = () => (
  <PageContainer>
    <PageHeader title="Page Title" />
    <Card>
      <p>Content</p>
    </Card>
  </PageContainer>
);
```

## Customization

### Theme Colors

The layout system uses Tailwind CSS with custom color palette:

```jsx
// Available color variants
const colors = {
  primary: 'primary-600',
  success: 'success-600', 
  warning: 'warning-600',
  error: 'error-600',
  secondary: 'secondary-600'
};
```

### Custom Components

Create custom components following the established patterns:

```jsx
const CustomCard = ({ children, variant = 'default' }) => {
  const variants = {
    default: 'bg-white',
    elevated: 'bg-white shadow-lg',
    outlined: 'bg-white border-2 border-gray-200'
  };

  return (
    <div className={`rounded-lg p-6 ${variants[variant]}`}>
      {children}
    </div>
  );
};
```

## Troubleshooting

### Common Issues

1. **Layout Context Error**: Ensure `LayoutProvider` wraps your app
2. **Missing Styles**: Check Tailwind CSS configuration
3. **Animation Issues**: Verify Framer Motion installation
4. **Responsive Problems**: Test on different screen sizes

### Debug Mode

Enable debug mode for layout issues:

```jsx
const { sidebarOpen, userMenuOpen } = useLayout();
console.log('Layout State:', { sidebarOpen, userMenuOpen });
```

## Future Enhancements

1. **Dark Mode**: Theme switching support
2. **Customizable Sidebar**: User preferences
3. **Advanced Animations**: More transition options
4. **Accessibility**: Enhanced screen reader support
5. **Performance**: Virtual scrolling for large lists

---

This layout system provides a solid foundation for building consistent, maintainable, and user-friendly interfaces in the HR System application.
