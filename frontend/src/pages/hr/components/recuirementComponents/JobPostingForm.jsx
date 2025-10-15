import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Building, FileText, Save, X } from 'lucide-react';

import { Button } from '../../../../components/ui/Button';
import { Modal } from '../../../../components/ui/Modal';
import { Input } from '../../../../components/ui/Input';
import { recruitmentUtils } from '../../../../api/recruitmentApi';
import { cn } from '../../../../lib/utils';

/**
 * Job Posting Form Component
 * Handles creating and editing job postings
 */
const JobPostingForm = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  jobPosting = null, 
  departments = [],
  isLoading = false 
}) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    departmentId: '',
    isActive: true,
  });
  
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const isEdit = !!jobPosting;
  
  useEffect(() => {
    if (isOpen) {
      if (jobPosting) {
        setFormData({
          title: jobPosting.title || '',
          description: jobPosting.description || '',
          departmentId: jobPosting.departmentId || '',
          isActive: jobPosting.isActive ?? true,
        });
      } else {
        setFormData({
          title: '',
          description: '',
          departmentId: '',
          isActive: true,
        });
      }
      setErrors({});
      setIsSubmitting(false);
    }
  }, [jobPosting, isOpen]);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const validation = recruitmentUtils.validateJobPosting(formData);
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }
    
    setIsSubmitting(true);
    try {
      await onSubmit(formData);
      onClose();
    } catch (error) {
      console.error('Error submitting job posting:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };
  
  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
    }
  };
  
  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={isEdit ? 'Edit Job Posting' : 'Create Job Posting'}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Building className="h-5 w-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">Basic Information</h3>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Job Title *
            </label>
            <Input
              value={formData.title}
              onChange={(e) => handleChange('title', e.target.value)}
              placeholder="e.g., Senior Software Engineer"
              className={cn(errors.title && 'border-red-500')}
              disabled={isSubmitting}
            />
            {errors.title && (
              <p className="text-sm text-red-600 mt-1">{errors.title}</p>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Department *
            </label>
            <select
              value={formData.departmentId}
              onChange={(e) => handleChange('departmentId', e.target.value)}
              className={cn(
                'w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent',
                errors.departmentId && 'border-red-500'
              )}
              disabled={isSubmitting}
            >
              <option value="">Select department</option>
              {departments.map(dept => (
                <option key={dept.id} value={dept.id}>
                  {dept.name}
                </option>
              ))}
            </select>
            {errors.departmentId && (
              <p className="text-sm text-red-600 mt-1">{errors.departmentId}</p>
            )}
          </div>
        </div>
        
        {/* Job Description */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <FileText className="h-5 w-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">Job Description</h3>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Job Description *
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="Describe the role, responsibilities, and requirements..."
              rows={6}
              className={cn(
                'w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-vertical',
                errors.description && 'border-red-500'
              )}
              disabled={isSubmitting}
            />
            {errors.description && (
              <p className="text-sm text-red-600 mt-1">{errors.description}</p>
            )}
          </div>
        </div>
        
        {/* Status Settings */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Status Settings</h3>
          
          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              id="isActive"
              checked={formData.isActive}
              onChange={(e) => handleChange('isActive', e.target.checked)}
              className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              disabled={isSubmitting}
            />
            <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
              Active job posting
            </label>
          </div>
          
          <p className="text-xs text-gray-500">
            Active job postings are visible to candidates and can receive applications.
          </p>
        </div>
        
        {/* Form Actions */}
        <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
          <Button 
            variant="outline" 
            onClick={handleClose}
            disabled={isSubmitting}
          >
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
          <Button 
            type="submit"
            loading={isSubmitting}
            disabled={isSubmitting}
          >
            <Save className="h-4 w-4 mr-2" />
            {isEdit ? 'Update Job Posting' : 'Create Job Posting'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default JobPostingForm;
