import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, 
  Search, 
  Filter, 
  Eye, 
  Edit, 
  Archive, 
  Users, 
  Calendar,
  TrendingUp,
  Building,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { useJobPostings, useCreateJobPosting, useArchiveJobPosting } from './hooks/useRecruitment';
import { recruitmentUtils } from '../../api/recruitmentApi';
import { cn } from '../../lib/utils';

/**
 * Job Posting Card Component
 */
const JobPostingCard = ({ jobPosting, onView, onEdit, onArchive, onViewCandidates }) => {
  const statusColor = recruitmentUtils.getJobStatusColor(jobPosting.isActive);
  const statusLabel = recruitmentUtils.getJobStatusLabel(jobPosting.isActive);
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl shadow-soft border border-gray-200 p-6 hover:shadow-md transition-shadow"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-2">
            <h3 className="text-lg font-semibold text-gray-900">{jobPosting.title}</h3>
            <span className={cn(
              'px-2 py-1 rounded-full text-xs font-medium',
              statusColor === 'green' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
            )}>
              {statusLabel}
            </span>
          </div>
          
          <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
            <div className="flex items-center space-x-1">
              <Building className="h-4 w-4" />
              <span>{jobPosting.department?.name}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Calendar className="h-4 w-4" />
              <span>{recruitmentUtils.formatDate(jobPosting.createdAt)}</span>
            </div>
          </div>
          
          <p className="text-gray-700 text-sm line-clamp-2 mb-4">
            {jobPosting.description}
          </p>
        </div>
      </div>
      
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4 text-sm text-gray-600">
          <div className="flex items-center space-x-1">
            <Users className="h-4 w-4" />
            <span>{jobPosting.candidates?.length || 0} candidates</span>
          </div>
          {jobPosting.skills && (
            <div className="flex items-center space-x-1">
              <CheckCircle className="h-4 w-4" />
              <span>{jobPosting.skills.length} skills required</span>
            </div>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onViewCandidates(jobPosting.id)}
          >
            <Users className="h-4 w-4 mr-1" />
            Candidates
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onView(jobPosting.id)}
          >
            <Eye className="h-4 w-4" />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(jobPosting.id)}
          >
            <Edit className="h-4 w-4" />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onArchive(jobPosting.id)}
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <Archive className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

/**
 * Job Posting Form Component
 */
const JobPostingForm = ({ isOpen, onClose, onSubmit, jobPosting = null, departments = [] }) => {
  const [formData, setFormData] = useState({
    title: jobPosting?.title || '',
    description: jobPosting?.description || '',
    departmentId: jobPosting?.departmentId || '',
    isActive: jobPosting?.isActive ?? true,
  });
  
  const [errors, setErrors] = useState({});
  
  React.useEffect(() => {
    if (jobPosting) {
      setFormData({
        title: jobPosting.title,
        description: jobPosting.description,
        departmentId: jobPosting.departmentId,
        isActive: jobPosting.isActive,
      });
    } else {
      setFormData({
        title: '',
        description: '',
        departmentId: '',
        isActive: true,
      });
    }
    setErrors({});
  }, [jobPosting, isOpen]);
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    const validation = recruitmentUtils.validateJobPosting(formData);
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }
    
    onSubmit(formData);
  };
  
  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };
  
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={jobPosting ? 'Edit Job Posting' : 'Create Job Posting'}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Job Title *
          </label>
          <Input
            value={formData.title}
            onChange={(e) => handleChange('title', e.target.value)}
            placeholder="e.g., Senior Software Engineer"
            className={cn(errors.title && 'border-red-500')}
          />
          {errors.title && (
            <p className="text-sm text-red-600 mt-1">{errors.title}</p>
          )}
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Department *
          </label>
          <select
            value={formData.departmentId}
            onChange={(e) => handleChange('departmentId', e.target.value)}
            className={cn(
              'w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent',
              errors.departmentId && 'border-red-500'
            )}
          >
            <option value="">Select department</option>
            {departments.map(dept => (
              <option key={dept.id} value={dept.id}>
                {dept.name}
              </option>
            ))}
          </select>
          {errors.departmentId && (
            <p className="text-sm text-red-600 mt-1">{errors.departmentId}</p>
          )}
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Job Description *
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => handleChange('description', e.target.value)}
            placeholder="Describe the role, responsibilities, and requirements..."
            rows={6}
            className={cn(
              'w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-vertical',
              errors.description && 'border-red-500'
            )}
          />
          {errors.description && (
            <p className="text-sm text-red-600 mt-1">{errors.description}</p>
          )}
        </div>
        
        <div className="flex items-center space-x-3">
          <input
            type="checkbox"
            id="isActive"
            checked={formData.isActive}
            onChange={(e) => handleChange('isActive', e.target.checked)}
            className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
            Active job posting
          </label>
        </div>
        
        <div className="flex justify-end space-x-3 pt-4">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit">
            {jobPosting ? 'Update Job Posting' : 'Create Job Posting'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

/**
 * Main Recruitment List Component
 */
const RecruitmentList = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showJobForm, setShowJobForm] = useState(false);
  const [editingJob, setEditingJob] = useState(null);
  
  // Fetch job postings
  const { data: jobPostings = [], isLoading, error, refetch } = useJobPostings({
    search: searchTerm,
    status: statusFilter === 'all' ? undefined : statusFilter === 'active',
  });
  
  // Mutations
  const createJobMutation = useCreateJobPosting();
  const archiveJobMutation = useArchiveJobPosting();
  
  // Filter job postings based on search and status
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
  
  // Event handlers
  const handleCreateJob = async (jobData) => {
    const result = await createJobMutation.mutateAsync(jobData);
    if (result) {
      setShowJobForm(false);
      refetch();
    }
  };
  
  const handleEditJob = (jobId) => {
    const job = jobPostings.find(j => j.id === jobId);
    setEditingJob(job);
    setShowJobForm(true);
  };
  
  const handleArchiveJob = async (jobId) => {
    if (window.confirm('Are you sure you want to archive this job posting?')) {
      await archiveJobMutation.mutateAsync(jobId);
      refetch();
    }
  };
  
  const handleViewJob = (jobId) => {
    navigate(`/recruitment/${jobId}`);
  };
  
  const handleViewCandidates = (jobId) => {
    navigate(`/recruitment/${jobId}/candidates`);
  };
  
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
      <div className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Recruitment</h1>
        <p className="text-gray-600">Manage job postings and candidate applications</p>
        </div>
        <Button onClick={() => setShowJobForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Job Posting
        </Button>
      </div>
      
      {/* Filters and Search */}
      <div className="bg-white rounded-xl shadow-soft p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search job postings..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <Filter className="h-4 w-4 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="archived">Archived</option>
            </select>
          </div>
        </div>
      </div>
      
      {/* Job Postings Grid */}
      {isLoading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl shadow-soft p-6 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2 mb-4"></div>
              <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-2/3"></div>
            </div>
          ))}
        </div>
      ) : filteredJobPostings.length === 0 ? (
        <div className="text-center py-12">
          <Building className="h-12 w-12 mx-auto text-gray-300 mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">No Job Postings Found</h2>
          <p className="text-gray-600 mb-4">
            {searchTerm || statusFilter !== 'all' 
              ? 'Try adjusting your search or filters'
              : 'Get started by creating your first job posting'
            }
          </p>
          {!searchTerm && statusFilter === 'all' && (
            <Button onClick={() => setShowJobForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Job Posting
            </Button>
          )}
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
          <AnimatePresence>
            {filteredJobPostings.map((jobPosting) => (
              <JobPostingCard
                key={jobPosting.id}
                jobPosting={jobPosting}
                onView={handleViewJob}
                onEdit={handleEditJob}
                onArchive={handleArchiveJob}
                onViewCandidates={handleViewCandidates}
              />
            ))}
          </AnimatePresence>
        </div>
      )}
      
      {/* Job Posting Form Modal */}
      <JobPostingForm
        isOpen={showJobForm}
        onClose={() => {
          setShowJobForm(false);
          setEditingJob(null);
        }}
        onSubmit={handleCreateJob}
        jobPosting={editingJob}
        departments={[]} // TODO: Fetch departments
      />
    </motion.div>
  );
};

export default RecruitmentList;