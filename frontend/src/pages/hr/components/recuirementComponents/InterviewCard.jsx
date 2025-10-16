import React from 'react';
import { motion } from 'framer-motion';
import { 
  MapPin, 
  Video, 
  Phone, 
  Calendar,
  Edit, 
  Trash2,
  User,
  Clock
} from 'lucide-react';

import { Button } from '../../../../components/ui/Button';
import { cn } from '../../../../lib/utils';

/**
 * Interview Card Component
 * Displays individual interview information with actions
 */
const InterviewCard = ({ 
  interview, 
  onEdit, 
  onDelete, 
  isLoading = false 
}) => {
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

  const getTypeLabel = (type) => {
    switch (type) {
      case 'IN_PERSON':
        return 'In Person';
      case 'VIDEO':
        return 'Video Call';
      case 'PHONE':
        return 'Phone Call';
      default:
        return 'Interview';
    }
  };

  const formatDateTime = (date) => {
    const interviewDate = new Date(date);
    return {
      date: interviewDate.toLocaleDateString('en-US', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      }),
      time: interviewDate.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
      })
    };
  };

  const TypeIcon = getTypeIcon(interview.type);
  const { date, time } = formatDateTime(interview.date);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="p-6 hover:bg-gray-50 transition-colors border-b border-gray-200 last:border-b-0"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4 flex-1">
          {/* Interview Type Icon */}
          <div className="p-3 bg-blue-50 rounded-lg">
            <TypeIcon className="h-6 w-6 text-blue-600" />
          </div>
          
          {/* Interview Details */}
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-2">
              <h4 className="text-lg font-semibold text-gray-900">
                {interview.candidate?.firstName} {interview.candidate?.lastName}
              </h4>
              <span className={cn(
                'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                getStatusColor(interview.status)
              )}>
                {interview.status}
              </span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <User className="h-4 w-4" />
                  <span>
                    Interviewer: {interview.interviewer?.firstName} {interview.interviewer?.lastName}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4" />
                  <span>{date} at {time}</span>
                </div>
              </div>
              
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4" />
                  <span>Duration: {interview.duration} minutes</span>
                </div>
                <div className="flex items-center space-x-2">
                  <TypeIcon className="h-4 w-4" />
                  <span>{getTypeLabel(interview.type)}</span>
                </div>
              </div>
            </div>
            
            {/* Job Posting Info */}
            {interview.candidate?.jobPosting && (
              <div className="mt-2 text-sm text-gray-500">
                Position: {interview.candidate.jobPosting.title}
              </div>
            )}
            
            {/* Location/Meeting Link */}
            {interview.location && (
              <div className="mt-1 text-sm text-gray-500">
                Location: {interview.location}
              </div>
            )}
            {interview.meetingLink && (
              <div className="mt-1 text-sm text-blue-600">
                <a href={interview.meetingLink} target="_blank" rel="noopener noreferrer" className="hover:underline">
                  Meeting Link
                </a>
              </div>
            )}
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="flex items-center space-x-2 ml-4">
          <Button 
            size="sm" 
            variant="outline" 
            onClick={() => onEdit(interview)}
            disabled={isLoading}
            title="Edit Interview"
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button 
            size="sm" 
            variant="outline" 
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
            onClick={() => onDelete(interview)}
            disabled={isLoading}
            title="Delete Interview"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

export default InterviewCard;
