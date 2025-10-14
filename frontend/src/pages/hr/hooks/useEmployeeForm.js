import { useState, useEffect, useCallback, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import useEmployeeStore from '../../../stores/useEmployeeStore';
import { employeeSchema, defaultFormValues } from '../schemas/employeeFormSchema';

/**
 * Custom hook for Employee Form logic and data management
 * Handles form state, validation, data fetching, and submission
 */
export const useEmployeeForm = (employeeId = null) => {
  const navigate = useNavigate();
  const isEdit = Boolean(employeeId);
  
  const {
    selectedEmployee,
    departments,
    managers,
    isLoading,
    error,
    fetchDepartments,
    fetchManagers,
    getEmployeeById,
    createEmployee,
    updateEmployee,
  } = useEmployeeStore();

  // Form state
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);
  const [lastSaved, setLastSaved] = useState(null);

  // React Hook Form setup
  const form = useForm({
    resolver: zodResolver(employeeSchema),
    defaultValues: defaultFormValues,
    mode: 'onChange', // Validate on change for better UX
  });

  const { register, handleSubmit, formState: { errors, isValid, isDirty }, setValue, watch, reset } = form;

  // Watch form values for auto-save
  const watchedValues = watch();

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      try {
        await Promise.all([
          fetchDepartments(),
          fetchManagers(),
        ]);

        if (isEdit && employeeId) {
          const result = await getEmployeeById(employeeId);
          if (result.success) {
            const employee = result.data;
            reset({
              firstName: employee.firstName || '',
              lastName: employee.lastName || '',
              email: employee.email || '',
              phone: employee.phone || '',
              gender: employee.gender || '',
              dob: employee.dob ? employee.dob.split('T')[0] : '',
              jobTitle: employee.jobTitle || '',
              jobType: employee.jobType || 'FULL_TIME',
              departmentId: employee.departmentId || '',
              managerId: employee.managerId || '',
              salary: employee.salary || '',
              status: employee.status || 'ACTIVE',
            });
          }
        }
      } catch (err) {
        console.error('Error loading form data:', err);
        setSubmitError('Failed to load form data');
      }
    };

    loadData();
  }, [employeeId, isEdit, fetchDepartments, fetchManagers, getEmployeeById, reset]);

  // Auto-save functionality
  useEffect(() => {
    if (!autoSaveEnabled || !isDirty || !isValid) return;

    const autoSaveTimer = setTimeout(async () => {
      try {
        const formData = processFormData(watchedValues);
        if (isEdit) {
          await updateEmployee(employeeId, formData);
        }
        setLastSaved(new Date());
      } catch (err) {
        console.warn('Auto-save failed:', err);
      }
    }, 2000); // Auto-save after 2 seconds of inactivity

    return () => clearTimeout(autoSaveTimer);
  }, [watchedValues, isDirty, isValid, autoSaveEnabled, isEdit, employeeId, updateEmployee]);

  // Process form data before submission
  const processFormData = useCallback((data) => {
    const processedData = { ...data };

    // Convert salary to number if provided
    if (processedData.salary) {
      processedData.salary = Number(processedData.salary);
    }

    // Convert empty strings to null for optional fields
    Object.keys(processedData).forEach(key => {
      if (processedData[key] === '') {
        processedData[key] = null;
      }
    });

    return processedData;
  }, []);

  // Handle form submission
  const onSubmit = useCallback(async (data) => {
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const processedData = processFormData(data);
      
      let result;
      if (isEdit) {
        result = await updateEmployee(employeeId, processedData);
      } else {
        result = await createEmployee(processedData);
      }

      if (result.success) {
        // Navigate to appropriate page
        if (isEdit) {
          navigate(`/employees/${employeeId}`);
        } else {
          navigate('/employees');
        }
      } else {
        setSubmitError(result.error || 'Failed to save employee');
      }
    } catch (err) {
      console.error('Form submission error:', err);
      setSubmitError('An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }, [isEdit, employeeId, processFormData, updateEmployee, createEmployee, navigate]);

  // Handle file upload
  const handleFileUpload = useCallback((newFiles) => {
    setUploadedFiles(prev => [...prev, ...newFiles]);
  }, []);

  // Handle file removal
  const handleRemoveFile = useCallback((fileId) => {
    setUploadedFiles(prev => prev.filter(file => file.id !== fileId));
  }, []);

  // Handle form reset
  const handleReset = useCallback(() => {
    reset(defaultFormValues);
    setUploadedFiles([]);
    setSubmitError(null);
  }, [reset]);

  // Handle cancel
  const handleCancel = useCallback(() => {
    if (isDirty && !window.confirm('You have unsaved changes. Are you sure you want to leave?')) {
      return;
    }
    navigate('/employees');
  }, [isDirty, navigate]);

  // Computed values
  const formState = useMemo(() => ({
    isEdit,
    isLoading,
    isSubmitting,
    isValid,
    isDirty,
    hasErrors: Object.keys(errors).length > 0,
    submitError,
    lastSaved,
    autoSaveEnabled,
  }), [
    isEdit,
    isLoading,
    isSubmitting,
    isValid,
    isDirty,
    errors,
    submitError,
    lastSaved,
    autoSaveEnabled,
  ]);

  const formData = useMemo(() => ({
    departments,
    managers,
    selectedEmployee,
    uploadedFiles,
  }), [departments, managers, selectedEmployee, uploadedFiles]);

  return {
    // Form methods
    register,
    handleSubmit: handleSubmit(onSubmit),
    errors,
    setValue,
    watch,
    reset: handleReset,
    
    // Form state
    formState,
    formData,
    
    // Actions
    onSubmit,
    handleFileUpload,
    handleRemoveFile,
    handleCancel,
    
    // Settings
    setAutoSaveEnabled,
    
    // Store methods (for direct access if needed)
    createEmployee,
    updateEmployee,
    getEmployeeById,
  };
};
