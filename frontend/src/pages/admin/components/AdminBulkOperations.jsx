import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Upload, 
  Download, 
  Trash2, 
  Edit, 
  Users, 
  FileText,
  AlertTriangle,
  CheckCircle,
  X,
  Plus
} from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { Modal } from '../../../components/ui/Modal';

/**
 * AdminBulkOperations Component
 * Handles bulk operations for administrative tasks
 */
const AdminBulkOperations = () => {
  const [selectedItems, setSelectedItems] = useState([]);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [bulkAction, setBulkAction] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const bulkActions = [
    {
      id: 'export',
      label: 'Export Selected',
      icon: Download,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      id: 'delete',
      label: 'Delete Selected',
      icon: Trash2,
      color: 'text-red-600',
      bgColor: 'bg-red-100'
    },
    {
      id: 'update',
      label: 'Update Selected',
      icon: Edit,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      id: 'archive',
      label: 'Archive Selected',
      icon: FileText,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100'
    }
  ];

  const sampleData = [
    { id: 1, name: 'John Doe', email: 'john@company.com', role: 'Employee', status: 'Active' },
    { id: 2, name: 'Jane Smith', email: 'jane@company.com', role: 'Manager', status: 'Active' },
    { id: 3, name: 'Bob Johnson', email: 'bob@company.com', role: 'Employee', status: 'Inactive' },
    { id: 4, name: 'Alice Brown', email: 'alice@company.com', role: 'Admin', status: 'Active' },
    { id: 5, name: 'Charlie Wilson', email: 'charlie@company.com', role: 'Employee', status: 'Active' }
  ];

  const handleSelectAll = () => {
    if (selectedItems.length === sampleData.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(sampleData.map(item => item.id));
    }
  };

  const handleSelectItem = (id) => {
    setSelectedItems(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  };

  const handleBulkAction = (actionId) => {
    setBulkAction(actionId);
    setShowBulkModal(true);
  };

  const executeBulkAction = async () => {
    setIsProcessing(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    console.log(`Executing ${bulkAction} on items:`, selectedItems);
    
    setIsProcessing(false);
    setShowBulkModal(false);
    setSelectedItems([]);
    setBulkAction('');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Active':
        return 'bg-green-100 text-green-800';
      case 'Inactive':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Bulk Operations</h2>
          <p className="text-gray-600 mt-1">Manage multiple items at once</p>
        </div>
        
        {selectedItems.length > 0 && (
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">
              {selectedItems.length} item{selectedItems.length !== 1 ? 's' : ''} selected
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedItems([])}
            >
              <X className="h-4 w-4 mr-1" />
              Clear
            </Button>
          </div>
        )}
      </div>

      {/* Bulk Actions */}
      {selectedItems.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Bulk Actions</h3>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {bulkActions.map((action) => {
              const Icon = action.icon;
              return (
                <button
                  key={action.id}
                  onClick={() => handleBulkAction(action.id)}
                  className="flex items-center space-x-3 p-4 rounded-lg border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-colors"
                >
                  <div className={`p-2 rounded-full ${action.bgColor}`}>
                    <Icon className={`h-5 w-5 ${action.color}`} />
                  </div>
                  <span className="text-sm font-medium text-gray-900">{action.label}</span>
                </button>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* Data Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedItems.length === sampleData.length}
                    onChange={handleSelectAll}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {sampleData.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <input
                      type="checkbox"
                      checked={selectedItems.includes(item.id)}
                      onChange={() => handleSelectItem(item.id)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <Users className="h-4 w-4 text-blue-600" />
                      </div>
                      <div className="ml-3">
                        <div className="text-sm font-medium text-gray-900">{item.name}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {item.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {item.role}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(item.status)}`}>
                      {item.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Bulk Action Confirmation Modal */}
      <Modal
        isOpen={showBulkModal}
        onClose={() => setShowBulkModal(false)}
        title="Confirm Bulk Action"
        size="md"
      >
        <div className="space-y-4">
          <div className="flex items-center space-x-3 p-4 bg-yellow-50 rounded-lg">
            <AlertTriangle className="h-5 w-5 text-yellow-600" />
            <div>
              <p className="text-sm font-medium text-yellow-800">
                Are you sure you want to {bulkAction} {selectedItems.length} item{selectedItems.length !== 1 ? 's' : ''}?
              </p>
              <p className="text-sm text-yellow-700 mt-1">
                This action cannot be undone.
              </p>
            </div>
          </div>
          
          <div className="flex justify-end space-x-3">
            <Button
              variant="outline"
              onClick={() => setShowBulkModal(false)}
              disabled={isProcessing}
            >
              Cancel
            </Button>
            <Button
              onClick={executeBulkAction}
              disabled={isProcessing}
              className="bg-red-600 hover:bg-red-700"
            >
              {isProcessing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Processing...
                </>
              ) : (
                `Confirm ${bulkAction}`
              )}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default AdminBulkOperations;