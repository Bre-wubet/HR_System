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
    removeEmployeeDocument,
    uploadEmployeeDocument,
    addEmployeeDocument,
    fetchEmployeeDocuments,
  } = useEmployeeStore();

  // Form state
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [existingFiles, setExistingFiles] = useState([]);
  const [removedFiles, setRemovedFiles] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);
  const [lastSaved, setLastSaved] = useState(null);
  const [fileUploadProgress, setFileUploadProgress] = useState({});
  const [lastSubmissionTime, setLastSubmissionTime] = useState(0);

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
              phone: employee.phoneNumber || '',
              gender: employee.gender || '',
              dob: employee.dateOfBirth ? employee.dateOfBirth.split('T')[0] : '',
              jobTitle: employee.jobTitle || '',
              jobType: employee.jobType || 'FULL_TIME',
              departmentId: employee.department?.id || '',
              managerId: employee.manager?.id || '',
              salary: employee.salary || '',
              status: employee.employmentStatus || 'ACTIVE',
            });
            
            // Load existing documents separately
            try {
              const documentsResult = await fetchEmployeeDocuments(employeeId);
              if (documentsResult.success) {
                const documents = documentsResult.data;
                setExistingFiles(documents.map(doc => ({
                  id: doc.id,
                  name: doc.name,
                  size: 0, // Size not stored in database
                  type: 'application/octet-stream', // Default type
                  url: doc.fileUrl,
                  uploadedAt: doc.uploadedAt,
                  isExisting: true
                })));
                console.log('Loaded existing documents:', documents);
              }
            } catch (docError) {
              console.error('Failed to load documents:', docError);
            }
          }
        }
      } catch (err) {
        console.error('Error loading form data:', err);
        setSubmitError('Failed to load form data');
      }
    };

    loadData();
  }, [employeeId, isEdit, fetchDepartments, fetchManagers, getEmployeeById, reset]);

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
    // Prevent rapid successive submissions
    const now = Date.now();
    if (now - lastSubmissionTime < 2000) {
      console.warn('Submission too soon, ignoring');
      return;
    }
    setLastSubmissionTime(now);

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const processedData = processFormData(data);
      
      // For now, submit without files to avoid the 500 error
      // Files will be handled separately in a future implementation
      let result;
      if (isEdit) {
        result = await updateEmployee(employeeId, processedData);
      } else {
        result = await createEmployee(processedData);
      }

      if (result.success) {
        // Handle file uploads separately if there are any
        if (uploadedFiles.length > 0 || removedFiles.length > 0) {
          try {
            await handleFileOperations(result.data.id || employeeId);
          } catch (fileError) {
            console.warn('File operations failed:', fileError);
            // Don't fail the entire operation for file issues
          }
        }

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
  }, [isEdit, employeeId, processFormData, updateEmployee, createEmployee, navigate, uploadedFiles, removedFiles, existingFiles, lastSubmissionTime]);

  // Handle file operations separately
  const handleFileOperations = useCallback(async (employeeId) => {
    console.log('Handling file operations for employee:', employeeId);
    console.log('Files to remove:', removedFiles);
    console.log('Files to upload:', uploadedFiles);

    // Remove files that were marked for deletion
    for (const fileId of removedFiles) {
      try {
        console.log('Removing file:', fileId);
        await removeEmployeeDocument(employeeId, fileId);
      } catch (error) {
        console.error('Failed to remove file:', error);
      }
    }

    // Upload new files
    for (const file of uploadedFiles) {
      try {
        console.log('Uploading file:', file.name);
        const formData = new FormData();
        formData.append('file', file.file);
        
        // Upload the file first to get the fileUrl
        const uploadResult = await uploadEmployeeDocument(employeeId, formData);
        
        if (uploadResult.success) {
          // Then add the document record with the fileUrl
          const documentData = {
            name: file.name,
            fileUrl: uploadResult.data.fileUrl
          };
          
          console.log('Adding document record:', documentData);
          await addEmployeeDocument(employeeId, documentData);
        }
      } catch (error) {
        console.error('Failed to upload file:', error);
      }
    }
  }, [removedFiles, uploadedFiles, removeEmployeeDocument, uploadEmployeeDocument, addEmployeeDocument]);

  // Handle file upload
  const handleFileUpload = useCallback((newFiles) => {
    setUploadedFiles(prev => [...prev, ...newFiles]);
  }, []);

  // Handle file removal
  const handleRemoveFile = useCallback((fileId) => {
    // Check if it's an existing file
    const existingFile = existingFiles.find(file => file.id === fileId || file.name === fileId);
    if (existingFile) {
      // Move to removed files list
      setRemovedFiles(prev => [...prev, existingFile.id || existingFile.name]);
      setExistingFiles(prev => prev.filter(file => file.id !== fileId && file.name !== fileId));
    } else {
      // Remove from uploaded files
      setUploadedFiles(prev => prev.filter(file => file.id !== fileId));
    }
  }, [existingFiles]);

  // Handle file preview
  const handlePreviewFile = useCallback((file) => {
    if (file.url) {
      // Existing file from server
      window.open(file.url, '_blank');
    } else if (file.file) {
      // New uploaded file
      const url = URL.createObjectURL(file.file);
      if (file.type?.includes('image')) {
        window.open(url, '_blank');
      } else {
        // For non-image files, try to download
        const a = document.createElement('a');
        a.href = url;
        a.download = file.name;
        a.click();
      }
      URL.revokeObjectURL(url);
    }
  }, []);

  // Handle file download
  const handleDownloadFile = useCallback((file) => {
    if (file.url) {
      // Existing file from server
      const a = document.createElement('a');
      a.href = file.url;
      a.download = file.name;
      a.click();
    } else if (file.file) {
      // New uploaded file
      const url = URL.createObjectURL(file.file);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.name;
      a.click();
      URL.revokeObjectURL(url);
    }
  }, []);

  // Handle form reset
  const handleReset = useCallback(() => {
    reset(defaultFormValues);
    setUploadedFiles([]);
    setExistingFiles([]);
    setRemovedFiles([]);
    setSubmitError(null);
  }, [reset]);

  // Handle cancel
  const handleCancel = useCallback(() => {
    if (isDirty && !window.confirm('You have unsaved changes. Are you sure you want to leave?')) {
      return;
    }
    // Clear any pending state
    setIsSubmitting(false);
    setSubmitError(null);
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
    existingFiles,
    removedFiles,
    fileUploadProgress,
  }), [departments, managers, selectedEmployee, uploadedFiles, existingFiles, removedFiles, fileUploadProgress]);

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
    handlePreviewFile,
    handleDownloadFile,
    handleCancel,
    
    // Settings
    setAutoSaveEnabled,
    
    // Store methods (for direct access if needed)
    createEmployee,
    updateEmployee,
    getEmployeeById,
  };
};
