import React from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, Calendar, Building } from 'lucide-react';

import { Input } from '../../../components/ui/Input';

/**
 * Job Postings Filters Component
 * Provides search and filtering functionality for job postings
 */
const JobPostingsFilters = ({ 
  searchTerm,
  statusFilter,
  onSearchChange,
  onStatusFilterChange,
  isLoading = false
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="bg-white rounded-xl shadow-soft border border-gray-200 p-6"
    >
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search Input */}
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search job postings..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10"
              disabled={isLoading}
            />
          </div>
        </div>
        
        {/* Status Filter */}
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-gray-400" />
            <span className="text-sm font-medium text-gray-700">Status:</span>
          </div>
          <select
            value={statusFilter}
            onChange={(e) => onStatusFilterChange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={isLoading}
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="archived">Archived</option>
          </select>
        </div>
      </div>
      
      {/* Filter Indicators */}
      {(searchTerm || statusFilter !== 'all') && (
        <div className="flex items-center space-x-2 mt-4 pt-4 border-t border-gray-100">
          <span className="text-sm text-gray-500">Active filters:</span>
          {searchTerm && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              Search: "{searchTerm}"
            </span>
          )}
          {statusFilter !== 'all' && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
              Status: {statusFilter === 'active' ? 'Active' : 'Archived'}
            </span>
          )}
        </div>
      )}
    </motion.div>
  );
};

export default JobPostingsFilters;
