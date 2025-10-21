import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { 
  FileText, 
  Upload, 
  Download, 
  Eye, 
  Trash2, 
  Plus, 
  AlertCircle,
  CheckCircle,
  File,
  Image,
  FileImage
} from 'lucide-react';

import { Button } from '../../../../components/ui/Button';
import { Modal } from '../../../../components/ui/Modal';
import { cn } from '../../../../lib/utils';
import FilePreviewModal from '../employeeComponents/forms/FilePreviewModal';

/**
 * Candidate Documents Section Component
 * Handles document upload, preview, and management for candidates
 */
const CandidateDocumentsSection = ({ 
  candidateId,
  uploadedFiles = [],
  existingFiles = [],
  onFileUpload,
  onRemoveFile,
  onPreviewFile,
  onDownloadFile,
  isLoading = false
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [previewFile, setPreviewFile] = useState(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);

  // Handle file upload
  const handleFileUpload = useCallback((files) => {
    if (onFileUpload) {
      onFileUpload(files);
    }
  }, [onFileUpload]);

  // Handle drag events
  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  // Handle drop
  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(Array.from(e.dataTransfer.files));
    }
  }, [handleFileUpload]);

  // Handle file input change
  const handleFileInputChange = useCallback((e) => {
    if (e.target.files && e.target.files[0]) {
      handleFileUpload(Array.from(e.target.files));
    }
  }, [handleFileUpload]);

  // Handle file preview
  const handlePreview = useCallback((file) => {
    setPreviewFile(file);
    setShowPreviewModal(true);
    if (onPreviewFile) {
      onPreviewFile(file);
    }
  }, [onPreviewFile]);

  // Handle file download
  const handleDownload = useCallback((file) => {
    if (onDownloadFile) {
      onDownloadFile(file);
    }
  }, [onDownloadFile]);

  // Handle file removal
  const handleRemove = useCallback((file) => {
    if (onRemoveFile) {
      onRemoveFile(file);
    }
  }, [onRemoveFile]);

  // Get file icon based on type
  const getFileIcon = (file) => {
    const type = file.type || file.mimeType || '';
    if (type.startsWith('image/')) {
      return Image;
    } else if (type.includes('pdf')) {
      return FileText;
    } else {
      return File;
    }
  };

  // Get file type color
  const getFileTypeColor = (file) => {
    const type = file.type || file.mimeType || '';
    if (type.startsWith('image/')) {
      return 'text-green-600';
    } else if (type.includes('pdf')) {
      return 'text-red-600';
    } else if (type.includes('word') || type.includes('document')) {
      return 'text-blue-600';
    } else {
      return 'text-gray-600';
    }
  };

  // Format file size
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const allFiles = [...existingFiles, ...uploadedFiles];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <FileText className="h-5 w-5 text-blue-600" />
          <h2 className="text-lg font-semibold text-gray-900">Documents</h2>
        </div>
        <div className="text-sm text-gray-500">
          {allFiles.length} document{allFiles.length !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Upload Area */}
      <div
        className={cn(
          'border-2 border-dashed rounded-lg p-6 text-center transition-colors',
          dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400',
          isLoading && 'opacity-50 cursor-not-allowed'
        )}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
        <p className="text-sm text-gray-600 mb-2">
          Drag and drop files here, or{' '}
          <label className="text-blue-600 hover:text-blue-800 cursor-pointer font-medium">
            browse
            <input
              type="file"
              multiple
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif"
              onChange={handleFileInputChange}
              className="hidden"
              disabled={isLoading}
            />
          </label>
        </p>
        <p className="text-xs text-gray-500">
          Supported formats: PDF, DOC, DOCX, JPG, PNG (Max 10MB each)
        </p>
      </div>

      {/* File List */}
      {allFiles.length > 0 && (
        <div className="mt-6 space-y-3">
          <h3 className="text-sm font-medium text-gray-700">Uploaded Documents</h3>
          
          {/* Existing Files */}
          {existingFiles.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                Existing Documents
              </h4>
              {existingFiles.map((file, index) => {
                const IconComponent = getFileIcon(file);
                return (
                  <motion.div
                    key={`existing-${file.id || index}`}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
                  >
                    <div className="flex items-center space-x-3">
                      <IconComponent className={cn('h-5 w-5', getFileTypeColor(file))} />
                      <div>
                        <p className="text-sm font-medium text-gray-900">{file.name}</p>
                        <p className="text-xs text-gray-500">
                          {file.uploadedAt ? new Date(file.uploadedAt).toLocaleDateString() : 'Unknown date'}
                          {file.size && ` • ${formatFileSize(file.size)}`}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handlePreview(file)}
                        className="p-1"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDownload(file)}
                        className="p-1"
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemove(file)}
                        className="p-1 text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}

          {/* New Files */}
          {uploadedFiles.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                New Documents
              </h4>
              {uploadedFiles.map((file, index) => {
                const IconComponent = getFileIcon(file);
                return (
                  <motion.div
                    key={`new-${index}`}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200"
                  >
                    <div className="flex items-center space-x-3">
                      <IconComponent className={cn('h-5 w-5', getFileTypeColor(file))} />
                      <div>
                        <p className="text-sm font-medium text-gray-900">{file.name}</p>
                        <p className="text-xs text-gray-500">
                          {file.size && formatFileSize(file.size)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handlePreview(file)}
                        className="p-1"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemove(file)}
                        className="p-1 text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Empty State */}
      {allFiles.length === 0 && (
        <div className="text-center py-8">
          <FileImage className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <p className="text-sm text-gray-500">No documents uploaded yet</p>
          <p className="text-xs text-gray-400 mt-1">
            Upload resumes, cover letters, portfolios, and other relevant documents
          </p>
        </div>
      )}

      {/* File Preview Modal */}
      {showPreviewModal && previewFile && (
        <FilePreviewModal
          file={previewFile}
          isOpen={showPreviewModal}
          onClose={() => {
            setShowPreviewModal(false);
            setPreviewFile(null);
          }}
          onDownload={handleDownload}
        />
      )}
    </motion.div>
  );
};

export default CandidateDocumentsSection;
