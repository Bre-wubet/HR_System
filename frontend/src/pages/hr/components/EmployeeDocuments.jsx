import React from 'react';
import { motion } from 'framer-motion';
import { 
  FileText, 
  Download, 
  Eye, 
  Trash2, 
  Upload,
  Plus,
  AlertCircle,
  CheckCircle,
  Clock
} from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { Modal } from '../../../components/ui/Modal';
import { cn, formatDate } from '../../../lib/utils';
import { formatDateTime } from '../../../api/employeeApi';

/**
 * Employee Documents Component
 * Manages employee documents with upload, view, and delete functionality
 */
const EmployeeDocuments = ({ 
  employeeId, 
  documents = [], 
  onAddDocument, 
  onRemoveDocument,
  isLoading = false 
}) => {
  const [showAddModal, setShowAddModal] = React.useState(false);
  const [documentData, setDocumentData] = React.useState({
    name: '',
    type: '',
    description: '',
    file: null,
  });

  const handleAddDocument = async () => {
    if (!documentData.name || !documentData.type) return;
    
    console.log('Adding document with data:', documentData);
    
    const result = await onAddDocument(employeeId, documentData);
    if (result?.success) {
      setShowAddModal(false);
      setDocumentData({
        name: '',
        type: '',
        description: '',
        file: null,
      });
    } else {
      console.error('Failed to add document:', result?.error);
    }
  };

  const handleRemoveDocument = async (docId) => {
    if (window.confirm('Are you sure you want to delete this document?')) {
      await onRemoveDocument(employeeId, docId);
    }
  };

  const getDocumentIcon = (type) => {
    switch (type?.toLowerCase()) {
      case 'contract':
        return <FileText className="h-5 w-5 text-blue-600" />;
      case 'id':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'certificate':
        return <CheckCircle className="h-5 w-5 text-purple-600" />;
      case 'resume':
        return <FileText className="h-5 w-5 text-orange-600" />;
      default:
        return <FileText className="h-5 w-5 text-gray-600" />;
    }
  };

  const getDocumentStatus = (document) => {
    if (document.isVerified) {
      return { status: 'verified', color: 'text-green-600', icon: CheckCircle };
    }
    if (document.isPending) {
      return { status: 'pending', color: 'text-yellow-600', icon: Clock };
    }
    return { status: 'unverified', color: 'text-gray-600', icon: AlertCircle };
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Documents</h3>
        <Button 
          size="sm" 
          onClick={() => setShowAddModal(true)}
          disabled={isLoading}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Document
        </Button>
      </div>

      {documents.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
          <p>No documents uploaded yet</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {documents.map((document) => {
            const status = getDocumentStatus(document);
            const StatusIcon = status.icon;
            
            return (
              <motion.div
                key={document.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-lg border border-gray-200 p-4"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3 flex-1">
                    {getDocumentIcon(document.type)}
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <h4 className="font-medium text-gray-900 truncate">
                          {document.name}
                        </h4>
                        <StatusIcon className={cn('h-4 w-4', status.color)} />
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-2">
                        {document.description || 'No description provided'}
                      </p>
                      
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <span>Type: {document.type}</span>
                        <span>Size: {document.fileSize || 'Unknown'}</span>
                        <span>Uploaded: {formatDate(document.uploadedAt)}</span>
                        {document.uploadedBy && (
                          <span>By: {document.uploadedBy.firstName} {document.uploadedBy.lastName}</span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {document.fileUrl && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => window.open(document.fileUrl, '_blank')}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    )}
                    
                    {document.fileUrl && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          const link = document.createElement('a');
                          link.href = document.fileUrl;
                          link.download = document.name;
                          link.click();
                        }}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    )}
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveDocument(document.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Add Document Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add Document"
        size="md"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Document Name *
            </label>
            <input
              type="text"
              value={documentData.name}
              onChange={(e) => setDocumentData({ ...documentData, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., Employment Contract"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Document Type *
            </label>
            <select
              value={documentData.type}
              onChange={(e) => setDocumentData({ ...documentData, type: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select document type</option>
              <option value="contract">Employment Contract</option>
              <option value="id">ID Document</option>
              <option value="certificate">Certificate</option>
              <option value="resume">Resume</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={documentData.description}
              onChange={(e) => setDocumentData({ ...documentData, description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={3}
              placeholder="Brief description of the document..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Upload File
            </label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg">
              <div className="space-y-1 text-center">
                <Upload className="mx-auto h-12 w-12 text-gray-400" />
                <div className="flex text-sm text-gray-600">
                  <label
                    htmlFor="file-upload"
                    className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
                  >
                    <span>Upload a file</span>
                    <input
                      id="file-upload"
                      name="file-upload"
                      type="file"
                      className="sr-only"
                      onChange={(e) => setDocumentData({ ...documentData, file: e.target.files[0] })}
                    />
                  </label>
                  <p className="pl-1">or drag and drop</p>
                </div>
                <p className="text-xs text-gray-500">PNG, JPG, PDF up to 10MB</p>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3">
            <Button variant="outline" onClick={() => setShowAddModal(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleAddDocument}
              disabled={!documentData.name || !documentData.type}
            >
              Add Document
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default EmployeeDocuments;
