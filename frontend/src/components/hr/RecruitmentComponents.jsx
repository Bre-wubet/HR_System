import React from 'react';
import { motion } from 'framer-motion';
import { 
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
  AlertCircle,
  Download,
  Send,
  Eye,
  Edit,
  Trash2,
  Plus,
  Filter,
  Search
} from 'lucide-react';

import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { recruitmentUtils } from '../../api/recruitmentApi';
import { cn } from '../../lib/utils';

/**
 * Recruitment Statistics Cards
 */
export const RecruitmentStats = ({ kpis, isLoading = false }) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white rounded-xl shadow-soft p-6 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
            <div className="h-8 bg-gray-200 rounded w-3/4"></div>
          </div>
        ))}
      </div>
    );
  }

  const stats = [
    {
      title: 'Active Job Postings',
      value: kpis?.activeJobs || 0,
      icon: Building,
      color: 'blue',
      change: kpis?.jobsChange || 0,
    },
    {
      title: 'Total Candidates',
      value: kpis?.totalCandidates || 0,
      icon: Users,
      color: 'green',
      change: kpis?.candidatesChange || 0,
    },
    {
      title: 'Interviews Scheduled',
      value: kpis?.scheduledInterviews || 0,
      icon: Calendar,
      color: 'orange',
      change: kpis?.interviewsChange || 0,
    },
    {
      title: 'Hiring Rate',
      value: `${kpis?.hiringRate || 0}%`,
      icon: TrendingUp,
      color: 'purple',
      change: kpis?.hiringRateChange || 0,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-xl shadow-soft p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={cn(
                'p-3 rounded-lg',
                stat.color === 'blue' && 'bg-blue-50 text-blue-600',
                stat.color === 'green' && 'bg-green-50 text-green-600',
                stat.color === 'orange' && 'bg-orange-50 text-orange-600',
                stat.color === 'purple' && 'bg-purple-50 text-purple-600',
              )}>
                <Icon className="h-6 w-6" />
              </div>
              {stat.change !== 0 && (
                <div className={cn(
                  'flex items-center space-x-1 text-sm font-medium',
                  stat.change > 0 ? 'text-green-600' : 'text-red-600'
                )}>
                  <TrendingUp className={cn(
                    'h-4 w-4',
                    stat.change < 0 && 'rotate-180'
                  )} />
                  <span>{Math.abs(stat.change)}%</span>
                </div>
              )}
            </div>
            
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</h3>
              <p className="text-sm text-gray-600">{stat.title}</p>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};

/**
 * Candidate Stage Progress Component
 */
export const CandidateStageProgress = ({ candidate, onStageChange }) => {
  const stages = Object.entries(recruitmentUtils.INTERVIEW_STAGES).sort(
    (a, b) => a[1].order - b[1].order
  );
  
  const currentStageIndex = stages.findIndex(([stage]) => stage === candidate.stage);
  
  return (
    <div className="bg-white rounded-xl shadow-soft p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Application Progress</h3>
      
      <div className="relative">
        <div className="flex items-center justify-between">
          {stages.map(([stage, info], index) => {
            const isCompleted = index < currentStageIndex;
            const isCurrent = index === currentStageIndex;
            const isUpcoming = index > currentStageIndex;
            
            return (
              <div key={stage} className="flex flex-col items-center space-y-2">
                <div className={cn(
                  'w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium',
                  isCompleted && 'bg-green-500 text-white',
                  isCurrent && 'bg-blue-500 text-white',
                  isUpcoming && 'bg-gray-200 text-gray-600'
                )}>
                  {isCompleted ? <CheckCircle className="h-4 w-4" /> : index + 1}
                </div>
                
                <div className="text-center">
                  <p className={cn(
                    'text-xs font-medium',
                    isCompleted && 'text-green-600',
                    isCurrent && 'text-blue-600',
                    isUpcoming && 'text-gray-500'
                  )}>
                    {info.label}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
        
        {/* Progress line */}
        <div className="absolute top-4 left-4 right-4 h-0.5 bg-gray-200 -z-10">
          <div 
            className="h-full bg-green-500 transition-all duration-300"
            style={{ width: `${(currentStageIndex / (stages.length - 1)) * 100}%` }}
          />
        </div>
      </div>
      
      <div className="mt-6">
        <p className="text-sm text-gray-600">
          Current stage: <span className="font-medium text-blue-600">
            {recruitmentUtils.getStageLabel(candidate.stage)}
          </span>
        </p>
      </div>
    </div>
  );
};

/**
 * Interview Schedule Component
 */
export const InterviewSchedule = ({ interviews = [], onScheduleInterview, onUpdateInterview }) => {
  const upcomingInterviews = interviews.filter(interview => 
    new Date(interview.date) > new Date()
  ).sort((a, b) => new Date(a.date) - new Date(b.date));
  
  const pastInterviews = interviews.filter(interview => 
    new Date(interview.date) <= new Date()
  ).sort((a, b) => new Date(b.date) - new Date(a.date));
  
  return (
    <div className="bg-white rounded-xl shadow-soft p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Interview Schedule</h3>
        <Button size="sm" onClick={() => onScheduleInterview()}>
          <Plus className="h-4 w-4 mr-2" />
          Schedule Interview
        </Button>
      </div>
      
      {interviews.length === 0 ? (
        <div className="text-center py-8">
          <Calendar className="h-12 w-12 mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500">No interviews scheduled</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Upcoming Interviews */}
          {upcomingInterviews.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-3">Upcoming Interviews</h4>
              <div className="space-y-3">
                {upcomingInterviews.map((interview) => (
                  <motion.div
                    key={interview.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200"
                  >
                    <div className="flex items-center space-x-3">
                      <Calendar className="h-5 w-5 text-blue-600" />
                      <div>
                        <p className="font-medium text-gray-900">
                          {interview.candidate?.firstName} {interview.candidate?.lastName}
                        </p>
                        <p className="text-sm text-gray-600">
                          {recruitmentUtils.formatDateTime(interview.date)}
                        </p>
                        {interview.interviewer && (
                          <p className="text-xs text-gray-500">
                            Interviewer: {interview.interviewer.firstName} {interview.interviewer.lastName}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onUpdateInterview(interview.id)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
          
          {/* Past Interviews */}
          {pastInterviews.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-3">Past Interviews</h4>
              <div className="space-y-3">
                {pastInterviews.map((interview) => (
                  <motion.div
                    key={interview.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200"
                  >
                    <div className="flex items-center space-x-3">
                      <Clock className="h-5 w-5 text-gray-600" />
                      <div>
                        <p className="font-medium text-gray-900">
                          {interview.candidate?.firstName} {interview.candidate?.lastName}
                        </p>
                        <p className="text-sm text-gray-600">
                          {recruitmentUtils.formatDateTime(interview.date)}
                        </p>
                        {interview.rating && (
                          <div className="flex items-center space-x-1 mt-1">
                            <Star className="h-3 w-3 text-yellow-500" />
                            <span className="text-xs text-gray-600">{interview.rating}/5</span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onUpdateInterview(interview.id)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

/**
 * Candidate Search and Filter Component
 */
export const CandidateSearchFilter = ({ 
  searchTerm, 
  onSearchChange, 
  stageFilter, 
  onStageFilterChange,
  scoreFilter,
  onScoreFilterChange 
}) => {
  return (
    <div className="bg-white rounded-xl shadow-soft p-6">
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Search */}
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search candidates..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        
        {/* Stage Filter */}
        <div className="flex items-center space-x-3">
          <Filter className="h-4 w-4 text-gray-400" />
          <select
            value={stageFilter}
            onChange={(e) => onStageFilterChange(e.target.value)}
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
        
        {/* Score Filter */}
        <div className="flex items-center space-x-3">
          <Star className="h-4 w-4 text-gray-400" />
          <select
            value={scoreFilter}
            onChange={(e) => onScoreFilterChange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Scores</option>
            <option value="excellent">Excellent (80+)</option>
            <option value="good">Good (60-79)</option>
            <option value="fair">Fair (40-59)</option>
            <option value="poor">Poor (<40)</option>
          </select>
        </div>
      </div>
    </div>
  );
};

/**
 * Recruitment Activity Feed Component
 */
export const RecruitmentActivityFeed = ({ activities = [] }) => {
  const getActivityIcon = (type) => {
    switch (type) {
      case 'candidate_added':
        return <Users className="h-4 w-4 text-blue-600" />;
      case 'interview_scheduled':
        return <Calendar className="h-4 w-4 text-green-600" />;
      case 'candidate_hired':
        return <CheckCircle className="h-4 w-4 text-emerald-600" />;
      case 'candidate_rejected':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'job_posting_created':
        return <Building className="h-4 w-4 text-purple-600" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-600" />;
    }
  };
  
  const getActivityColor = (type) => {
    switch (type) {
      case 'candidate_added':
        return 'bg-blue-50 border-blue-200';
      case 'interview_scheduled':
        return 'bg-green-50 border-green-200';
      case 'candidate_hired':
        return 'bg-emerald-50 border-emerald-200';
      case 'candidate_rejected':
        return 'bg-red-50 border-red-200';
      case 'job_posting_created':
        return 'bg-purple-50 border-purple-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };
  
  return (
    <div className="bg-white rounded-xl shadow-soft p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">Recent Activity</h3>
      
      {activities.length === 0 ? (
        <div className="text-center py-8">
          <AlertCircle className="h-12 w-12 mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500">No recent activity</p>
        </div>
      ) : (
        <div className="space-y-4">
          {activities.map((activity, index) => (
            <motion.div
              key={activity.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={cn(
                'flex items-start space-x-3 p-4 rounded-lg border',
                getActivityColor(activity.type)
              )}
            >
              <div className="flex-shrink-0 mt-0.5">
                {getActivityIcon(activity.type)}
              </div>
              
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900">
                  {activity.message}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {recruitmentUtils.formatDateTime(activity.createdAt)}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default {
  RecruitmentStats,
  CandidateStageProgress,
  InterviewSchedule,
  CandidateSearchFilter,
  RecruitmentActivityFeed,
};
