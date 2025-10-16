import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Building, Users, Calendar, CheckCircle } from 'lucide-react';

import JobPostingCard from './JobPostingCard';

/**
 * Job Postings Grid Component
 * Displays job postings in a responsive grid layout
 */
const JobPostingsGrid = ({ 
  jobPostings = [], 
  onView, 
  onEdit, 
  onArchive, 
  onDelete,
  onViewCandidates,
  onAddCandidate,
  isLoading = false 
}) => {
  if (isLoading) {
    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white rounded-xl shadow-soft p-6 animate-pulse"
          >
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2 mb-4"></div>
            <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-2/3 mb-4"></div>
            <div className="flex justify-between items-center">
              <div className="h-3 bg-gray-200 rounded w-1/3"></div>
              <div className="flex space-x-2">
                <div className="h-8 w-8 bg-gray-200 rounded"></div>
                <div className="h-8 w-8 bg-gray-200 rounded"></div>
                <div className="h-8 w-8 bg-gray-200 rounded"></div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    );
  }

  if (jobPostings.length === 0) {
    return (
      <div className="text-center py-12">
        <Building className="h-12 w-12 mx-auto text-gray-300 mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">No Job Postings Found</h2>
        <p className="text-gray-600 mb-4">
          Get started by creating your first job posting
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-2">
      <AnimatePresence>
        {jobPostings.map((jobPosting, index) => (
          <motion.div
            key={jobPosting.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ delay: index * 0.05 }}
            layout
          >
            <JobPostingCard
              jobPosting={jobPosting}
              onView={onView}
              onEdit={onEdit}
              onArchive={onArchive}
              onDelete={onDelete}
              onViewCandidates={onViewCandidates}
              onAddCandidate={onAddCandidate}
              isLoading={isLoading}
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default JobPostingsGrid;
