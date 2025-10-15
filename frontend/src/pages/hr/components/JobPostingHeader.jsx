import React from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowLeft,
  Edit,
  Building,
  Users,
  Calendar,
  Share2,
  Download,
  Archive
} from 'lucide-react';

import { Button } from '../../../components/ui/Button';
import { recruitmentUtils } from '../../../api/recruitmentApi';

/**
 * Job Posting Header Component
 * Displays job posting information and actions
 */
const JobPostingHeader = ({ 
  jobPosting, 
  candidatesCount,
  onBack,
  onEdit,
  onShare,
  onDownload,
  onArchive,
  isLoading = false 
}) => {
  if (!jobPosting) return null;

  const statusColor = recruitmentUtils.getJobStatusColor(jobPosting.isActive);
  const statusLabel = recruitmentUtils.getJobStatusLabel(jobPosting.isActive);
  
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl shadow-soft border border-gray-200 p-6"
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-4 flex-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            disabled={isLoading}
            className="flex-shrink-0"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Recruitment
          </Button>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-3 mb-2">
              <h1 className="text-2xl font-bold text-gray-900 truncate">
                {jobPosting.title}
              </h1>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                statusColor === 'green' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
              }`}>
                {statusLabel}
              </span>
            </div>
            
            <div className="flex items-center space-x-6 text-sm text-gray-600 mb-4">
              <div className="flex items-center space-x-1">
                <Building className="h-4 w-4" />
                <span>{jobPosting.department?.name}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Users className="h-4 w-4" />
                <span>{candidatesCount} candidates</span>
              </div>
              <div className="flex items-center space-x-1">
                <Calendar className="h-4 w-4" />
                <span>Posted: {recruitmentUtils.formatDate(jobPosting.createdAt)}</span>
              </div>
            </div>
            
            {/* Job Description Preview */}
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-gray-700 text-sm line-clamp-3">
                {jobPosting.description}
              </p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-2 ml-4">
          <Button
            variant="outline"
            size="sm"
            onClick={onShare}
            disabled={isLoading}
            title="Share Job Posting"
          >
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={onDownload}
            disabled={isLoading}
            title="Download Job Details"
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={onEdit}
            disabled={isLoading}
            title="Edit Job Posting"
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit Job
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={onArchive}
            disabled={isLoading}
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
            title="Archive Job Posting"
          >
            <Archive className="h-4 w-4 mr-2" />
            Archive
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

export default JobPostingHeader;
