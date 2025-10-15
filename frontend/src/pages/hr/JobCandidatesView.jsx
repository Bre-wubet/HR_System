import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft,
  Plus,
  Users,
  Calendar,
  Star,
  Filter,
  Search,
  Eye,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react';

import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { useJobPosting, useCandidatesForJob, useCreateCandidate, useUpdateCandidateStage, useSetCandidateScore, useHireCandidate } from './hooks/useRecruitment';
import { recruitmentUtils } from '../../api/recruitmentApi';
import { cn } from '../../lib/utils';
import CandidateCard from './components/CandidateCard';
import CandidateForm from './components/CandidateForm';
import ScoreModal from './components/ScoreModal';
import HireModal from './components/HireModal';

/**
 * Job Candidates View Component
 * Displays all candidates for a specific job posting
 */
const JobCandidatesView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // State management
  const [searchTerm, setSearchTerm] = useState('');
  const [stageFilter, setStageFilter] = useState('all');
  const [showCandidateForm, setShowCandidateForm] = useState(false);
  const [showScoreModal, setShowScoreModal] = useState(false);
  const [showHireModal, setShowHireModal] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [editingCandidate, setEditingCandidate] = useState(null);
  
  // Data fetching
  const { data: jobPosting, isLoading: isLoadingJob, error: jobError } = useJobPosting(id);
  const { data: candidates = [], isLoading: isLoadingCandidates, error: candidatesError, refetch: refetchCandidates } = useCandidatesForJob(id);
  
  // Mutations
  const createCandidateMutation = useCreateCandidate();
  const updateStageMutation = useUpdateCandidateStage();
  const setScoreMutation = useSetCandidateScore();
  const hireMutation = useHireCandidate();
  
  // Computed values
  const filteredCandidates = useMemo(() => {
    let filtered = candidates;
    
    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(candidate =>
        candidate.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        candidate.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        candidate.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Filter by stage
    if (stageFilter !== 'all') {
      filtered = filtered.filter(candidate => candidate.stage === stageFilter);
    }
    
    return filtered;
  }, [candidates, searchTerm, stageFilter]);
  
  const candidatesByStage = useMemo(() => {
    const groups = {};
    filteredCandidates.forEach(candidate => {
      if (!groups[candidate.stage]) {
        groups[candidate.stage] = [];
      }
      groups[candidate.stage].push(candidate);
    });
    return groups;
  }, [filteredCandidates]);
  
  const isLoading = isLoadingJob || isLoadingCandidates;
  const hasError = jobError || candidatesError;
  
  // Event handlers
  const handleCreateCandidate = async ({ jobId, data }) => {
    try {
      await createCandidateMutation.mutateAsync({ jobId, data });
      setShowCandidateForm(false);
      refetchCandidates();
    } catch (error) {
      console.error('Error creating candidate:', error);
    }
  };
  
  const handleUpdateStage = async ({ candidateId, stage }) => {
    try {
      await updateStageMutation.mutateAsync({ candidateId, stage });
      refetchCandidates();
    } catch (error) {
      console.error('Error updating candidate stage:', error);
    }
  };
  
  const handleSetScore = (candidateId) => {
    const candidate = candidates.find(c => c.id === candidateId);
    setSelectedCandidate(candidate);
    setShowScoreModal(true);
  };
  
  const handleSaveScore = async ({ candidateId, score, feedback }) => {
    try {
      await setScoreMutation.mutateAsync({ candidateId, score, feedback });
      setShowScoreModal(false);
      setSelectedCandidate(null);
      refetchCandidates();
    } catch (error) {
      console.error('Error saving score:', error);
    }
  };
  
  const handleHire = (candidateId) => {
    const candidate = candidates.find(c => c.id === candidateId);
    setSelectedCandidate(candidate);
    setShowHireModal(true);
  };
  
  const handleHireCandidate = async (hireData) => {
    try {
      await hireMutation.mutateAsync({ candidateId: selectedCandidate.id, data: hireData });
      setShowHireModal(false);
      setSelectedCandidate(null);
      refetchCandidates();
    } catch (error) {
      console.error('Error hiring candidate:', error);
    }
  };
  
  const handleEditCandidate = (candidateId) => {
    const candidate = candidates.find(c => c.id === candidateId);
    setEditingCandidate(candidate);
    setShowCandidateForm(true);
  };
  
  const handleDeleteCandidate = async (candidateId) => {
    if (window.confirm('Are you sure you want to delete this candidate?')) {
      // TODO: Implement delete candidate mutation
      console.log('Delete candidate:', candidateId);
    }
  };
  
  const handleScheduleInterview = (candidateId) => {
    // TODO: Implement interview scheduling
    console.log('Schedule interview for candidate:', candidateId);
  };
  
  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-6"></div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl shadow-soft p-6 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2 mb-4"></div>
                <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }
  
  // Error state
  if (hasError || !jobPosting) {
    return (
      <div className="text-center py-12">
        <XCircle className="h-12 w-12 mx-auto text-red-500 mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Job Posting Not Found</h2>
        <p className="text-gray-600 mb-4">The job posting you're looking for doesn't exist.</p>
        <Button onClick={() => navigate('/recruitment')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Recruitment
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
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/recruitment')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Recruitment
          </Button>
          
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Candidates for {jobPosting.title}
            </h1>
            <div className="flex items-center space-x-4 text-gray-600">
              <div className="flex items-center space-x-1">
                <Users className="h-4 w-4" />
                <span>{candidates.length} total candidates</span>
              </div>
              <div className="flex items-center space-x-1">
                <Calendar className="h-4 w-4" />
                <span>Posted: {recruitmentUtils.formatDate(jobPosting.createdAt)}</span>
              </div>
            </div>
          </div>
        </div>
        
        <Button onClick={() => setShowCandidateForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Candidate
        </Button>
      </div>
      
      {/* Filters */}
      <div className="bg-white rounded-xl shadow-soft border border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search candidates..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <Filter className="h-4 w-4 text-gray-400" />
            <select
              value={stageFilter}
              onChange={(e) => setStageFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Stages</option>
              {Object.entries(recruitmentUtils.INTERVIEW_STAGES).map(([stage, info]) => (
                <option key={stage} value={stage}>
                  {info.label}
                </option>
              ))}
            </select>
          </div>
        </div>
        
        {/* Filter indicators */}
        {(searchTerm || stageFilter !== 'all') && (
          <div className="flex items-center space-x-2 mt-4 pt-4 border-t border-gray-100">
            <span className="text-sm text-gray-500">Active filters:</span>
            {searchTerm && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                Search: "{searchTerm}"
              </span>
            )}
            {stageFilter !== 'all' && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                Stage: {recruitmentUtils.getStageLabel(stageFilter)}
              </span>
            )}
          </div>
        )}
      </div>
      
      {/* Candidates Grid */}
      {filteredCandidates.length === 0 ? (
        <div className="text-center py-12">
          <Users className="h-12 w-12 mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Candidates Found</h3>
          <p className="text-gray-600 mb-4">
            {searchTerm || stageFilter !== 'all'
              ? 'Try adjusting your search or filters'
              : 'Get started by adding candidates to this job posting'
            }
          </p>
          {!searchTerm && stageFilter === 'all' && (
            <Button onClick={() => setShowCandidateForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Candidate
            </Button>
          )}
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
          <AnimatePresence>
            {filteredCandidates.map((candidate) => (
              <CandidateCard
                key={candidate.id}
                candidate={candidate}
                onUpdateStage={handleUpdateStage}
                onSetScore={handleSetScore}
                onScheduleInterview={handleScheduleInterview}
                onHire={handleHire}
                onEditCandidate={handleEditCandidate}
                onDeleteCandidate={handleDeleteCandidate}
                isLoading={isLoading}
              />
            ))}
          </AnimatePresence>
        </div>
      )}
      
      {/* Modals */}
      <CandidateForm
        isOpen={showCandidateForm}
        onClose={() => {
          setShowCandidateForm(false);
          setEditingCandidate(null);
        }}
        onSubmit={handleCreateCandidate}
        jobId={id}
        candidate={editingCandidate}
        isLoading={createCandidateMutation.isPending}
      />
      
      <ScoreModal
        isOpen={showScoreModal}
        onClose={() => {
          setShowScoreModal(false);
          setSelectedCandidate(null);
        }}
        onSubmit={handleSaveScore}
        candidate={selectedCandidate}
        isLoading={setScoreMutation.isPending}
      />
      
      <HireModal
        isOpen={showHireModal}
        onClose={() => {
          setShowHireModal(false);
          setSelectedCandidate(null);
        }}
        onSubmit={handleHireCandidate}
        candidate={selectedCandidate}
        jobPosting={jobPosting}
        isLoading={hireMutation.isPending}
      />
    </motion.div>
  );
};

export default JobCandidatesView;
