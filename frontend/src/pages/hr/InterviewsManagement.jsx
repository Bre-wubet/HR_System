import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar, 
  Clock, 
  User, 
  MapPin, 
  Video, 
  Phone,
  Filter,
  Search,
  Plus,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';

import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../../api/axiosClient';
import { cn } from '../../lib/utils';

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
  const [selectedInterview, setSelectedInterview] = useState(null);

  const queryClient = useQueryClient();

  // Fetch all interviews by getting all candidates and their interviews
  const { data: interviews = [], isLoading, error } = useQuery({
    queryKey: ['interviews', 'global'],
    queryFn: async () => {
      // First get all job postings
      const jobsResponse = await apiClient.get('/hr/recruitment/jobs');
      const jobs = jobsResponse.data.data;
      
      // Then get candidates for each job
      const allCandidates = [];
      for (const job of jobs) {
        try {
          const candidatesResponse = await apiClient.get(`/hr/recruitment/jobs/${job.id}/candidates`);
          const jobCandidates = candidatesResponse.data.data.map(candidate => ({
            ...candidate,
            jobPosting: job,
            jobPostingId: job.id
          }));
          allCandidates.push(...jobCandidates);
        } catch (error) {
          console.warn(`Failed to fetch candidates for job ${job.id}:`, error);
        }
      }
      
      // Then get interviews for each candidate
      const allInterviews = [];
      for (const candidate of allCandidates) {
        try {
          const interviewsResponse = await apiClient.get(`/hr/recruitment/candidates/${candidate.id}/interviews`);
          const candidateInterviews = interviewsResponse.data.data.map(interview => ({
            ...interview,
            candidate: candidate,
            candidateId: candidate.id
          }));
          allInterviews.push(...candidateInterviews);
        } catch (error) {
          console.warn(`Failed to fetch interviews for candidate ${candidate.id}:`, error);
        }
      }
      
      return allInterviews;
    },
  });

  // Fetch candidates for interview scheduling using the same approach
  const { data: candidates = [] } = useQuery({
    queryKey: ['candidates', 'for-interviews'],
    queryFn: async () => {
      // First get all job postings
      const jobsResponse = await apiClient.get('/hr/recruitment/jobs');
      const jobs = jobsResponse.data.data;
      
      // Then get candidates for each job
      const allCandidates = [];
      for (const job of jobs) {
        try {
          const candidatesResponse = await apiClient.get(`/hr/recruitment/jobs/${job.id}/candidates`);
          const jobCandidates = candidatesResponse.data.data.map(candidate => ({
            ...candidate,
            jobPosting: job,
            jobPostingId: job.id
          }));
          allCandidates.push(...jobCandidates);
        } catch (error) {
          console.warn(`Failed to fetch candidates for job ${job.id}:`, error);
        }
      }
      
      return allCandidates;
    },
  });

  // Schedule interview mutation
  const scheduleInterviewMutation = useMutation({
    mutationFn: async (interviewData) => {
      const response = await apiClient.post('/hr/recruitment/interviews', interviewData);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['interviews'] });
      setShowInterviewForm(false);
      setEditingInterview(null);
    },
  });

  // Update interview mutation
  const updateInterviewMutation = useMutation({
    mutationFn: async ({ id, data }) => {
      const response = await apiClient.put(`/hr/recruitment/interviews/${id}`, data);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['interviews'] });
      setShowInterviewForm(false);
      setEditingInterview(null);
    },
  });

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

  // Group interviews by status
  const interviewsByStatus = useMemo(() => {
    const groups = {};
    interviews.forEach(interview => {
      if (!groups[interview.status]) {
        groups[interview.status] = [];
      }
      groups[interview.status].push(interview);
    });
    return groups;
  }, [interviews]);

  // Calculate statistics
  const stats = useMemo(() => {
    const total = interviews.length;
    const scheduled = interviews.filter(i => i.status === 'SCHEDULED').length;
    const completed = interviews.filter(i => i.status === 'COMPLETED').length;
    const cancelled = interviews.filter(i => i.status === 'CANCELLED').length;

    return { total, scheduled, completed, cancelled };
  }, [interviews]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'SCHEDULED':
        return 'bg-blue-100 text-blue-800';
      case 'COMPLETED':
        return 'bg-green-100 text-green-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      case 'RESCHEDULED':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'IN_PERSON':
        return MapPin;
      case 'VIDEO':
        return Video;
      case 'PHONE':
        return Phone;
      default:
        return Calendar;
    }
  };

  const handleScheduleInterview = () => {
    setEditingInterview(null);
    setShowInterviewForm(true);
  };

  const handleEditInterview = (interview) => {
    setEditingInterview(interview);
    setShowInterviewForm(true);
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
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-soft p-6">
          <div className="flex items-center space-x-3">
            <Calendar className="h-8 w-8 text-blue-600" />
            <div>
              <h3 className="text-sm font-semibold text-gray-900">Total Interviews</h3>
              <p className="text-xl font-bold text-blue-600">{stats.total}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-soft p-6">
          <div className="flex items-center space-x-3">
            <Clock className="h-8 w-8 text-yellow-600" />
            <div>
              <h3 className="text-sm font-semibold text-gray-900">Scheduled</h3>
              <p className="text-xl font-bold text-yellow-600">{stats.scheduled}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-soft p-6">
          <div className="flex items-center space-x-3">
            <CheckCircle className="h-8 w-8 text-green-600" />
            <div>
              <h3 className="text-sm font-semibold text-gray-900">Completed</h3>
              <p className="text-xl font-bold text-green-600">{stats.completed}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-soft p-6">
          <div className="flex items-center space-x-3">
            <XCircle className="h-8 w-8 text-red-600" />
            <div>
              <h3 className="text-sm font-semibold text-gray-900">Cancelled</h3>
              <p className="text-xl font-bold text-red-600">{stats.cancelled}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-soft p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search interviews..."
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
              <option value="SCHEDULED">Scheduled</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELLED">Cancelled</option>
              <option value="RESCHEDULED">Rescheduled</option>
            </select>
            
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Types</option>
              <option value="IN_PERSON">In Person</option>
              <option value="VIDEO">Video Call</option>
              <option value="PHONE">Phone Call</option>
            </select>
          </div>
        </div>
      </div>

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
          <div className="text-center py-12">
            <Calendar className="h-12 w-12 mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {interviews.length === 0 ? 'No Interviews Scheduled' : 'No Interviews Found'}
            </h3>
            <p className="text-gray-600 mb-4">
              {interviews.length === 0 
                ? 'Get started by scheduling your first interview'
                : 'Try adjusting your search or filters'
              }
            </p>
            {interviews.length === 0 && (
              <Button onClick={handleScheduleInterview}>
                <Plus className="h-4 w-4 mr-2" />
                Schedule First Interview
              </Button>
            )}
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            <AnimatePresence>
              {filteredInterviews.map((interview) => {
                const TypeIcon = getTypeIcon(interview.type);
                return (
                  <motion.div
                    key={interview.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="p-6 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="p-2 bg-blue-50 rounded-lg">
                          <TypeIcon className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <h4 className="text-lg font-semibold text-gray-900">
                            {interview.candidate?.firstName} {interview.candidate?.lastName}
                          </h4>
                          <p className="text-sm text-gray-600">
                            Interviewer: {interview.interviewer?.firstName} {interview.interviewer?.lastName}
                          </p>
                          <div className="flex items-center space-x-4 mt-1">
                            <span className="text-sm text-gray-500">
                              {new Date(interview.date).toLocaleDateString()} at {new Date(interview.date).toLocaleTimeString()}
                            </span>
                            <span className="text-sm text-gray-500">
                              Duration: {interview.duration} minutes
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        <span className={cn(
                          'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                          getStatusColor(interview.status)
                        )}>
                          {interview.status}
                        </span>
                        
                        <div className="flex items-center space-x-1">
                          <Button size="sm" variant="outline" onClick={() => handleEditInterview(interview)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Interview Form Modal */}
      <Modal
        isOpen={showInterviewForm}
        onClose={() => {
          setShowInterviewForm(false);
          setEditingInterview(null);
        }}
        title={editingInterview ? 'Edit Interview' : 'Schedule New Interview'}
        size="lg"
      >
        <div className="p-6">
          <p className="text-gray-600">
            {editingInterview ? 'Update interview details' : 'Interview scheduling form will be implemented here'}
          </p>
          <div className="mt-4 flex justify-end space-x-3">
            <Button variant="outline" onClick={() => setShowInterviewForm(false)}>
              Cancel
            </Button>
            <Button onClick={() => handleSubmitInterview({})}>
              {editingInterview ? 'Update Interview' : 'Schedule Interview'}
            </Button>
          </div>
        </div>
      </Modal>
    </motion.div>
  );
};

export default InterviewsManagement;
