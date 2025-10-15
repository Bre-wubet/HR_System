import React from 'react';
import { motion } from 'framer-motion';
import { FileText, Upload, Trash2, AlertCircle } from 'lucide-react';
import { Button } from '../../../../../components/ui/Button';
import { cn } from '../../../../../lib/utils';

/**
 * Documents Section Component
 * Handles file uploads and document management
 */
const DocumentsSection = ({ 
  uploadedFiles = [], 
  onFileUpload, 
  onRemoveFile, 
  isLoading = false 
}) => {
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (fileType) => {
    if (fileType?.includes('pdf')) {
      return <FileText className="h-4 w-4 text-red-500" />;
    }
    if (fileType?.includes('image')) {
      return <FileText className="h-4 w-4 text-green-500" />;
    }
    if (fileType?.includes('word') || fileType?.includes('document')) {
      return <FileText className="h-4 w-4 text-blue-500" />;
    }
    return <FileText className="h-4 w-4 text-gray-500" />;
  };

  const handleFileChange = (event) => {
    const files = Array.from(event.target.files);
    const newFiles = files.map(file => ({
      id: Date.now() + Math.random(),
      name: file.name,
      size: file.size,
      type: file.type,
      file,
      uploadedAt: new Date().toISOString(),
    }));
    onFileUpload(newFiles);
  };

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
      </h2>
      
      <div className="space-y-4">
        {/* File Upload Area */}
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
          <Upload className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <p className="text-sm text-gray-600 mb-4">
            Upload employee documents (contracts, certificates, etc.)
          </p>
          <p className="text-xs text-gray-500 mb-4">
            Supported formats: PDF, DOC, DOCX, JPG, JPEG, PNG (Max 10MB each)
          </p>
          
          <input
            type="file"
            multiple
            onChange={handleFileChange}
            className="hidden"
            id="file-upload"
            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
            disabled={isLoading}
          />
          
          <label
            htmlFor="file-upload"
            className={cn(
              'inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer transition-colors',
              isLoading && 'opacity-50 cursor-not-allowed'
            )}
          >
            <Upload className="h-4 w-4 mr-2" />
            {isLoading ? 'Uploading...' : 'Choose Files'}
          </label>
        </div>

        {/* Uploaded Files List */}
        {uploadedFiles.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-gray-700 flex items-center">
              <FileText className="h-4 w-4 mr-2" />
              Uploaded Files ({uploadedFiles.length})
            </h3>
            
            <div className="space-y-2">
              {uploadedFiles.map((file) => (
                <motion.div
                  key={file.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center justify-between bg-gray-50 rounded-lg p-3 hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center space-x-3 flex-1 min-w-0">
                    {getFileIcon(file.type)}
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

        {/* Empty State */}
        {uploadedFiles.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <AlertCircle className="h-8 w-8 mx-auto mb-2 text-gray-300" />
            <p className="text-sm">No documents uploaded yet</p>
            <p className="text-xs text-gray-400 mt-1">
              Upload contracts, certificates, or other relevant documents
            </p>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default DocumentsSection;
