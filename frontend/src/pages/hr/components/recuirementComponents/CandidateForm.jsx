import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Phone, FileText, Upload } from 'lucide-react';

import { Button } from '../../../../components/ui/Button';
import { Modal } from '../../../../components/ui/Modal';
import { Input } from '../../../../components/ui/Input';
import { recruitmentUtils } from '../../../../api/recruitmentApi';
import { cn } from '../../../../lib/utils';
import CandidateDocumentsSection from './CandidateDocumentsSection';
import useRecruitmentStore from '../../../../stores/useRecruitmentStore';

/**
 * Candidate Form Component
 * Handles adding and editing candidates
 */
const CandidateForm = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  jobId, 
  candidate = null,
  isLoading = false 
}) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    resumeUrl: '',
  });
  
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [existingFiles, setExistingFiles] = useState([]);
  const [removedFiles, setRemovedFiles] = useState([]);
  
  const isEdit = !!candidate;
  
  const {
    fetchCandidateDocuments,
    uploadCandidateDocument,
    addCandidateDocument,
    removeCandidateDocument
  } = useRecruitmentStore();
  
  useEffect(() => {
    if (isOpen) {
      if (candidate) {
        setFormData({
          firstName: candidate.firstName || '',
          lastName: candidate.lastName || '',
          email: candidate.email || '',
          phone: candidate.phone || '',
          resumeUrl: candidate.resumeUrl || '',
        });
        
        // Load existing documents
        loadExistingDocuments(candidate.id);
      } else {
        setFormData({
          firstName: '',
          lastName: '',
          email: '',
          phone: '',
          resumeUrl: '',
        });
        setExistingFiles([]);
      }
      setErrors({});
      setIsSubmitting(false);
      setUploadedFiles([]);
      setRemovedFiles([]);
    }
  }, [isOpen, candidate]);

  // Load existing documents for editing
  const loadExistingDocuments = async (candidateId) => {
    try {
      const result = await fetchCandidateDocuments(candidateId);
      if (result.success) {
        setExistingFiles(result.data);
      }
    } catch (error) {
      console.error('Failed to load documents:', error);
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const validation = recruitmentUtils.validateCandidate(formData);
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }
    
    setIsSubmitting(true);
    try {
      // Submit candidate data first
      const result = await onSubmit({ jobId, data: formData });
      
      // Check if the result indicates an error
      if (!result.success) {
        // Handle specific error cases
        if (result.code === 'CANDIDATE_DUPLICATE') {
          setErrors({ 
            email: 'A candidate with this email has already applied to this job posting. Please use a different email or check if you have already applied.' 
          });
        } else {
          setErrors({ 
            general: result.error || 'An unexpected error occurred. Please try again.' 
          });
        }
        return;
      }
      
      // Handle document operations if there are any
      if (result && result.data && (uploadedFiles.length > 0 || removedFiles.length > 0)) {
        await handleDocumentOperations(result.data.id || candidate?.id);
      }
      
      onClose();
    } catch (error) {
      console.error('Error submitting candidate:', error);
      setErrors({ 
        general: 'An unexpected error occurred. Please try again.' 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle document operations
  const handleDocumentOperations = async (candidateId) => {
    try {
      // Upload new files
      for (const file of uploadedFiles) {
        const uploadResult = await uploadCandidateDocument(candidateId, file);
        if (uploadResult.success) {
          await addCandidateDocument(candidateId, {
            name: file.name,
            fileUrl: uploadResult.data.fileUrl,
            documentType: getDocumentType(file.name)
          });
        }
      }

      // Remove deleted files
      for (const file of removedFiles) {
        if (file.id) {
          await removeCandidateDocument(candidateId, file.id);
        }
      }
    } catch (error) {
      console.error('Error handling document operations:', error);
    }
  };

  // Get document type based on file name
  const getDocumentType = (fileName) => {
    const name = fileName.toLowerCase();
    if (name.includes('resume') || name.includes('cv')) return 'RESUME';
    if (name.includes('cover')) return 'COVER_LETTER';
    if (name.includes('portfolio')) return 'PORTFOLIO';
    if (name.includes('certificate') || name.includes('cert')) return 'CERTIFICATE';
    return 'OTHER';
  };

  // Document handling functions
  const handleFileUpload = (files) => {
    const newFiles = Array.from(files).map(file => ({
      id: `temp-${Date.now()}-${Math.random()}`,
      name: file.name,
      size: file.size,
      type: file.type,
      file: file
    }));
    setUploadedFiles(prev => [...prev, ...newFiles]);
  };

  const handleRemoveFile = (file) => {
    if (file.id && file.id.startsWith('temp-')) {
      // Remove from uploaded files
      setUploadedFiles(prev => prev.filter(f => f.id !== file.id));
    } else {
      // Mark existing file for removal
      setRemovedFiles(prev => [...prev, file]);
      setExistingFiles(prev => prev.filter(f => f.id !== file.id));
    }
  };

  const handlePreviewFile = (file) => {
    // Preview functionality will be handled by CandidateDocumentsSection
  };

  const handleDownloadFile = (file) => {
    if (file.url || file.fileUrl) {
      const link = document.createElement('a');
      link.href = file.url || file.fileUrl;
      link.download = file.name;
      link.click();
    }
  };
  
  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };
  

  
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? 'Edit Candidate' : 'Add Candidate'}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* General Error Display */}
        {errors.general && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-800">{errors.general}</p>
              </div>
            </div>
          </div>
        )}

        {/* Personal Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <User className="h-5 w-5 mr-2 text-blue-600" />
            Personal Information
          </h3>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                First Name *
              </label>
              <Input
                value={formData.firstName}
                onChange={(e) => handleChange('firstName', e.target.value)}
                placeholder="John"
                className={cn(errors.firstName && 'border-red-500')}
                disabled={isSubmitting}
              />
              {errors.firstName && (
                <p className="text-sm text-red-600 mt-1">{errors.firstName}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Last Name *
              </label>
              <Input
                value={formData.lastName}
                onChange={(e) => handleChange('lastName', e.target.value)}
                placeholder="Doe"
                className={cn(errors.lastName && 'border-red-500')}
                disabled={isSubmitting}
              />
              {errors.lastName && (
                <p className="text-sm text-red-600 mt-1">{errors.lastName}</p>
              )}
            </div>
          </div>
        </div>
        
        {/* Contact Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <Mail className="h-5 w-5 mr-2 text-blue-600" />
            Contact Information
          </h3>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email *
            </label>
            <Input
              type="email"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              placeholder="john.doe@example.com"
              className={cn(errors.email && 'border-red-500')}
              disabled={isSubmitting}
            />
            {errors.email && (
              <p className="text-sm text-red-600 mt-1">{errors.email}</p>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone
            </label>
            <Input
              type="tel"
              value={formData.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
              placeholder="+1 (555) 123-4567"
              disabled={isSubmitting}
            />
          </div>
        </div>
        
        {/* Documents Section */}
        <CandidateDocumentsSection
          candidateId={candidate?.id}
          uploadedFiles={uploadedFiles}
          existingFiles={existingFiles}
          onFileUpload={handleFileUpload}
          onRemoveFile={handleRemoveFile}
          onPreviewFile={handlePreviewFile}
          onDownloadFile={handleDownloadFile}
          isLoading={isSubmitting}
        />
        
        {/* Form Actions */}
        <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
          <Button 
            variant="outline" 
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button 
            type="submit"
            loading={isSubmitting}
            disabled={isSubmitting}
          >
            {isEdit ? 'Update Candidate' : 'Add Candidate'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default CandidateForm;
