import React from 'react';
import { Search, Filter } from 'lucide-react';

import { Input } from '../../../../components/ui/Input';

/**
 * Interview Filters Component
 * Provides search and filtering functionality for interviews
 */
const InterviewFilters = ({
  searchTerm,
  statusFilter,
  typeFilter,
  onSearchChange,
  onStatusFilterChange,
  onTypeFilterChange,
  isLoading = false
}) => {
  return (
    <div className="bg-white rounded-xl shadow-soft p-6">
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search Input */}
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search interviews by candidate or interviewer..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10"
              disabled={isLoading}
            />
          </div>
        </div>
        
        {/* Filter Dropdowns */}
        <div className="flex items-center space-x-3">
          <Filter className="h-4 w-4 text-gray-400" />
          
          <select
            value={statusFilter}
            onChange={(e) => onStatusFilterChange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={isLoading}
          >
            <option value="all">All Status</option>
            <option value="SCHEDULED">Scheduled</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
            <option value="RESCHEDULED">Rescheduled</option>
          </select>
          
          <select
            value={typeFilter}
            onChange={(e) => onTypeFilterChange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={isLoading}
          >
            <option value="all">All Types</option>
            <option value="IN_PERSON">In Person</option>
            <option value="VIDEO">Video Call</option>
            <option value="PHONE">Phone Call</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default InterviewFilters;
