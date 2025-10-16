import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus,
  AlertCircle
} from 'lucide-react';

import { Button } from '../../components/ui/Button';
import { 
  InterviewStatistics,
  InterviewFilters,
  InterviewCard,
  InterviewForm,
  InterviewEmptyState
} from './components/recuirementComponents';
import { 
  useAllInterviews,
  useAllCandidatesForInterviews,
  useInterviewers,
  useScheduleInterview,
  useUpdateInterview,
  useDeleteInterview
} from './hooks/useInterviews';
import ConfirmationModal from '../../components/ui/ConfirmationModal';

/**
 * Interviews Management Component
 * Comprehensive interview scheduling and management dashboard
 */
const InterviewsManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [showInterviewForm, setShowInterviewForm] = useState(false);
  const [editingInterview, setEditingInterview] = useState(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState({
    isOpen: false,
    interviewId: null,
    candidateName: '',
  });

  // Data fetching
  const { data: interviews = [], isLoading, error } = useAllInterviews();
  const { data: candidates = [] } = useAllCandidatesForInterviews();
  const { data: interviewers = [] } = useInterviewers();

  // Mutations
  const scheduleInterviewMutation = useScheduleInterview();
  const updateInterviewMutation = useUpdateInterview();
  const deleteInterviewMutation = useDeleteInterview();

  // Filter interviews
  const filteredInterviews = useMemo(() => {
    return interviews.filter(interview => {
      const matchesSearch = !searchTerm || 
        interview.candidate?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        interview.candidate?.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        interview.interviewer?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        interview.interviewer?.lastName?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = statusFilter === 'all' || interview.status === statusFilter;
      const matchesType = typeFilter === 'all' || interview.type === typeFilter;

      return matchesSearch && matchesStatus && matchesType;
    });
  }, [interviews, searchTerm, statusFilter, typeFilter]);

  // Calculate statistics
  const stats = useMemo(() => {
    const total = interviews.length;
    const scheduled = interviews.filter(i => i.status === 'SCHEDULED').length;
    const completed = interviews.filter(i => i.status === 'COMPLETED').length;
    const cancelled = interviews.filter(i => i.status === 'CANCELLED').length;

    return { total, scheduled, completed, cancelled };
  }, [interviews]);

  // Event handlers
  const handleScheduleInterview = () => {
    setEditingInterview(null);
    setShowInterviewForm(true);
  };

  const handleEditInterview = (interview) => {
    setEditingInterview(interview);
    setShowInterviewForm(true);
  };

  const handleDeleteInterview = (interview) => {
    setDeleteConfirmation({
      isOpen: true,
      interviewId: interview.id,
      candidateName: `${interview.candidate?.firstName} ${interview.candidate?.lastName}`,
    });
  };

  const confirmDeleteInterview = async () => {
    try {
      await deleteInterviewMutation.mutateAsync(deleteConfirmation.interviewId);
      setDeleteConfirmation({ isOpen: false, interviewId: null, candidateName: '' });
    } catch (error) {
      console.error('Error deleting interview:', error);
    }
  };

  const cancelDeleteInterview = () => {
    setDeleteConfirmation({ isOpen: false, interviewId: null, candidateName: '' });
  };

  const handleSubmitInterview = async (formData) => {
    if (editingInterview) {
      await updateInterviewMutation.mutateAsync({
        id: editingInterview.id,
        data: formData
      });
    } else {
      await scheduleInterviewMutation.mutateAsync(formData);
    }
  };

  const handleCloseInterviewForm = () => {
    setShowInterviewForm(false);
    setEditingInterview(null);
  };

  // Error state
  if (error) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="h-12 w-12 mx-auto text-red-500 mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Interviews</h2>
        <p className="text-gray-600 mb-4">{error.message}</p>
        <Button onClick={() => window.location.reload()}>
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Interview Management</h1>
          <p className="text-gray-600">Schedule and manage all interviews</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button onClick={handleScheduleInterview}>
            <Plus className="h-4 w-4 mr-2" />
            Schedule Interview
          </Button>
        </div>
      </div>

      {/* Statistics */}
      <InterviewStatistics stats={stats} />

      {/* Filters */}
      <InterviewFilters
        searchTerm={searchTerm}
        statusFilter={statusFilter}
        typeFilter={typeFilter}
        onSearchChange={setSearchTerm}
        onStatusFilterChange={setStatusFilter}
        onTypeFilterChange={setTypeFilter}
        isLoading={isLoading}
      />

      {/* Interviews List */}
      <div className="bg-white rounded-xl shadow-soft overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Recent Interviews</h3>
        </div>
        
        {isLoading ? (
          <div className="p-6">
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="bg-gray-50 rounded-lg p-4 animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          </div>
        ) : filteredInterviews.length === 0 ? (
          <InterviewEmptyState 
            hasInterviews={interviews.length > 0}
            onCreateInterview={handleScheduleInterview}
          />
        ) : (
          <div className="divide-y divide-gray-200">
            <AnimatePresence>
              {filteredInterviews.map((interview) => (
                <InterviewCard
                  key={interview.id}
                  interview={interview}
                  onEdit={handleEditInterview}
                  onDelete={handleDeleteInterview}
                  isLoading={scheduleInterviewMutation.isPending || updateInterviewMutation.isPending}
                />
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Interview Form Modal */}
      <InterviewForm
        isOpen={showInterviewForm}
        onClose={handleCloseInterviewForm}
        onSubmit={handleSubmitInterview}
        interview={editingInterview}
        candidates={candidates}
        interviewers={interviewers}
        isLoading={scheduleInterviewMutation.isPending || updateInterviewMutation.isPending}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={deleteConfirmation.isOpen}
        onClose={cancelDeleteInterview}
        onConfirm={confirmDeleteInterview}
        title="Delete Interview"
        message={`Are you sure you want to delete the interview with ${deleteConfirmation.candidateName}? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
        isLoading={deleteInterviewMutation.isPending}
      />
    </motion.div>
  );
};

export default InterviewsManagement;