import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Download, 
  FileImage, 
  FileType, 
  FileSpreadsheet, 
  FileText,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { Button } from '../../../../../components/ui/Button';
import { cn } from '../../../../../lib/utils';

/**
 * File Preview Modal Component
 * Enhanced file preview with support for various file types
 */
const FilePreviewModal = ({ 
  file, 
  isOpen, 
  onClose, 
  onDownload 
}) => {
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [fileContent, setFileContent] = useState(null);

  useEffect(() => {
    if (isOpen && file) {
      setIsLoading(true);
      setError(null);
      
      if (file.url) {
        // Existing file from server
        setPreviewUrl(file.url);
        setIsLoading(false);
      } else if (file.file) {
        // New uploaded file
        const url = URL.createObjectURL(file.file);
        setPreviewUrl(url);
        setIsLoading(false);
        
        // Cleanup function
        return () => {
          URL.revokeObjectURL(url);
        };
      } else {
        setError('No file data available');
        setIsLoading(false);
      }
    }
  }, [isOpen, file]);

  const getFileIcon = (fileType, fileName) => {
    const extension = fileName?.split('.').pop()?.toLowerCase();
    
    if (fileType?.includes('pdf') || extension === 'pdf') {
      return <FileType className="h-8 w-8 text-red-500" />;
    }
    if (fileType?.includes('image') || ['jpg', 'jpeg', 'png', 'gif'].includes(extension)) {
      return <FileImage className="h-8 w-8 text-green-500" />;
    }
    if (fileType?.includes('word') || fileType?.includes('document') || ['doc', 'docx'].includes(extension)) {
      return <FileText className="h-8 w-8 text-blue-500" />;
    }
    if (fileType?.includes('sheet') || fileType?.includes('excel') || ['xls', 'xlsx'].includes(extension)) {
      return <FileSpreadsheet className="h-8 w-8 text-green-600" />;
    }
    return <FileText className="h-8 w-8 text-gray-500" />;
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const renderPreview = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center h-96">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex flex-col items-center justify-center h-96 text-gray-500">
          <AlertCircle className="h-12 w-12 mb-4 text-red-500" />
          <p className="text-lg font-medium">Preview Error</p>
          <p className="text-sm">{error}</p>
        </div>
      );
    }

    if (!file) {
      return (
        <div className="flex flex-col items-center justify-center h-96 text-gray-500">
          <FileText className="h-12 w-12 mb-4 text-gray-400" />
          <p className="text-lg font-medium">No File Selected</p>
        </div>
      );
    }

    const isImage = file.type?.includes('image') || 
                   ['jpg', 'jpeg', 'png', 'gif'].includes(file.name?.split('.').pop()?.toLowerCase());
    const isPdf = file.type?.includes('pdf') || 
                  file.name?.split('.').pop()?.toLowerCase() === 'pdf';

    if (isImage && previewUrl) {
      return (
        <div className="flex items-center justify-center h-96 bg-gray-50">
          <img 
            src={previewUrl} 
            alt={file.name}
            className="max-h-full max-w-full object-contain rounded-lg shadow-lg"
            onError={() => setError('Failed to load image')}
          />
        </div>
      );
    }

    if (isPdf && previewUrl) {
      return (
        <div className="h-96">
          <iframe
            src={previewUrl}
            className="w-full h-full border-0 rounded-lg"
            title={file.name}
            onError={() => setError('Failed to load PDF')}
          />
        </div>
      );
    }

    // For other file types, show file info
    return (
      <div className="flex flex-col items-center justify-center h-96 text-gray-500">
        {getFileIcon(file.type, file.name)}
        <p className="text-lg font-medium mt-4">{file.name}</p>
        <p className="text-sm text-gray-400 mt-2">
          {formatFileSize(file.size)} • {file.type}
        </p>
        <p className="text-sm text-gray-400 mt-4 text-center max-w-md">
          Preview not available for this file type. Click download to view the file.
        </p>
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              {file && getFileIcon(file.type, file.name)}
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  {file?.name || 'File Preview'}
                </h2>
                {file && (
                  <p className="text-sm text-gray-500">
                    {formatFileSize(file.size)} • {file.type}
                  </p>
                )}
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              {file && onDownload && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onDownload(file)}
                  className="text-green-600 border-green-600 hover:bg-green-50"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="text-gray-600 hover:text-gray-800"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 overflow-auto max-h-[calc(90vh-120px)]">
            {renderPreview()}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default FilePreviewModal;
