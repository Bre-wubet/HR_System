import React, { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Upload, 
  Trash2, 
  AlertCircle, 
  Eye, 
  Download, 
  X,
  CheckCircle,
  AlertTriangle,
  FileImage,
  FileText,
  FileSpreadsheet,
} from 'lucide-react';
import { Button } from '../../../../../components/ui/Button';
import { cn } from '../../../../../lib/utils';
import FilePreviewModal from './FilePreviewModal';

/**
 * Documents Section Component
 * Enhanced file uploads and document management with preview and validation
 */
const DocumentsSection = ({ 
  uploadedFiles = [], 
  onFileUpload, 
  onRemoveFile, 
  isLoading = false,
  existingFiles = [], // Files from server for edit mode
  onPreviewFile,
  onDownloadFile,
  maxFileSize = 10 * 1024 * 1024, // 10MB default
  allowedTypes = ['.pdf', '.doc', '.docx', '.jpg', '.jpeg', '.png', '.xlsx', '.xls']
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});
  const [fileErrors, setFileErrors] = useState({});
  const [previewFile, setPreviewFile] = useState(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const fileInputRef = useRef(null);

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (fileType, fileName) => {
    const extension = fileName?.split('.').pop()?.toLowerCase();
    
    if (fileType?.includes('pdf') || extension === 'pdf') {
      return <FileText className="h-4 w-4 text-red-500" />;
    }
    if (fileType?.includes('image') || ['jpg', 'jpeg', 'png', 'gif'].includes(extension)) {
      return <FileImage className="h-4 w-4 text-green-500" />;
    }
    if (fileType?.includes('word') || fileType?.includes('document') || ['doc', 'docx'].includes(extension)) {
      return <FileText className="h-4 w-4 text-blue-500" />;
    }
    if (fileType?.includes('sheet') || fileType?.includes('excel') || ['xls', 'xlsx'].includes(extension)) {
      return <FileSpreadsheet className="h-4 w-4 text-green-600" />;
    }
    return <FileText className="h-4 w-4 text-gray-500" />;
  };

  const validateFile = (file) => {
    const errors = [];
    
    // Check file size
    if (file.size > maxFileSize) {
      errors.push(`File size must be less than ${formatFileSize(maxFileSize)}`);
    }
    
    // Check file type
    const extension = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!allowedTypes.includes(extension)) {
      errors.push(`File type ${extension} is not allowed`);
    }
    
    // Check for duplicate names
    const isDuplicate = [...uploadedFiles, ...existingFiles].some(
      existingFile => existingFile.name === file.name
    );
    if (isDuplicate) {
      errors.push('A file with this name already exists');
    }
    
    return errors;
  };

  const handleFileChange = useCallback((event) => {
    const files = Array.from(event.target.files);
    const validFiles = [];
    const errors = {};
    
    files.forEach((file, index) => {
      const fileErrors = validateFile(file);
      if (fileErrors.length > 0) {
        errors[file.name] = fileErrors;
      } else {
        validFiles.push({
          id: Date.now() + Math.random() + index,
          name: file.name,
          size: file.size,
          type: file.type,
          file,
          uploadedAt: new Date().toISOString(),
          status: 'pending'
        });
      }
    });
    
    setFileErrors(errors);
    
    if (validFiles.length > 0) {
      onFileUpload(validFiles);
    }
    
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [uploadedFiles, existingFiles, maxFileSize, allowedTypes, onFileUpload]);

  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const event = {
        target: {
          files: e.dataTransfer.files
        }
      };
      handleFileChange(event);
    }
  }, [handleFileChange]);

  const handlePreview = useCallback((file) => {
    setPreviewFile(file);
    setIsPreviewOpen(true);
  }, []);

  const handleClosePreview = useCallback(() => {
    setIsPreviewOpen(false);
    setPreviewFile(null);
  }, []);

  const handleDownload = useCallback((file) => {
    if (onDownloadFile) {
      onDownloadFile(file);
    } else {
      const url = file.url || URL.createObjectURL(file.file);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.name;
      a.click();
      if (!file.url) {
        URL.revokeObjectURL(url);
      }
    }
  }, [onDownloadFile]);

  const allFiles = [...existingFiles, ...uploadedFiles];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="bg-white rounded-xl shadow-soft p-6"
    >
      <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
        <Upload className="h-5 w-5 mr-2 text-blue-600" />
        Documents
        {allFiles.length > 0 && (
          <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
            {allFiles.length}
          </span>
        )}
      </h2>
      
      <div className="space-y-6">
        {/* File Upload Area */}
        <div 
          className={cn(
            'border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200',
            dragActive 
              ? 'border-blue-400 bg-blue-50' 
              : 'border-gray-300 hover:border-gray-400'
          )}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <Upload className={cn(
            'h-12 w-12 mx-auto mb-4 transition-colors',
            dragActive ? 'text-blue-500' : 'text-gray-400'
          )} />
          
          <div className="space-y-2">
            <p className="text-sm text-gray-600">
              {dragActive ? 'Drop files here' : 'Drag and drop files here, or click to select'}
            </p>
            <p className="text-xs text-gray-500">
              Supported formats: {allowedTypes.join(', ').toUpperCase()} (Max {formatFileSize(maxFileSize)} each)
            </p>
          </div>
          
          <input
            ref={fileInputRef}
            type="file"
            multiple
            onChange={handleFileChange}
            className="hidden"
            id="file-upload"
            accept={allowedTypes.join(',')}
            disabled={isLoading}
          />
          
          <label
            htmlFor="file-upload"
            className={cn(
              'inline-flex items-center px-4 py-2 mt-4 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer transition-colors',
              isLoading && 'opacity-50 cursor-not-allowed'
            )}
          >
            <Upload className="h-4 w-4 mr-2" />
            {isLoading ? 'Uploading...' : 'Choose Files'}
          </label>
        </div>

        {/* File Errors */}
        <AnimatePresence>
          {Object.keys(fileErrors).length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-red-50 border border-red-200 rounded-lg p-4"
            >
              <div className="flex items-start space-x-3">
                <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h3 className="text-sm font-medium text-red-800 mb-2">
                    File Upload Errors
                  </h3>
                  <div className="space-y-1">
                    {Object.entries(fileErrors).map(([fileName, errors]) => (
                      <div key={fileName} className="text-sm text-red-700">
                        <span className="font-medium">{fileName}:</span>
                        <ul className="ml-4 list-disc">
                          {errors.map((error, index) => (
                            <li key={index}>{error}</li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
                <button
                  onClick={() => setFileErrors({})}
                  className="text-red-600 hover:text-red-800"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Files List */}
        {allFiles.length > 0 && (
          <div className="space-y-4">
            {/* Existing Files (Edit Mode) */}
            {existingFiles.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-sm font-medium text-gray-700 flex items-center">
                  <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                  Existing Files ({existingFiles.length})
                </h3>
                
                <div className="space-y-2">
                  {existingFiles.map((file) => (
                    <motion.div
                      key={file.id || file.name}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex items-center justify-between bg-green-50 border border-green-200 rounded-lg p-3"
                    >
                      <div className="flex items-center space-x-3 flex-1 min-w-0">
                        {getFileIcon(file.type, file.name)}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {file.name}
                          </p>
                          <div className="flex items-center space-x-2 text-xs text-gray-500">
                            <span>{formatFileSize(file.size)}</span>
                            <span>•</span>
                            <span>{file.type}</span>
                            {file.uploadedAt && (
                              <>
                                <span>•</span>
                                <span>{new Date(file.uploadedAt).toLocaleDateString()}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handlePreview(file)}
                          className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDownload(file)}
                          className="text-green-600 hover:text-green-700 hover:bg-green-50"
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onRemoveFile(file.id || file.name)}
                          disabled={isLoading}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* New Uploaded Files */}
            {uploadedFiles.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-sm font-medium text-gray-700 flex items-center">
                  <Upload className="h-4 w-4 mr-2 text-blue-600" />
                  New Files ({uploadedFiles.length})
                </h3>
                
                <div className="space-y-2">
                  {uploadedFiles.map((file) => (
                    <motion.div
                      key={file.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex items-center justify-between bg-blue-50 border border-blue-200 rounded-lg p-3"
                    >
                      <div className="flex items-center space-x-3 flex-1 min-w-0">
                        {getFileIcon(file.type, file.name)}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {file.name}
                          </p>
                          <div className="flex items-center space-x-2 text-xs text-gray-500">
                            <span>{formatFileSize(file.size)}</span>
                            <span>•</span>
                            <span>{file.type}</span>
                            {file.uploadedAt && (
                              <>
                                <span>•</span>
                                <span>{new Date(file.uploadedAt).toLocaleDateString()}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handlePreview(file)}
                          className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDownload(file)}
                          className="text-green-600 hover:text-green-700 hover:bg-green-50"
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onRemoveFile(file.id)}
                          disabled={isLoading}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Empty State */}
        {allFiles.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <AlertCircle className="h-8 w-8 mx-auto mb-2 text-gray-300" />
            <p className="text-sm">No documents uploaded yet</p>
            <p className="text-xs text-gray-400 mt-1">
              Upload contracts, certificates, or other relevant documents
            </p>
          </div>
        )}
      </div>

      {/* File Preview Modal */}
      <FilePreviewModal
        file={previewFile}
        isOpen={isPreviewOpen}
        onClose={handleClosePreview}
        onDownload={handleDownload}
      />
    </motion.div>
  );
};

export default DocumentsSection;
