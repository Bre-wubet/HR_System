// Employee Detail Components
export { default as EmployeeDetail } from './EmployeeDetail';

// Employee Form Components
export { default as EmployeeForm } from './EmployeeForm';

// Sub-components
export { default as EmployeeDetailHeader } from './components/employeeComponents/employee/EmployeeDetailHeader';
export { default as TabNavigation } from './components/TabNavigation';
export { default as EmployeeOverview } from './components/employeeComponents/employee/EmployeeOverview';
export { default as EmployeeDocuments } from './components/employeeComponents/employee/EmployeeDocuments';

// Loading and Error States
export { 
  EmployeeDetailSkeleton, 
  TabContentSkeleton 
} from './components/LoadingSkeletons';
export { 
  ErrorBoundary, 
  EmptyState, 
  EmployeeNotFound 
} from './components/ErrorStates';

// Form Components
export * from './components/employeeComponents/forms';

// Custom Hooks
export { useEmployeeDetail } from './hooks/useEmployeeDetail';
export { useEmployeeForm } from './hooks/useEmployeeForm';

// Schemas
export { employeeSchema, defaultFormValues } from './schemas/employeeFormSchema';
