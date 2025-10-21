import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { 
  Mail, 
  Phone, 
  Calendar, 
  MapPin, 
  Building, 
  DollarSign,
  User,
  RefreshCw,
  Edit3
} from 'lucide-react';
import { cn, getInitials } from '../../../../../lib/utils';
import { 
  getEmploymentStatusColor, 
  getJobTypeColor, 
  formatDate, 
  formatSalary,
  calculateAge,
  getYearsOfService
} from '../../../../../api/employeeApi';
import useEmployeeStore from '../../../../../stores/useEmployeeStore';
import toast from 'react-hot-toast';

/**
 * Employee Overview Component
 * Displays core employee information
 */
const EmployeeOverview = ({ employee, isLoading = false, onEdit, onRefresh }) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const {
    promoteEmployee,
    transferEmployee
  } = useEmployeeStore();

  // Handle refresh
  const handleRefresh = useCallback(async () => {
    if (!employee?.id) return;
    
    setIsRefreshing(true);
    try {
      if (onRefresh) {
        await onRefresh();
      }
      toast.success('Employee data refreshed');
    } catch (error) {
      toast.error('Failed to refresh employee data');
    } finally {
      setIsRefreshing(false);
    }
  }, [employee?.id, onRefresh]);


  if (!employee) return null;


  if (!employee) return null;

  // Core overview sections
  const overviewSections = [
    {
      title: 'Personal Information',
      icon: User,
      items: [
        { label: 'Full Name', value: `${employee.firstName} ${employee.lastName}` },
        { label: 'Email', value: employee.email, icon: Mail, clickable: true },
        { label: 'Phone', value: employee.phoneNumber, icon: Phone, clickable: true },
        { label: 'Date of Birth', value: formatDate(employee.dateOfBirth) },
        { label: 'Age', value: calculateAge(employee.dateOfBirth) ? `${calculateAge(employee.dateOfBirth)} years` : 'Not specified' },
        { label: 'Gender', value: employee.gender },
      ]
    },
    {
      title: 'Employment Details',
      icon: Building,
      items: [
        { label: 'Employee ID', value: employee.id },
        { label: 'Job Title', value: employee.jobTitle },
        { label: 'Department', value: employee.department?.name, icon: Building },
        { label: 'Manager', value: employee.manager ? `${employee.manager.firstName} ${employee.lastName}` : 'Not assigned' },
        { label: 'Employment Status', value: employee.employmentStatus, status: true },
        { label: 'Job Type', value: employee.jobType, jobType: true },
        { label: 'Hire Date', value: formatDate(employee.hireDate), icon: Calendar },
        { label: 'Years of Service', value: getYearsOfService(employee.hireDate) ? `${getYearsOfService(employee.hireDate)} years` : 'Not specified' },
      ]
    },
    {
      title: 'Compensation & Benefits',
      icon: DollarSign,
      items: [
        { label: 'Salary', value: formatSalary(employee.salary) },
        { label: 'Pay Frequency', value: employee.payFrequency || 'Not specified' },
        { label: 'Benefits Package', value: employee.benefitsPackage || 'Not specified' },
      ]
    },
    {
      title: 'Contact Information',
      icon: MapPin,
      items: [
        { label: 'Address', value: employee.address || 'Not specified' },
        { label: 'City', value: employee.city || 'Not specified' },
        { label: 'State', value: employee.state || 'Not specified' },
        { label: 'Postal Code', value: employee.postalCode || 'Not specified' },
        { label: 'Country', value: employee.country || 'Not specified' },
      ]
    }
  ];



  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Employee Avatar and Basic Info with Actions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-6">
            <div className="flex-shrink-0">
              <div className="h-20 w-20 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center ring-4 ring-blue-50">
                <span className="text-2xl font-bold text-blue-700">
                  {getInitials(`${employee.firstName} ${employee.lastName}`)}
                </span>
              </div>
            </div>
            
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <h2 className="text-xl font-semibold text-gray-900">
                  {employee.firstName} {employee.lastName}
                </h2>
                <span className={cn(
                  'px-2 py-1 rounded-full text-xs font-medium',
                  getEmploymentStatusColor(employee.employmentStatus)
                )}>
                  {employee.employmentStatus}
                </span>
                <span className={cn(
                  'px-2 py-1 rounded-full text-xs font-medium',
                  getJobTypeColor(employee.jobType)
                )}>
                  {employee.jobType.replace('_', ' ')}
                </span>
              </div>
              
              <p className="text-gray-600 mb-1">{employee.jobTitle}</p>
              <p className="text-sm text-gray-500">{employee.department?.name}</p>
              
              {employee.manager && (
                <p className="text-sm text-gray-500 mt-1">
                  Reports to: {employee.manager.firstName} {employee.manager.lastName}
                </p>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-2">
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className={cn(
                'p-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors',
                isRefreshing && 'opacity-50 cursor-not-allowed'
              )}
              title="Refresh data"
            >
              <RefreshCw className={cn('h-4 w-4 text-gray-600', isRefreshing && 'animate-spin')} />
            </button>
            
            {onEdit && (
              <button
                onClick={onEdit}
                className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                title="Edit employee"
              >
                <Edit3 className="h-4 w-4 text-gray-600" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Overview Sections */}
      <div className="grid gap-6 md:grid-cols-2">
        {overviewSections.map((section, index) => {
          const Icon = section.icon;
          
          return (
            <motion.div
              key={section.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
            >
              <div className="flex items-center space-x-2 mb-4">
                <Icon className="h-5 w-5 text-blue-600" />
                <h3 className="text-lg font-semibold text-gray-900">
                  {section.title}
                </h3>
              </div>
              
              <div className="space-y-3">
                {section.items.map((item, itemIndex) => (
                  <div key={itemIndex} className="flex items-start justify-between">
                    <div className="flex items-center space-x-2">
                      {item.icon && <item.icon className="h-4 w-4 text-gray-400" />}
                      <span className="text-sm font-medium text-gray-700">
                        {item.label}:
                      </span>
                    </div>
                    <div className="text-right">
                      {item.status ? (
                        <span className={cn(
                          'px-2 py-1 rounded-full text-xs font-medium',
                          getEmploymentStatusColor(item.value)
                        )}>
                          {item.value}
                        </span>
                      ) : item.jobType ? (
                        <span className={cn(
                          'px-2 py-1 rounded-full text-xs font-medium',
                          getJobTypeColor(item.value)
                        )}>
                          {item.value.replace('_', ' ')}
                        </span>
                      ) : item.clickable ? (
                        <span className="text-sm text-blue-600 hover:text-blue-800 cursor-pointer">
                          {item.value || 'Not specified'}
                        </span>
                      ) : (
                        <span className="text-sm text-gray-900">
                          {item.value || 'Not specified'}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Missing Information Notice */}
      {(!employee.payFrequency || !employee.benefitsPackage || !employee.address) && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-blue-50 border border-blue-200 rounded-xl p-6"
        >
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 text-sm font-medium">ℹ</span>
              </div>
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-medium text-blue-900 mb-1">
                Additional Information Available
              </h3>
              <p className="text-sm text-blue-700 mb-2">
                Some employee details like contact information, benefits, and pay frequency can be added by editing the employee profile.
              </p>
              {onEdit && (
                <button
                  onClick={onEdit}
                  className="text-sm text-blue-600 hover:text-blue-800 font-medium underline"
                >
                  Edit employee profile to add missing information
                </button>
              )}
            </div>
          </div>
        </motion.div>
      )}

      {/* Additional Information */}
      {(employee.emergencyContact || employee.notes) && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Additional Information
          </h3>
          
          <div className="space-y-4">
            {employee.emergencyContact && (
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Emergency Contact</h4>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-700">
                    <strong>Name:</strong> {employee.emergencyContact.name}
                  </p>
                  <p className="text-sm text-gray-700">
                    <strong>Relationship:</strong> {employee.emergencyContact.relationship}
                  </p>
                  <p className="text-sm text-gray-700">
                    <strong>Phone:</strong> {employee.emergencyContact.phone}
                  </p>
                </div>
              </div>
            )}
            
            {employee.notes && (
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Notes</h4>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-700">{employee.notes}</p>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default EmployeeOverview;
