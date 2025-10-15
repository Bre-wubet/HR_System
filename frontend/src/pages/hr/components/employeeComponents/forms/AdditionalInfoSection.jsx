import React from 'react';
import { motion } from 'framer-motion';
import { Info, Calendar, User } from 'lucide-react';
import { formatDate } from '../../../../../api/employeeApi';

/**
 * Additional Information Section Component
 * Displays read-only employee information for edit mode
 */
const AdditionalInfoSection = ({ employee, isLoading = false }) => {
  if (!employee) return null;

  const additionalInfo = [
    {
      label: 'Employee ID',
      value: employee.id || employee.employeeId,
      icon: User
    },
    {
      label: 'Hire Date',
      value: employee.hireDate ? formatDate(employee.hireDate) : 'N/A',
      icon: Calendar
    },
    {
      label: 'Years of Service',
      value: employee.hireDate 
        ? `${Math.floor((new Date() - new Date(employee.hireDate)) / (365.25 * 24 * 60 * 60 * 1000))} years`
        : 'N/A',
      icon: Info
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
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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

      {/* Employee Status Badge */}
      {employee.employmentStatus && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-6 flex items-center space-x-3"
        >
          <span className="text-sm font-medium text-gray-700">Status:</span>
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
            employee.employmentStatus === 'ACTIVE' 
              ? 'bg-green-100 text-green-800'
              : employee.employmentStatus === 'INACTIVE'
              ? 'bg-gray-100 text-gray-800'
              : employee.employmentStatus === 'PROBATION'
              ? 'bg-yellow-100 text-yellow-800'
              : 'bg-red-100 text-red-800'
          }`}>
            {employee.employmentStatus}
          </span>
        </motion.div>
      )}
    </motion.div>
  );
};

export default AdditionalInfoSection;
