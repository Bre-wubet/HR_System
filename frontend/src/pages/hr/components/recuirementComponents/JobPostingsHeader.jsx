import React from 'react';
import { motion } from 'framer-motion';
import { Plus, Briefcase, TrendingUp } from 'lucide-react';

import { Button } from '../../../../components/ui/Button';

/**
 * Job Postings Header Component
 * Displays the page title, description, and primary action button
 */
const JobPostingsHeader = ({ 
  onCreateJobPosting,
  isLoading = false,
  totalJobs = 0,
  activeJobs = 0
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center justify-between"
    >
      <div className="flex items-center space-x-4">
        <div className="p-3 bg-blue-100 rounded-xl">
          <Briefcase className="h-6 w-6 text-blue-600" />
        </div>
        
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Recruitment</h1>
          <p className="text-gray-600">Manage job postings and candidate applications</p>
          
          {/* Quick Stats */}
          <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
            <div className="flex items-center space-x-1">
              <TrendingUp className="h-4 w-4" />
              <span>{totalJobs} total jobs</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>{activeJobs} active</span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="flex items-center space-x-3">
        <Button 
          onClick={onCreateJobPosting}
          disabled={isLoading}
          className="shadow-md hover:shadow-lg transition-shadow"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create Job Posting
        </Button>
      </div>
    </motion.div>
  );
};

export default JobPostingsHeader;
