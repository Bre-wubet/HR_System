import React from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Save } from 'lucide-react';

// Custom hook for form logic
import { useEmployeeForm } from './hooks/useEmployeeForm';

// Modular form sections
import PersonalInfoSection from './components/employeeComponents/forms/PersonalInfoSection';
import EmploymentInfoSection from './components/employeeComponents/forms/EmploymentInfoSection';
import AdditionalInfoSection from './components/employeeComponents/forms/AdditionalInfoSection';
import DocumentsSection from './components/employeeComponents/forms/DocumentsSection';

// Form state components
import { 
  FormStatusBar, 
  FormErrorDisplay, 
  FormLoadingSkeleton 
} from './components/employeeComponents/forms/FormStates';

// UI Components
import { Button } from '../../components/ui/Button';

/**
 * Employee Form Component
 * Refactored modular form for creating and editing employees
 */
const EmployeeForm = () => {
  const { id } = useParams();

  const {
    register,
    handleSubmit,
    errors,
    watch,
    formState,
    formData,
    onSubmit,
    handleFileUpload,
    handleRemoveFile,
    handlePreviewFile,
    handleDownloadFile,
    handleCancel,
  } = useEmployeeForm(id);

  const { isEdit, isLoading, isSubmitting, submitError } = formState;
  const { departments, managers, selectedEmployee, uploadedFiles, existingFiles } = formData;

  // Show loading skeleton while data is being fetched
  if (isLoading) {
    return (
      <div className="space-y-6">
        <FormLoadingSkeleton sections={4} />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCancel}
            disabled={isSubmitting}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {isEdit ? 'Edit Employee' : 'Add New Employee'}
            </h1>
            <p className="text-gray-600">
              {isEdit ? 'Update employee information' : 'Create a new employee record'}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            loading={isSubmitting}
            disabled={isSubmitting}
          >
            <Save className="h-4 w-4 mr-2" />
            {isEdit ? 'Update Employee' : 'Create Employee'}
          </Button>
        </div>
      </div>

      {/* Error Display */}
      <FormErrorDisplay 
        submitError={submitError}
        validationErrors={errors}
      />

      {/* Form Sections */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <PersonalInfoSection 
          register={register}
          errors={errors}
          watch={watch}
        />

        <EmploymentInfoSection 
          register={register}
          errors={errors}
          departments={departments}
          managers={managers}
          isEdit={isEdit}
        />

        {isEdit && (
          <AdditionalInfoSection 
            employee={selectedEmployee}
            isLoading={isLoading}
          />
        )}

        <DocumentsSection 
          uploadedFiles={uploadedFiles}
          existingFiles={existingFiles}
          onFileUpload={handleFileUpload}
          onRemoveFile={handleRemoveFile}
          onPreviewFile={handlePreviewFile}
          onDownloadFile={handleDownloadFile}
          isLoading={isSubmitting}
        />
      </form>

      {/* Status Bar */}
      <FormStatusBar 
        formState={formState}
        onSave={handleSubmit}
        onCancel={handleCancel}
      />
    </motion.div>
  );
};

export default EmployeeForm;