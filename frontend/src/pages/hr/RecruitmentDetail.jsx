import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft,
  Plus,
  Users,
  Calendar,
  Star,
  TrendingUp,
  Building,
  Mail,
  Phone,
  FileText,
  CheckCircle,
  XCircle,
  Clock,
  Edit,
  Trash2,
  Send,
  Download
} from 'lucide-react';

import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { useRecruitmentDetail, useCreateCandidate, useUpdateCandidateStage, useSetCandidateScore, useHireCandidate, useScheduleInterview } from './hooks/useRecruitment';
import { recruitmentUtils } from '../../api/recruitmentApi';
import { cn } from '../../lib/utils';

/**
 * Candidate Card Component
 */
const CandidateCard = ({ candidate, onUpdateStage, onSetScore, onScheduleInterview, onHire }) => {
  const stageInfo = recruitmentUtils.INTERVIEW_STAGES[candidate.stage];
  const nextStages = recruitmentUtils.getNextStages(candidate.stage);
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl shadow-soft border border-gray-200 p-6 hover:shadow-md transition-shadow"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-2">
            <h3 className="text-lg font-semibold text-gray-900">
              {candidate.firstName} {candidate.lastName}
            </h3>
            <span className={cn(
              'px-2 py-1 rounded-full text-xs font-medium',
              `bg-${stageInfo?.color}-100 text-${stageInfo?.color}-800`
            )}>
              {stageInfo?.label}
            </span>
          </div>
          
          <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
            <div className="flex items-center space-x-1">
              <Mail className="h-4 w-4" />
              <span>{candidate.email}</span>
            </div>
            {candidate.phone && (
              <div className="flex items-center space-x-1">
                <Phone className="h-4 w-4" />
                <span>{candidate.phone}</span>
              </div>
            )}
          </div>
          
          {candidate.score && (
            <div className="flex items-center space-x-2 mb-3">
              <Star className="h-4 w-4 text-yellow-500" />
              <span className="text-sm font-medium text-gray-900">
                Score: {candidate.score}/100
              </span>
              <span className={cn(
                'px-2 py-1 rounded-full text-xs font-medium',
                `bg-${recruitmentUtils.getScoreColor(candidate.score)}-100 text-${recruitmentUtils.getScoreColor(candidate.score)}-800`
              )}>
                {recruitmentUtils.getScoreLabel(candidate.score)}
              </span>
            </div>
          )}
          
          {candidate.feedback && (
            <p className="text-gray-700 text-sm mb-3">
              {candidate.feedback}
            </p>
          )}
          
          <div className="flex items-center space-x-2 text-xs text-gray-500">
            <Calendar className="h-3 w-3" />
            <span>Applied: {recruitmentUtils.formatDate(candidate.createdAt)}</span>
          </div>
        </div>
      </div>
      
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {nextStages.map(stage => (
            <Button
              key={stage}
              variant="outline"
              size="sm"
              onClick={() => onUpdateStage({ candidateId: candidate.id, stage })}
              className={cn(
                stage === 'REJECTED' && 'text-red-600 hover:text-red-700 hover:bg-red-50',
                stage === 'HIRED' && 'text-green-600 hover:text-green-700 hover:bg-green-50'
              )}
            >
              {recruitmentUtils.getStageLabel(stage)}
            </Button>
          ))}
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onSetScore(candidate.id)}
          >
            <Star className="h-4 w-4" />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onScheduleInterview(candidate.id)}
          >
            <Calendar className="h-4 w-4" />
          </Button>
          
          {candidate.stage === 'OFFER' && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onHire(candidate.id)}
              className="text-green-600 hover:text-green-700 hover:bg-green-50"
            >
              <CheckCircle className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

/**
 * Candidate Form Component
 */
const CandidateForm = ({ isOpen, onClose, onSubmit, jobId }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    resumeUrl: '',
  });
  
  const [errors, setErrors] = useState({});
  
  React.useEffect(() => {
    if (isOpen) {
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        resumeUrl: '',
      });
      setErrors({});
    }
  }, [isOpen]);
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    const validation = recruitmentUtils.validateCandidate(formData);
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }
    
    onSubmit({ jobId, data: formData });
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
      title="Add Candidate"
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              First Name *
            </label>
            <Input
              value={formData.firstName}
              onChange={(e) => handleChange('firstName', e.target.value)}
              placeholder="John"
              className={cn(errors.firstName && 'border-red-500')}
            />
            {errors.firstName && (
              <p className="text-sm text-red-600 mt-1">{errors.firstName}</p>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Last Name *
            </label>
            <Input
              value={formData.lastName}
              onChange={(e) => handleChange('lastName', e.target.value)}
              placeholder="Doe"
              className={cn(errors.lastName && 'border-red-500')}
            />
            {errors.lastName && (
              <p className="text-sm text-red-600 mt-1">{errors.lastName}</p>
            )}
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email *
          </label>
          <Input
            type="email"
            value={formData.email}
            onChange={(e) => handleChange('email', e.target.value)}
            placeholder="john.doe@example.com"
            className={cn(errors.email && 'border-red-500')}
          />
          {errors.email && (
            <p className="text-sm text-red-600 mt-1">{errors.email}</p>
          )}
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Phone
          </label>
          <Input
            type="tel"
            value={formData.phone}
            onChange={(e) => handleChange('phone', e.target.value)}
            placeholder="+1 (555) 123-4567"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Resume URL
          </label>
          <Input
            value={formData.resumeUrl}
            onChange={(e) => handleChange('resumeUrl', e.target.value)}
            placeholder="https://example.com/resume.pdf"
          />
        </div>
        
        <div className="flex justify-end space-x-3 pt-4">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit">
            Add Candidate
          </Button>
        </div>
      </form>
    </Modal>
  );
};

/**
 * Score Modal Component
 */
const ScoreModal = ({ isOpen, onClose, onSubmit, candidate }) => {
  const [score, setScore] = useState(candidate?.score || 0);
  const [feedback, setFeedback] = useState(candidate?.feedback || '');
  
  React.useEffect(() => {
    if (candidate) {
      setScore(candidate.score || 0);
      setFeedback(candidate.feedback || '');
    }
  }, [candidate]);
  
  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ candidateId: candidate.id, score, feedback });
  };
  
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Score Candidate: ${candidate?.firstName} ${candidate?.lastName}`}
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Score (0-100)
          </label>
          <Input
            type="number"
            min="0"
            max="100"
            value={score}
            onChange={(e) => setScore(Number(e.target.value))}
            className="w-full"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Feedback
          </label>
          <textarea
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-vertical"
            placeholder="Enter your feedback about the candidate..."
          />
        </div>
        
        <div className="flex justify-end space-x-3 pt-4">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit">
            Save Score
          </Button>
        </div>
      </form>
    </Modal>
  );
};

/**
 * Main Recruitment Detail Component
 */
const RecruitmentDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [showCandidateForm, setShowCandidateForm] = useState(false);
  const [showScoreModal, setShowScoreModal] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [stageFilter, setStageFilter] = useState('all');
  
  // Fetch recruitment data
  const {
    jobPosting,
    candidates,
    isLoading,
    hasError,
    refetchAll,
    createCandidate,
    updateCandidateStage,
    setCandidateScore,
    hireCandidate,
    scheduleInterview,
    isCreatingCandidate,
    isUpdatingStage,
    isSettingScore,
    isHiring,
    isSchedulingInterview,
  } = useRecruitmentDetail(id);
  
  // Filter candidates by stage
  const filteredCandidates = useMemo(() => {
    if (stageFilter === 'all') return candidates;
    return candidates.filter(candidate => candidate.stage === stageFilter);
  }, [candidates, stageFilter]);
  
  // Group candidates by stage
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
  
  // Event handlers
  const handleCreateCandidate = async ({ jobId, data }) => {
    const result = await createCandidate({ jobId, data });
    if (result) {
      setShowCandidateForm(false);
      refetchAll();
    }
  };
  
  const handleUpdateStage = async ({ candidateId, stage }) => {
    await updateCandidateStage({ candidateId, stage });
    refetchAll();
  };
  
  const handleSetScore = (candidateId) => {
    const candidate = candidates.find(c => c.id === candidateId);
    setSelectedCandidate(candidate);
    setShowScoreModal(true);
  };
  
  const handleSaveScore = async ({ candidateId, score, feedback }) => {
    await setCandidateScore({ candidateId, score, feedback });
    setShowScoreModal(false);
    setSelectedCandidate(null);
    refetchAll();
  };
  
  const handleHire = async (candidateId) => {
    if (window.confirm('Are you sure you want to hire this candidate?')) {
      // TODO: Open hire modal with employment details
      await hireCandidate({ candidateId, data: {} });
      refetchAll();
    }
  };
  
  const handleScheduleInterview = (candidateId) => {
    // TODO: Open interview scheduling modal
    console.log('Schedule interview for candidate:', candidateId);
  };
  
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
            <h1 className="text-2xl font-bold text-gray-900">{jobPosting.title}</h1>
            <div className="flex items-center space-x-4 text-gray-600">
              <div className="flex items-center space-x-1">
                <Building className="h-4 w-4" />
                <span>{jobPosting.department?.name}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Users className="h-4 w-4" />
                <span>{candidates.length} candidates</span>
              </div>
              <div className="flex items-center space-x-1">
                <Calendar className="h-4 w-4" />
                <span>{recruitmentUtils.formatDate(jobPosting.createdAt)}</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <Button variant="outline">
            <Edit className="h-4 w-4 mr-2" />
            Edit Job
          </Button>
          <Button onClick={() => setShowCandidateForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Candidate
          </Button>
        </div>
      </div>
      
      {/* Job Description */}
      <div className="bg-white rounded-xl shadow-soft p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Job Description</h2>
        <p className="text-gray-700 whitespace-pre-wrap">{jobPosting.description}</p>
      </div>
      
      {/* Candidates Section */}
      <div className="bg-white rounded-xl shadow-soft p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900">Candidates</h2>
          
          <div className="flex items-center space-x-3">
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
        
        {filteredCandidates.length === 0 ? (
          <div className="text-center py-12">
            <Users className="h-12 w-12 mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Candidates Found</h3>
            <p className="text-gray-600 mb-4">
              {stageFilter === 'all' 
                ? 'Get started by adding candidates to this job posting'
                : 'No candidates in this stage'
              }
            </p>
            {stageFilter === 'all' && (
              <Button onClick={() => setShowCandidateForm(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Candidate
              </Button>
            )}
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <AnimatePresence>
              {filteredCandidates.map((candidate) => (
                <CandidateCard
                  key={candidate.id}
                  candidate={candidate}
                  onUpdateStage={handleUpdateStage}
                  onSetScore={handleSetScore}
                  onScheduleInterview={handleScheduleInterview}
                  onHire={handleHire}
                />
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
      
      {/* Candidate Form Modal */}
      <CandidateForm
        isOpen={showCandidateForm}
        onClose={() => setShowCandidateForm(false)}
        onSubmit={handleCreateCandidate}
        jobId={id}
      />
      
      {/* Score Modal */}
      <ScoreModal
        isOpen={showScoreModal}
        onClose={() => {
          setShowScoreModal(false);
          setSelectedCandidate(null);
        }}
        onSubmit={handleSaveScore}
        candidate={selectedCandidate}
      />
    </motion.div>
  );
};

export default RecruitmentDetail;