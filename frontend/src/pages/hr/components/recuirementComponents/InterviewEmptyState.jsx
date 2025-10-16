import React from 'react';
import { Calendar, Plus } from 'lucide-react';

import { Button } from '../../../../components/ui/Button';

/**
 * Empty State Component for Interviews
 * Shows when no interviews are found or available
 */
const InterviewEmptyState = ({ 
  hasInterviews = false, 
  onCreateInterview 
}) => {
  return (
    <div className="text-center py-12">
      <Calendar className="h-12 w-12 mx-auto text-gray-300 mb-4" />
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        {hasInterviews ? 'No Interviews Found' : 'No Interviews Scheduled'}
      </h3>
      <p className="text-gray-600 mb-4">
        {hasInterviews 
          ? 'Try adjusting your search or filters to find interviews'
          : 'Get started by scheduling your first interview'
        }
      </p>
      {!hasInterviews && onCreateInterview && (
        <Button onClick={onCreateInterview}>
          <Plus className="h-4 w-4 mr-2" />
          Schedule First Interview
        </Button>
      )}
    </div>
  );
};

export default InterviewEmptyState;
