import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, Archive, Trash2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import toast from 'react-hot-toast';

import { Button } from '../../components/ui/Button';
import ConfirmationModal from '../../components/ui/ConfirmationModal';
import { useJobPostings, useCreateJobPosting, useUpdateJobPosting, useArchiveJobPosting, useDeleteJobPosting } from './hooks/useRecruitment';
import { 
  JobPostingsHeader,
  JobPostingsFilters,
  JobPostingsGrid,
  EmptyState,
  JobPostingForm
} from './components/recuirementComponents';
import employeeApi from '../../api/employeeApi';
import { queryKeys } from '../../lib/react-query';

/**
 * Main Recruitment List Component
 * Manages job postings with search, filtering, and CRUD operations
 */
const RecruitmentList = () => {
  const navigate = useNavigate();
  
  // State management
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showJobForm, setShowJobForm] = useState(false);
  const [editingJob, setEditingJob] = useState(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState({
    isOpen: false,
    jobId: null,
    jobTitle: '',
    action: 'archive', // 'archive' or 'delete'
  });
  
  // Data fetching
  const { data: jobPostings = [], isLoading, error, refetch } = useJobPostings({
    search: searchTerm,
    status: statusFilter === 'all' ? undefined : statusFilter === 'active',
  });
  const { data: departments = [] } = useQuery({
    queryKey: queryKeys.departments.list,
    queryFn: async () => {
      const res = await employeeApi.listDepartments();
      return res.data.data || [];
    },
    staleTime: 5 * 60 * 1000,
  });
  
  // Mutations
  const createJobMutation = useCreateJobPosting();
  const updateJobMutation = useUpdateJobPosting();
  const archiveJobMutation = useArchiveJobPosting();
  const deleteJobMutation = useDeleteJobPosting();
  
  // Computed values
  const filteredJobPostings = useMemo(() => {
    return jobPostings.filter(job => {
      const matchesSearch = !searchTerm || 
        job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.department?.name.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || 
        (statusFilter === 'active' && job.isActive) ||
        (statusFilter === 'archived' && !job.isActive);
      
      return matchesSearch && matchesStatus;
    });
  }, [jobPostings, searchTerm, statusFilter]);
  
  const totalJobs = jobPostings.length;
  const activeJobs = jobPostings.filter(job => job.isActive).length;
  const hasFilters = searchTerm || statusFilter !== 'all';
  
  // Event handlers
  const handleCreateJob = async (jobData) => {
    try {
      await createJobMutation.mutateAsync(jobData);
      setShowJobForm(false);
      refetch();
    } catch (error) {
      console.error('Error creating job posting:', error);
    }
  };
  
  const handleUpdateJob = async (jobData) => {
    try {
      await updateJobMutation.mutateAsync({ id: editingJob.id, data: jobData });
      setShowJobForm(false);
      setEditingJob(null);
      refetch();
    } catch (error) {
      console.error('Error updating job posting:', error);
    }
  };
  
  const handleEditJob = (jobId) => {
    const job = jobPostings.find(j => j.id === jobId);
    setEditingJob(job);
    setShowJobForm(true);
  };
  
  const handleArchiveJob = (jobId) => {
    const job = jobPostings.find(j => j.id === jobId);
    if (!job) return;
    
    setDeleteConfirmation({
      isOpen: true,
      jobId,
      jobTitle: job.title,
      action: 'archive',
    });
  };

  const handleDeleteJob = (jobId) => {
    const job = jobPostings.find(j => j.id === jobId);
    if (!job) return;
    
    setDeleteConfirmation({
      isOpen: true,
      jobId,
      jobTitle: job.title,
      action: 'delete',
    });
  };

  const confirmJobAction = async () => {
    const { jobId, action } = deleteConfirmation;
    
    try {
      if (action === 'archive') {
        await archiveJobMutation.mutateAsync(jobId);
      } else if (action === 'delete') {
        await deleteJobMutation.mutateAsync(jobId);
      }
      
      refetch();
      setDeleteConfirmation({ isOpen: false, jobId: null, jobTitle: '', action: 'archive' });
    } catch (error) {
      console.error(`Error ${deleteConfirmation.action}ing job posting:`, error);
      
      const errorMessage = error.response?.data?.message || 
        `Failed to ${deleteConfirmation.action} job posting`;
      
      toast.error(errorMessage);
    }
  };

  const cancelJobAction = () => {
    setDeleteConfirmation({ isOpen: false, jobId: null, jobTitle: '', action: 'archive' });
  };
  
  const handleViewJob = (jobId) => {
    navigate(`/recruitment/${jobId}`);
  };
  
  const handleViewCandidates = (jobId) => {
    navigate(`/recruitment/${jobId}/candidates`);
  };
  
  const handleAddCandidate = (jobId) => {
    navigate(`/recruitment/${jobId}/candidates`);
  };
  
  const handleClearFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
  };
  
  const handleCloseJobForm = () => {
    setShowJobForm(false);
    setEditingJob(null);
  };
  
  // Error state
  if (error) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="h-12 w-12 mx-auto text-red-500 mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Job Postings</h2>
        <p className="text-gray-600 mb-4">{error.message}</p>
        <Button onClick={() => refetch()}>
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
      <JobPostingsHeader
        onCreateJobPosting={() => setShowJobForm(true)}
        isLoading={isLoading}
        totalJobs={totalJobs}
        activeJobs={activeJobs}
      />
      
      {/* Filters */}
      <JobPostingsFilters
        searchTerm={searchTerm}
        statusFilter={statusFilter}
        onSearchChange={setSearchTerm}
        onStatusFilterChange={setStatusFilter}
        isLoading={isLoading}
      />
      
      {/* Content */}
      {filteredJobPostings.length === 0 && !isLoading ? (
        <EmptyState
          hasFilters={hasFilters}
          onCreateJobPosting={() => setShowJobForm(true)}
          onClearFilters={handleClearFilters}
          isLoading={isLoading}
        />
      ) : (
        <JobPostingsGrid
          jobPostings={filteredJobPostings}
          onView={handleViewJob}
          onEdit={handleEditJob}
          onArchive={handleArchiveJob}
          onDelete={handleDeleteJob}
          onViewCandidates={handleViewCandidates}
          onAddCandidate={handleAddCandidate}
          isLoading={isLoading}
        />
      )}
      
      {/* Job Posting Form Modal */}
      <JobPostingForm
        isOpen={showJobForm}
        onClose={handleCloseJobForm}
        onSubmit={editingJob ? handleUpdateJob : handleCreateJob}
        jobPosting={editingJob}
        departments={departments}
        isLoading={editingJob ? updateJobMutation.isPending : createJobMutation.isPending}
      />
      
      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={deleteConfirmation.isOpen}
        onClose={cancelJobAction}
        onConfirm={confirmJobAction}
        title={deleteConfirmation.action === 'archive' ? 'Archive Job Posting' : 'Delete Job Posting'}
        message={
          deleteConfirmation.action === 'archive' 
            ? `Are you sure you want to archive "${deleteConfirmation.jobTitle}"? This will hide it from active job postings but preserve all data.`
            : `Are you sure you want to permanently delete "${deleteConfirmation.jobTitle}"? This action cannot be undone and will remove all associated data including candidates and applications.`
        }
        confirmText={deleteConfirmation.action === 'archive' ? 'Archive' : 'Delete'}
        cancelText="Cancel"
        type={deleteConfirmation.action === 'archive' ? 'warning' : 'danger'}
        isLoading={deleteConfirmation.action === 'archive' ? archiveJobMutation.isPending : deleteJobMutation.isPending}
        icon={deleteConfirmation.action === 'archive' ? Archive : Trash2}
      />
    </motion.div>
  );
};

export default RecruitmentList;