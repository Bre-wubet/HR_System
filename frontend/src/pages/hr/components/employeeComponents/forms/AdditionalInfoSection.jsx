import React from 'react';
import { motion } from 'framer-motion';
import { 
  Info, 
  Calendar, 
  User, 
  Clock, 
  MapPin, 
  Building, 
  Award,
  TrendingUp,
  FileText,
  Shield
} from 'lucide-react';
import { formatDate } from '../../../../../api/employeeApi';
import { cn } from '../../../../../lib/utils';

/**
 * Additional Information Section Component
 * Enhanced display of read-only employee information for edit mode
 */
const AdditionalInfoSection = ({ employee, isLoading = false }) => {
  if (!employee) return null;

  const calculateYearsOfService = (hireDate) => {
    if (!hireDate) return 'N/A';
    const years = Math.floor((new Date() - new Date(hireDate)) / (365.25 * 24 * 60 * 60 * 1000));
    return `${years} year${years !== 1 ? 's' : ''}`;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'ACTIVE': return 'bg-green-100 text-green-800 border-green-200';
      case 'INACTIVE': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'PROBATION': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'TERMINATED': return 'bg-red-100 text-red-800 border-red-200';
      case 'RESIGNED': return 'bg-orange-100 text-orange-800 border-orange-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const additionalInfo = [
    {
      label: 'Employee ID',
      value: employee.id || 'N/A',
      icon: User,
      category: 'basic'
    },
    {
      label: 'Hire Date',
      value: employee.hireDate ? formatDate(employee.hireDate) : 'N/A',
      icon: Calendar,
      category: 'employment'
    },
    {
      label: 'Years of Service',
      value: calculateYearsOfService(employee.hireDate),
      icon: Clock,
      category: 'employment'
    },
    {
      label: 'Department',
      value: employee.department?.name || employee.departmentName || 'N/A',
      icon: Building,
      category: 'employment'
    },
    {
      label: 'Manager',
      value: employee.manager?.name || employee.managerName || 'N/A',
      icon: User,
      category: 'employment'
    },
    {
      label: 'Location',
      value: employee.location || employee.workLocation || 'N/A',
      icon: MapPin,
      category: 'employment'
    }
  ];

  const statsInfo = [
    {
      label: 'Documents',
      value: employee.documents?.length || 0,
      icon: FileText,
      suffix: 'files'
    },
    {
      label: 'Performance Rating',
      value: employee.performanceRating || 'N/A',
      icon: TrendingUp,
      suffix: employee.performanceRating ? '/5' : ''
    },
    {
      label: 'Last Review',
      value: employee.lastReviewDate ? formatDate(employee.lastReviewDate) : 'N/A',
      icon: Award,
      suffix: ''
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 }}
      className="bg-white rounded-xl shadow-soft p-6"
    >
      <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
        <Info className="h-5 w-5 mr-2 text-blue-600" />
        Additional Information
      </h2>
      
      {/* Employee Status Badge */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        className="mb-6 flex items-center justify-between"
      >
        <div className="flex items-center space-x-3">
          <Shield className="h-5 w-5 text-gray-500" />
          <span className="text-sm font-medium text-gray-700">Employment Status:</span>
          <span className={cn(
            'px-3 py-1 rounded-full text-xs font-medium border',
            getStatusColor(employee.status || employee.employmentStatus)
          )}>
            {employee.status || employee.employmentStatus || 'N/A'}
          </span>
        </div>
        
        {employee.lastUpdated && (
          <span className="text-xs text-gray-500">
            Last updated: {formatDate(employee.lastUpdated)}
          </span>
        )}
      </motion.div>

      {/* Basic Information Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {additionalInfo.map((info, index) => {
          const Icon = info.icon;
          return (
            <motion.div
              key={info.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index }}
              className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center space-x-2 mb-2">
                <Icon className="h-4 w-4 text-gray-500" />
                <h3 className="font-medium text-gray-900 text-sm">
                  {info.label}
                </h3>
              </div>
              <p className="text-sm text-gray-600">
                {isLoading ? (
                  <div className="animate-pulse bg-gray-200 h-4 rounded w-3/4" />
                ) : (
                  info.value
                )}
              </p>
            </motion.div>
          );
        })}
      </div>

      {/* Statistics Section */}
      <div className="border-t border-gray-200 pt-6">
        <h3 className="text-sm font-medium text-gray-700 mb-4 flex items-center">
          <TrendingUp className="h-4 w-4 mr-2" />
          Employee Statistics
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {statsInfo.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + 0.1 * index }}
                className="bg-blue-50 rounded-lg p-4 hover:bg-blue-100 transition-colors"
              >
                <div className="flex items-center space-x-2 mb-2">
                  <Icon className="h-4 w-4 text-blue-600" />
                  <h4 className="font-medium text-blue-900 text-sm">
                    {stat.label}
                  </h4>
                </div>
                <p className="text-lg font-semibold text-blue-800">
                  {isLoading ? (
                    <div className="animate-pulse bg-blue-200 h-6 rounded w-1/2" />
                  ) : (
                    `${stat.value}${stat.suffix}`
                  )}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Additional Notes */}
      {employee.notes && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-6 border-t border-gray-200 pt-6"
        >
          <h3 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
            <FileText className="h-4 w-4 mr-2" />
            Notes
          </h3>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-sm text-yellow-800">
              {employee.notes}
            </p>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default AdditionalInfoSection;
