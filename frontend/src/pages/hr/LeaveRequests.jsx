import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Calendar, 
  Clock, 
  Plus, 
  Filter, 
  Search, 
  RefreshCw,
  Grid,
  List,
  Users,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { 
  LeaveRequestCard,
  LeaveRequestForm,
  LeaveRequestTable
} from './components/attendanceComponents';
import useAttendanceStore from '../../stores/useAttendanceStore';
import useAuthStore from '../../stores/useAuthStore';
import { LEAVE_STATUS, LEAVE_TYPE } from '../../api/attendanceApi';

/**
 * LeaveRequests Component
 * Comprehensive leave requests management dashboard
 */
const LeaveRequests = () => {
  const [viewMode, setViewMode] = useState('table'); // 'table' or 'cards'
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingRequest, setEditingRequest] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [filters, setFilters] = useState({
    status: '',
    type: '',
    search: ''
  });

  const { user, permissions, roles } = useAuthStore();
  const {
    leaveRequests,
    loading,
    error,
    fetchLeaveRequests,
    createLeaveRequest,
    updateLeaveStatus
  } = useAttendanceStore();

  // Check if user is admin (has admin role or admin permissions)
  const isAdmin = roles?.includes('super_admin') || 
                  roles?.includes('admin') || 
                  permissions?.includes('admin:manage_users') ||
                  permissions?.includes('admin:manage_system');

  // Load data on component mount
  useEffect(() => {
    loadLeaveRequests();
  }, []);

  const loadLeaveRequests = async () => {
    try {
      setIsRefreshing(true);
      await fetchLeaveRequests({ take: 100 });
    } catch (error) {
      console.error('Error loading leave requests:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleCreateRequest = async (data) => {
    try {
      // Check if user has an employeeId
      if (!user?.employeeId) {
        alert('You do not have an employee record associated with your account. Please contact your administrator to set up your employee profile.');
        return;
      }
      
      await createLeaveRequest(data);
      setIsFormOpen(false);
      await loadLeaveRequests();
    } catch (error) {
      console.error('Error creating leave request:', error);
    }
  };

  const handleEditRequest = async (data) => {
    try {
      // Note: The backend doesn't have an update endpoint for leave requests
      // This would need to be implemented in the backend
      console.log('Edit leave request:', data);
      setEditingRequest(null);
    } catch (error) {
      console.error('Error updating leave request:', error);
    }
  };

  const handleApproveRequest = async (requestId, data = {}) => {
    try {
      // Check if user is admin
      if (!isAdmin) {
        alert('Only administrators can approve leave requests.');
        return;
      }

      await updateLeaveStatus(requestId, {
        status: LEAVE_STATUS.APPROVED,
        approvedById: user?.employeeId,
        ...data
      });
      await loadLeaveRequests();
    } catch (error) {
      console.error('Error approving leave request:', error);
    }
  };

  const handleRejectRequest = async (requestId, data = {}) => {
    try {
      // Check if user is admin
      if (!isAdmin) {
        alert('Only administrators can reject leave requests.');
        return;
      }

      await updateLeaveStatus(requestId, {
        status: LEAVE_STATUS.REJECTED,
        approvedById: user?.employeeId,
        ...data
      });
      await loadLeaveRequests();
    } catch (error) {
      console.error('Error rejecting leave request:', error);
    }
  };

  const handleDeleteRequest = async (requestId) => {
    try {
      // Note: The backend doesn't have a delete endpoint for leave requests
      // This would need to be implemented in the backend
      console.log('Delete leave request:', requestId);
    } catch (error) {
      console.error('Error deleting leave request:', error);
    }
  };

  const filteredRequests = leaveRequests.filter(request => {
    const matchesSearch = !filters.search || 
      `${request.employee?.firstName} ${request.employee?.lastName}`.toLowerCase().includes(filters.search.toLowerCase()) ||
      request.employee?.email?.toLowerCase().includes(filters.search.toLowerCase());
    
    const matchesStatus = !filters.status || request.status === filters.status;
    const matchesType = !filters.type || request.type === filters.type;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  const pendingRequests = leaveRequests.filter(r => r.status === LEAVE_STATUS.PENDING);
  const approvedRequests = leaveRequests.filter(r => r.status === LEAVE_STATUS.APPROVED);
  const rejectedRequests = leaveRequests.filter(r => r.status === LEAVE_STATUS.REJECTED);

  // Calculate statistics
  const stats = {
    total: leaveRequests.length,
    pending: pendingRequests.length,
    approved: approvedRequests.length,
    rejected: rejectedRequests.length,
    approvalRate: leaveRequests.length > 0 ? 
      Math.round((approvedRequests.length / leaveRequests.length) * 100) : 0
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Leave Requests</h1>
          <p className="text-gray-600">
            {isAdmin 
              ? 'Manage employee leave requests and approvals'
              : 'View leave requests (approval/rejection restricted to administrators)'
            }
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            onClick={loadLeaveRequests}
            disabled={isRefreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button onClick={() => setIsFormOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Request
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white rounded-xl shadow-soft p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Requests</p>
              <p className="text-xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg">
              <Users className="h-4 w-4 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-soft p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending</p>
              <p className="text-xl font-bold text-yellow-600">{stats.pending}</p>
            </div>
            <div className="p-3 bg-yellow-50 rounded-lg">
              <AlertCircle className="h-4 w-4 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-soft p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Approved</p>
              <p className="text-xl font-bold text-green-600">{stats.approved}</p>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <CheckCircle className="h-4 w-4 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-soft p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Rejected</p>
              <p className="text-xl font-bold text-red-600">{stats.rejected}</p>
            </div>
            <div className="p-3 bg-red-50 rounded-lg">
              <XCircle className="h-4 w-4 text-red-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-soft p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Approval Rate</p>
              <p className="text-xl font-bold text-blue-600">{stats.approvalRate}%</p>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg">
              <Calendar className="h-4 w-4 text-blue-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-soft p-6 border border-gray-200">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search leave requests..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Filter className="h-4 w-4 text-gray-400" />
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Status</option>
              <option value={LEAVE_STATUS.PENDING}>Pending</option>
              <option value={LEAVE_STATUS.APPROVED}>Approved</option>
              <option value={LEAVE_STATUS.REJECTED}>Rejected</option>
            </select>
            <select
              value={filters.type}
              onChange={(e) => setFilters({ ...filters, type: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Types</option>
              <option value={LEAVE_TYPE.VACATION}>Vacation</option>
              <option value={LEAVE_TYPE.SICK}>Sick Leave</option>
              <option value={LEAVE_TYPE.UNPAID}>Unpaid Leave</option>
              <option value={LEAVE_TYPE.MATERNITY}>Maternity Leave</option>
              <option value={LEAVE_TYPE.PATERNITY}>Paternity Leave</option>
              <option value={LEAVE_TYPE.OTHER}>Other</option>
            </select>
          </div>
        </div>
      </div>

      {/* View Mode Toggle */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <h2 className="text-lg font-semibold text-gray-900">Leave Requests</h2>
          <span className="text-sm text-gray-500">
            ({filteredRequests.length} requests)
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant={viewMode === 'table' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('table')}
          >
            <List className="h-4 w-4 mr-2" />
            Table
          </Button>
          <Button
            variant={viewMode === 'cards' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('cards')}
          >
            <Grid className="h-4 w-4 mr-2" />
            Cards
          </Button>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error loading leave requests</h3>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Leave Requests */}
      {viewMode === 'table' ? (
        <LeaveRequestTable
          requests={filteredRequests}
          onApprove={handleApproveRequest}
          onReject={handleRejectRequest}
          onEdit={(request) => setEditingRequest(request)}
          onDelete={handleDeleteRequest}
          loading={loading}
          showActions={isAdmin}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredRequests.map((request) => (
            <LeaveRequestCard
              key={request.id}
              request={request}
              onApprove={handleApproveRequest}
              onReject={handleRejectRequest}
              onEdit={(request) => setEditingRequest(request)}
              onDelete={handleDeleteRequest}
              showActions={isAdmin}
              currentUserId={user?.id}
            />
          ))}
        </div>
      )}

      {/* Empty State */}
      {filteredRequests.length === 0 && !loading && (
        <div className="text-center py-12">
          <Calendar className="h-12 w-12 mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No leave requests found</h3>
          <p className="text-gray-500 mb-4">
            {!user?.employeeId 
              ? 'You need an employee record to create leave requests. Please contact your administrator to set up your employee profile.'
              : filters.search || filters.status || filters.type 
                ? 'Try adjusting your filters to see more results.'
                : 'Get started by creating a new leave request.'
            }
          </p>
          {!filters.search && !filters.status && !filters.type && (
            <Button 
              onClick={() => setIsFormOpen(true)}
              disabled={!user?.employeeId}
              title={!user?.employeeId ? "You need an employee record to create leave requests" : ""}
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Leave Request
            </Button>
          )}
        </div>
      )}

      {/* Leave Request Form Modal */}
      <LeaveRequestForm
        isOpen={isFormOpen || !!editingRequest}
        onClose={() => {
          setIsFormOpen(false);
          setEditingRequest(null);
        }}
        onSubmit={editingRequest ? handleEditRequest : handleCreateRequest}
        initialData={editingRequest}
        employeeId={user?.employeeId}
        loading={loading}
      />
    </motion.div>
  );
};

export default LeaveRequests;
