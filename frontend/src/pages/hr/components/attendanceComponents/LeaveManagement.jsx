import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Calendar, 
  Clock, 
  User, 
  Filter, 
  Search, 
  Plus,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  AlertCircle,
  FileText
} from 'lucide-react';
import { Button } from '../../../../components/ui/Button';
import { Input } from '../../../../components/ui/Input';
import { Modal } from '../../../../components/ui/Modal';
import { Table } from '../../../../components/ui/Table';
import { 
  LEAVE_TYPE, 
  LEAVE_STATUS,
  formatDate, 
  formatDateTime,
  getDaysBetween,
  getLeaveTypeColor,
  getLeaveStatusColor 
} from '../../../../api/attendanceApi';

/**
 * LeaveRequestCard Component
 * Displays a single leave request in card format
 */
export const LeaveRequestCard = ({ 
  request, 
  onApprove, 
  onReject, 
  onEdit, 
  onDelete,
  showActions = true,
  currentUserId = null 
}) => {
  const [isActionModalOpen, setIsActionModalOpen] = useState(false);
  const [actionType, setActionType] = useState(null);
  const [actionComment, setActionComment] = useState('');

  const days = getDaysBetween(request.startDate, request.endDate);
  const isOwnRequest = currentUserId && request.employeeId === currentUserId;
  const canApprove = showActions && request.status === LEAVE_STATUS.PENDING && !isOwnRequest;

  const getStatusIcon = (status) => {
    switch (status) {
      case LEAVE_STATUS.APPROVED:
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case LEAVE_STATUS.REJECTED:
        return <XCircle className="h-5 w-5 text-red-600" />;
      case LEAVE_STATUS.PENDING:
        return <AlertCircle className="h-5 w-5 text-yellow-600" />;
      default:
        return <FileText className="h-5 w-5 text-gray-600" />;
    }
  };

  const handleAction = (type) => {
    setActionType(type);
    setIsActionModalOpen(true);
  };

  const handleConfirmAction = () => {
    if (actionType === 'approve') {
      onApprove(request.id, { comment: actionComment });
    } else if (actionType === 'reject') {
      onReject(request.id, { comment: actionComment });
    }
    setIsActionModalOpen(false);
    setActionComment('');
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-soft p-6 border border-gray-200 hover:shadow-medium transition-shadow"
      >
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            {getStatusIcon(request.status)}
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {request.employee?.firstName} {request.employee?.lastName}
              </h3>
              <p className="text-sm text-gray-600">{request.employee?.email}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getLeaveTypeColor(request.type)}`}>
              {request.type}
            </span>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getLeaveStatusColor(request.status)}`}>
              {request.status}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-gray-400" />
              <span className="text-sm text-gray-600">Start Date:</span>
            </div>
            <p className="text-sm font-medium text-gray-900">
              {formatDate(request.startDate)}
            </p>
          </div>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-gray-400" />
              <span className="text-sm text-gray-600">End Date:</span>
            </div>
            <p className="text-sm font-medium text-gray-900">
              {formatDate(request.endDate)}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-gray-400" />
              <span className="text-sm text-gray-600">Duration:</span>
            </div>
            <p className="text-sm font-medium text-gray-900">
              {days} day{days > 1 ? 's' : ''}
            </p>
          </div>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-gray-400" />
              <span className="text-sm text-gray-600">Applied:</span>
            </div>
            <p className="text-sm font-medium text-gray-900">
              {formatDate(request.appliedAt)}
            </p>
          </div>
        </div>

        {request.approvedBy && (
          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">
              <span className="font-medium">Approved by:</span> {request.approvedBy.firstName} {request.approvedBy.lastName}
            </p>
            <p className="text-xs text-gray-500">
              {formatDateTime(request.approvedAt)}
            </p>
          </div>
        )}

        {showActions && (
          <div className="flex items-center justify-end space-x-2 pt-4 border-t border-gray-200">
            {canApprove && (
              <>
                <Button
                  size="sm"
                  className="bg-green-600 hover:bg-green-700"
                  onClick={() => handleAction('approve')}
                >
                  Approve
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="text-red-600 hover:text-red-700"
                  onClick={() => handleAction('reject')}
                >
                  Reject
                </Button>
              </>
            )}
            {isOwnRequest && request.status === LEAVE_STATUS.PENDING && (
              <>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onEdit(request)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="text-red-600 hover:text-red-700"
                  onClick={() => onDelete(request.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </>
            )}
          </div>
        )}
      </motion.div>

      {/* Action Modal */}
      <Modal
        isOpen={isActionModalOpen}
        onClose={() => setIsActionModalOpen(false)}
        title={`${actionType === 'approve' ? 'Approve' : 'Reject'} Leave Request`}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Comment (Optional)
            </label>
            <textarea
              value={actionComment}
              onChange={(e) => setActionComment(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder={`Add a comment for ${actionType === 'approve' ? 'approval' : 'rejection'}...`}
            />
          </div>

          <div className="flex items-center justify-end space-x-3 pt-4">
            <Button
              variant="outline"
              onClick={() => setIsActionModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              className={actionType === 'approve' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}
              onClick={handleConfirmAction}
            >
              {actionType === 'approve' ? 'Approve' : 'Reject'} Request
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};

/**
 * LeaveRequestForm Component
 * Form for creating and editing leave requests
 */
export const LeaveRequestForm = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  initialData = null,
  employeeId = null,
  loading = false 
}) => {
  const [formData, setFormData] = useState({
    employeeId: employeeId || '',
    type: LEAVE_TYPE.VACATION,
    startDate: '',
    endDate: '',
    reason: '',
    ...initialData
  });
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.employeeId) {
      newErrors.employeeId = 'Employee is required';
    }
    if (!formData.startDate) {
      newErrors.startDate = 'Start date is required';
    }
    if (!formData.endDate) {
      newErrors.endDate = 'End date is required';
    }
    if (formData.startDate && formData.endDate && new Date(formData.startDate) > new Date(formData.endDate)) {
      newErrors.endDate = 'End date must be after start date';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const days = formData.startDate && formData.endDate ? 
    getDaysBetween(formData.startDate, formData.endDate) : 0;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? 'Edit Leave Request' : 'Create Leave Request'}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Leave Type
          </label>
          <select
            value={formData.type}
            onChange={(e) => handleChange('type', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value={LEAVE_TYPE.VACATION}>Vacation</option>
            <option value={LEAVE_TYPE.SICK}>Sick Leave</option>
            <option value={LEAVE_TYPE.UNPAID}>Unpaid Leave</option>
            <option value={LEAVE_TYPE.MATERNITY}>Maternity Leave</option>
            <option value={LEAVE_TYPE.PATERNITY}>Paternity Leave</option>
            <option value={LEAVE_TYPE.OTHER}>Other</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Start Date
          </label>
          <Input
            type="date"
            value={formData.startDate}
            onChange={(e) => handleChange('startDate', e.target.value)}
            error={errors.startDate}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            End Date
          </label>
          <Input
            type="date"
            value={formData.endDate}
            onChange={(e) => handleChange('endDate', e.target.value)}
            error={errors.endDate}
          />
        </div>

        {days > 0 && (
          <div className="p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              <span className="font-medium">Duration:</span> {days} day{days > 1 ? 's' : ''}
            </p>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Reason (Optional)
          </label>
          <textarea
            value={formData.reason}
            onChange={(e) => handleChange('reason', e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Provide a reason for the leave request..."
          />
        </div>

        <div className="flex items-center justify-end space-x-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={loading}
          >
            {loading ? 'Saving...' : (initialData ? 'Update Request' : 'Create Request')}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

/**
 * LeaveRequestTable Component
 * Table view for leave requests
 */
export const LeaveRequestTable = ({ 
  requests, 
  onApprove, 
  onReject, 
  onEdit, 
  onDelete,
  loading = false,
  showActions = true 
}) => {
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    type: '',
    dateFrom: '',
    dateTo: '',
  });

  const filteredRequests = requests.filter(request => {
    const matchesSearch = !filters.search || 
      `${request.employee?.firstName} ${request.employee?.lastName}`.toLowerCase().includes(filters.search.toLowerCase()) ||
      request.employee?.email?.toLowerCase().includes(filters.search.toLowerCase());
    
    const matchesStatus = !filters.status || request.status === filters.status;
    const matchesType = !filters.type || request.type === filters.type;
    
    const matchesDateFrom = !filters.dateFrom || new Date(request.startDate) >= new Date(filters.dateFrom);
    const matchesDateTo = !filters.dateTo || new Date(request.endDate) <= new Date(filters.dateTo);
    
    return matchesSearch && matchesStatus && matchesType && matchesDateFrom && matchesDateTo;
  });

  const columns = [
    {
      key: 'employee',
      label: 'Employee',
      render: (request) => (
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
            <User className="h-4 w-4 text-blue-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900">
              {request.employee?.firstName} {request.employee?.lastName}
            </p>
            <p className="text-xs text-gray-500">{request.employee?.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'type',
      label: 'Type',
      render: (request) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getLeaveTypeColor(request.type)}`}>
          {request.type}
        </span>
      ),
    },
    {
      key: 'duration',
      label: 'Duration',
      render: (request) => (
        <div>
          <p className="text-sm text-gray-900">
            {formatDate(request.startDate)} - {formatDate(request.endDate)}
          </p>
          <p className="text-xs text-gray-500">
            {getDaysBetween(request.startDate, request.endDate)} days
          </p>
        </div>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (request) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getLeaveStatusColor(request.status)}`}>
          {request.status}
        </span>
      ),
    },
    {
      key: 'appliedAt',
      label: 'Applied',
      render: (request) => (
        <p className="text-sm text-gray-900">
          {formatDate(request.appliedAt)}
        </p>
      ),
    },
    ...(showActions ? [{
      key: 'actions',
      label: 'Actions',
      render: (request) => (
        <div className="flex items-center space-x-2">
          {request.status === LEAVE_STATUS.PENDING && (
            <>
              <Button
                size="sm"
                className="bg-green-600 hover:bg-green-700"
                onClick={() => onApprove(request.id)}
              >
                Approve
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="text-red-600 hover:text-red-700"
                onClick={() => onReject(request.id)}
              >
                Reject
              </Button>
            </>
          )}
          <Button
            size="sm"
            variant="outline"
            onClick={() => onEdit(request)}
          >
            <Edit className="h-4 w-4" />
          </Button>
        </div>
      ),
    }] : []),
  ];

  return (
    <div className="bg-white rounded-xl shadow-soft border border-gray-200">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Leave Requests</h3>
            <p className="text-sm text-gray-600">
              {filteredRequests.length} of {requests.length} requests
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search by employee name or email..."
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            className="pl-10"
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <Table
          data={filteredRequests}
          columns={columns}
          loading={loading}
          emptyMessage="No leave requests found"
        />
      </div>
    </div>
  );
};

export default {
  LeaveRequestCard,
  LeaveRequestForm,
  LeaveRequestTable,
};
