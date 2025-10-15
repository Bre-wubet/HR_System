import React from 'react';
import { motion } from 'framer-motion';
import { 
  Eye, 
  Edit, 
  Archive, 
  Users, 
  Calendar,
  Building,
  CheckCircle,
  Plus
} from 'lucide-react';

import { Button } from '../../../../components/ui/Button';
import { recruitmentUtils } from '../../../../api/recruitmentApi';
import { cn } from '../../../../lib/utils';

/**
 * Job Posting Card Component
 * Displays individual job posting information with actions
 */
const JobPostingCard = ({ 
  jobPosting, 
  onView, 
  onEdit, 
  onArchive, 
  onViewCandidates,
  onAddCandidate,
  isLoading = false 
}) => {
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
          {/* Job Title and Status */}
          <div className="flex items-center space-x-3 mb-2">
            <h3 className="text-lg font-semibold text-gray-900">{jobPosting.title}</h3>
            <span className={cn(
              'px-2 py-1 rounded-full text-xs font-medium',
              statusColor === 'green' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
            )}>
              {statusLabel}
            </span>
          </div>
          
          {/* Job Details */}
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
          
          {/* Job Description */}
          <p className="text-gray-700 text-sm line-clamp-2 mb-4">
            {jobPosting.description}
          </p>
        </div>
      </div>
      
      {/* Footer with Stats and Actions */}
      <div className="flex items-center justify-between">
        {/* Statistics */}
        <div className="flex items-center space-x-4 text-sm text-gray-600">
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-1">
              <Users className="h-4 w-4" />
              <span>{jobPosting.candidates?.length || 0}</span>
            </div>
            {onAddCandidate && (
              <button
                onClick={() => onAddCandidate(jobPosting.id)}
                disabled={isLoading}
                className="p-1 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-full transition-colors"
                title="Add candidate to this job"
              >
                <Plus className="h-3 w-3" />
              </button>
            )}
          </div>
          {jobPosting.skills && (
            <div className="flex items-center space-x-1">
              <CheckCircle className="h-4 w-4" />
              <span>{jobPosting.skills.length} skills required</span>
            </div>
          )}
        </div>
        
        {/* Action Buttons */}
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onViewCandidates(jobPosting.id)}
            disabled={isLoading}
            title={`View ${jobPosting.candidates?.length || 0} candidates for this job`}
            className="relative"
          >
            <Users className="h-4 w-4 mr-1" />
            Candidates
            {jobPosting.candidates?.length > 0 && (
              <span className="ml-1 px-1.5 py-0.5 text-xs bg-blue-100 text-blue-800 rounded-full">
                {jobPosting.candidates.length}
              </span>
            )}
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onView(jobPosting.id)}
            disabled={isLoading}
            title="View Details"
          >
            <Eye className="h-4 w-4" />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(jobPosting.id)}
            disabled={isLoading}
            title="Edit Job Posting"
          >
            <Edit className="h-4 w-4" />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onArchive(jobPosting.id)}
            disabled={isLoading}
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
            title="Archive Job Posting"
          >
            <Archive className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

export default JobPostingCard;
