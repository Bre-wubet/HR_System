import React from 'react';
import { motion } from 'framer-motion';
import { 
  FileText, 
  Download, 
  Eye, 
  Trash2, 
  Plus
} from 'lucide-react';
import { Button } from '../../../../../components/ui/Button';
import { Modal } from '../../../../../components/ui/Modal';
import { formatDate } from '../../../../../lib/utils';
import employeeApi from '../../../../../api/employeeApi';

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
    fileUrl: '', // optional, backend supports fileUrl
  });
  const [uploading, setUploading] = React.useState(false);

  const handleFileSelected = async (file) => {
    if (!file) return;
    try {
      setUploading(true);
      const { data } = await employeeApi.uploadEmployeeDocumentFile(employeeId, file);
      setDocumentData((prev) => ({ ...prev, fileUrl: data?.data?.fileUrl || '' }));
    } catch (e) {
      console.error('Upload failed', e);
    } finally {
      setUploading(false);
    }
  };

  const handleAddDocument = async () => {
    if (!documentData.name) return;

    const payload = {
      name: documentData.name,
      ...(documentData.fileUrl ? { fileUrl: documentData.fileUrl } : {}),
    };

    const result = await onAddDocument(employeeId, payload);
    if (result?.success) {
      setShowAddModal(false);
      setDocumentData({ name: '', fileUrl: '' });
    } else {
      console.error('Failed to add document:', result?.error);
    }
  };

  const handleRemoveDocument = async (docId) => {
    if (window.confirm('Are you sure you want to delete this document?')) {
      await onRemoveDocument(employeeId, docId);
    }
  };

  const getDocumentIcon = () => <FileText className="h-5 w-5 text-gray-600" />;

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
          {documents.map((doc) => {
            return (
              <motion.div
                key={doc.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-lg border border-gray-200 p-4"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3 flex-1">
                    {getDocumentIcon()}
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <h4 className="font-medium text-gray-900 truncate">
                          {doc.name}
                        </h4>
                      </div>
                      
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <span>Uploaded: {formatDate(doc.uploadedAt)}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {doc.fileUrl && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => window.open(doc.fileUrl, '_blank')}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    )}
                    
                    {doc.fileUrl && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          const a = window.document.createElement('a');
                          a.href = doc.fileUrl;
                          a.download = doc.name;
                          a.click();
                        }}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    )}
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveDocument(doc.id)}
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
              File URL (optional)
            </label>
            <input
              type="url"
              value={documentData.fileUrl}
              onChange={(e) => setDocumentData({ ...documentData, fileUrl: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="https://..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Or upload a file
            </label>
            <input
              type="file"
              onChange={(e) => handleFileSelected(e.target.files?.[0])}
              className="w-full"
              disabled={uploading}
            />
            {uploading && (
              <p className="text-xs text-gray-500 mt-1">Uploading...</p>
            )}
          </div>

          <div className="flex justify-end space-x-3">
            <Button variant="outline" onClick={() => setShowAddModal(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleAddDocument}
              disabled={!documentData.name}
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
