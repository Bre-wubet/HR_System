import React from 'react';
import { motion } from 'framer-motion';
import { Building, Plus, Search, Filter } from 'lucide-react';

import { Button } from '../../../components/ui/Button';

/**
 * Empty State Component
 * Displays when no job postings are found
 */
const EmptyState = ({ 
  hasFilters = false,
  onCreateJobPosting,
  onClearFilters,
  isLoading = false 
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="text-center py-16"
    >
      <div className="max-w-md mx-auto">
        {/* Icon */}
        <div className="mb-6">
          {hasFilters ? (
            <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
              <Search className="h-8 w-8 text-gray-400" />
            </div>
          ) : (
            <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
              <Building className="h-8 w-8 text-blue-600" />
            </div>
          )}
        </div>
        
        {/* Content */}
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          {hasFilters ? 'No Job Postings Found' : 'No Job Postings Yet'}
        </h2>
        
        <p className="text-gray-600 mb-6">
          {hasFilters 
            ? 'Try adjusting your search or filters to find what you\'re looking for.'
            : 'Get started by creating your first job posting to begin recruiting.'
          }
        </p>
        
        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          {hasFilters ? (
            <>
              <Button
                variant="outline"
                onClick={onClearFilters}
                disabled={isLoading}
              >
                <Filter className="h-4 w-4 mr-2" />
                Clear Filters
              </Button>
              <Button
                onClick={onCreateJobPosting}
                disabled={isLoading}
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Job Posting
              </Button>
            </>
          ) : (
            <Button
              onClick={onCreateJobPosting}
              disabled={isLoading}
              className="shadow-md hover:shadow-lg transition-shadow"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Job Posting
            </Button>
          )}
        </div>
        
        {/* Additional Help */}
        {!hasFilters && (
          <div className="mt-8 p-4 bg-gray-50 rounded-lg">
            <h3 className="text-sm font-medium text-gray-900 mb-2">Getting Started</h3>
            <p className="text-xs text-gray-600">
              Job postings help you attract and manage candidates. You can create postings for different departments and track applications.
            </p>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default EmptyState;
