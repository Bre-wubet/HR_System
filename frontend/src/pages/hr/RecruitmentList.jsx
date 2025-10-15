import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';

import { Button } from '../../components/ui/Button';
import { useJobPostings, useCreateJobPosting, useArchiveJobPosting } from './hooks/useRecruitment';
import { 
  JobPostingsHeader,
  JobPostingsFilters,
  JobPostingsGrid,
  EmptyState,
  JobPostingForm
} from './components';

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
  
  // Data fetching
  const { data: jobPostings = [], isLoading, error, refetch } = useJobPostings({
    search: searchTerm,
    status: statusFilter === 'all' ? undefined : statusFilter === 'active',
  });
  
  // Mutations
  const createJobMutation = useCreateJobPosting();
  const archiveJobMutation = useArchiveJobPosting();
  
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
  
  const handleEditJob = (jobId) => {
    const job = jobPostings.find(j => j.id === jobId);
    setEditingJob(job);
    setShowJobForm(true);
  };
  
  const handleArchiveJob = async (jobId) => {
    if (window.confirm('Are you sure you want to archive this job posting?')) {
      try {
        await archiveJobMutation.mutateAsync(jobId);
        refetch();
      } catch (error) {
        console.error('Error archiving job posting:', error);
      }
    }
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
          onViewCandidates={handleViewCandidates}
          onAddCandidate={handleAddCandidate}
          isLoading={isLoading}
        />
      )}
      
      {/* Job Posting Form Modal */}
      <JobPostingForm
        isOpen={showJobForm}
        onClose={handleCloseJobForm}
        onSubmit={handleCreateJob}
        jobPosting={editingJob}
        departments={[]} // TODO: Fetch departments from API
        isLoading={createJobMutation.isPending}
      />
    </motion.div>
  );
};

export default RecruitmentList;