import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { 
  Mail, 
  Phone, 
  Calendar, 
  MapPin, 
  Building, 
  Users, 
  DollarSign,
  Clock,
  User,
  Shield,
  Award,
  TrendingUp,
  RefreshCw,
  Edit3,
  Star,
  AlertCircle,
  CheckCircle,
  XCircle,
  Download,
  Eye,
  Plus,
  Trash2,
  ExternalLink
} from 'lucide-react';
import { cn, getInitials } from '../../../../../lib/utils';
import { 
  getEmploymentStatusColor, 
  getJobTypeColor, 
  formatDate, 
  formatSalary,
  calculateAge,
  getYearsOfService,
  getSkillLevelColor,
  isCertificationExpired,
  isCertificationExpiringSoon
} from '../../../../../api/employeeApi';
import useEmployeeStore from '../../../../../stores/useEmployeeStore';
import useEmployeeOverview from '../../../hooks/useEmployeeOverview';
import toast from 'react-hot-toast';

/**
 * Employee Overview Component
 * Displays comprehensive employee information with backend integration
 */
const EmployeeOverview = ({ employee, isLoading = false, onEdit, onRefresh }) => {
  const {
    employeeData,
    isLoading: isLoadingData,
    isRefreshing,
    refreshData,
    getSkillStats,
    getCertificationStats,
    getPerformanceTrends
  } = useEmployeeOverview(employee?.id);

  const {
    promoteEmployee,
    transferEmployee
  } = useEmployeeStore();

  // Handle refresh
  const handleRefresh = useCallback(async () => {
    if (!employee?.id) return;
    
    try {
      await refreshData(employee.id);
      if (onRefresh) {
        await onRefresh();
      }
    } catch (error) {
      toast.error('Failed to refresh employee data');
    }
  }, [employee?.id, refreshData, onRefresh]);

  // Handle quick actions
  const handleQuickAction = useCallback(async (action, data = {}) => {
    if (!employee?.id) return;

    try {
      switch (action) {
        case 'promote':
          const promoteResult = await promoteEmployee(employee.id, data);
          if (promoteResult.success) {
            toast.success('Employee promoted successfully');
            handleRefresh();
          }
          break;
        case 'transfer':
          const transferResult = await transferEmployee(employee.id, data);
          if (transferResult.success) {
            toast.success('Employee transferred successfully');
            handleRefresh();
          }
          break;
        default:
          break;
      }
    } catch (error) {
      toast.error(`Failed to ${action} employee`);
    }
  }, [employee?.id, promoteEmployee, transferEmployee, handleRefresh]);

  if (!employee) return null;

  // Enhanced overview sections with backend data
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

  // Get statistics
  const skillStats = getSkillStats();
  const certificationStats = getCertificationStats();
  const performanceTrends = getPerformanceTrends();

  // Skills section with backend data
  const skillsSection = {
    title: 'Skills & Competencies',
    icon: Award,
    isLoading: isLoadingData,
    items: employeeData.skills.map(skill => ({
      label: skill.skill?.name || 'Unknown Skill',
      value: `${skill.level}/5`,
      level: skill.level,
      category: skill.skill?.category,
      acquiredDate: skill.acquiredDate,
      status: skill.status
    }))
  };

  // Certifications section with backend data
  const certificationsSection = {
    title: 'Certifications',
    icon: Shield,
    isLoading: isLoadingData,
    items: employeeData.certifications.map(cert => ({
      label: cert.name,
      value: cert.status,
      status: cert.status,
      issuedDate: cert.issuedDate,
      expiresAt: cert.expiresAt,
      isExpired: isCertificationExpired(cert.expiresAt),
      isExpiringSoon: isCertificationExpiringSoon(cert.expiresAt),
      issuer: cert.issuer
    }))
  };

  // Performance section with backend data
  const performanceSection = {
    title: 'Performance & Evaluations',
    icon: TrendingUp,
    isLoading: isLoadingData,
    items: employeeData.evaluations.map(evaluation => ({
      label: `${evaluation.type} - ${formatDate(evaluation.evaluationDate)}`,
      value: evaluation.overallRating,
      rating: evaluation.overallRating,
      evaluator: evaluation.evaluator,
      evaluationDate: evaluation.evaluationDate,
      comments: evaluation.comments
    }))
  };

  // Career progression section
  const careerSection = {
    title: 'Career Progression',
    icon: TrendingUp,
    isLoading: isLoadingData,
    items: employeeData.careerHistory.map(progression => ({
      label: `${progression.type} - ${formatDate(progression.effectiveDate)}`,
      value: progression.status,
      status: progression.status,
      type: progression.type,
      effectiveDate: progression.effectiveDate,
      reason: progression.reason,
      approvedBy: progression.approvedBy
    }))
  };

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

      {/* Backend-Integrated Sections */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Skills Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <skillsSection.icon className="h-5 w-5 text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-900">
                {skillsSection.title}
              </h3>
            </div>
            {skillsSection.isLoading && (
              <RefreshCw className="h-4 w-4 text-gray-400 animate-spin" />
            )}
          </div>
          
          <div className="space-y-3">
            {skillsSection.items.length > 0 ? (
              skillsSection.items.map((skill, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Award className="h-4 w-4 text-gray-400" />
                    <span className="text-sm font-medium text-gray-700">
                      {skill.label}
                    </span>
                    {skill.category && (
                      <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                        {skill.category}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="flex space-x-1">
                      {[1, 2, 3, 4, 5].map((level) => (
                        <Star
                          key={level}
                          className={cn(
                            'h-3 w-3',
                            level <= skill.level ? 'text-yellow-400 fill-current' : 'text-gray-300'
                          )}
                        />
                      ))}
                    </div>
                    <span className="text-sm text-gray-900">{skill.value}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-4 text-gray-500">
                {skillsSection.isLoading ? 'Loading skills...' : 'No skills recorded'}
              </div>
            )}
          </div>
        </motion.div>

        {/* Certifications Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <certificationsSection.icon className="h-5 w-5 text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-900">
                {certificationsSection.title}
              </h3>
            </div>
            {certificationsSection.isLoading && (
              <RefreshCw className="h-4 w-4 text-gray-400 animate-spin" />
            )}
          </div>
          
          <div className="space-y-3">
            {certificationsSection.items.length > 0 ? (
              certificationsSection.items.map((cert, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Shield className="h-4 w-4 text-gray-400" />
                    <div>
                      <span className="text-sm font-medium text-gray-700">
                        {cert.label}
                      </span>
                      {cert.issuer && (
                        <p className="text-xs text-gray-500">{cert.issuer}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {cert.isExpired ? (
                      <XCircle className="h-4 w-4 text-red-500" />
                    ) : cert.isExpiringSoon ? (
                      <AlertCircle className="h-4 w-4 text-yellow-500" />
                    ) : (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    )}
                    <span className={cn(
                      'px-2 py-1 rounded-full text-xs font-medium',
                      cert.isExpired ? 'bg-red-100 text-red-800' :
                      cert.isExpiringSoon ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    )}>
                      {cert.status}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-4 text-gray-500">
                {certificationsSection.isLoading ? 'Loading certifications...' : 'No certifications recorded'}
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Performance and Career Sections */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Performance Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <performanceSection.icon className="h-5 w-5 text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-900">
                {performanceSection.title}
              </h3>
            </div>
            {performanceSection.isLoading && (
              <RefreshCw className="h-4 w-4 text-gray-400 animate-spin" />
            )}
          </div>
          
          <div className="space-y-3">
            {performanceSection.items.length > 0 ? (
              performanceSection.items.map((evaluation, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="h-4 w-4 text-gray-400" />
                    <span className="text-sm font-medium text-gray-700">
                      {evaluation.label}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="flex space-x-1">
                      {[1, 2, 3, 4, 5].map((rating) => (
                        <Star
                          key={rating}
                          className={cn(
                            'h-3 w-3',
                            rating <= evaluation.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                          )}
                        />
                      ))}
                    </div>
                    <span className="text-sm text-gray-900">{evaluation.value}/5</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-4 text-gray-500">
                {performanceSection.isLoading ? 'Loading evaluations...' : 'No evaluations recorded'}
              </div>
            )}
          </div>
        </motion.div>

        {/* Career Progression Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <careerSection.icon className="h-5 w-5 text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-900">
                {careerSection.title}
              </h3>
            </div>
            {careerSection.isLoading && (
              <RefreshCw className="h-4 w-4 text-gray-400 animate-spin" />
            )}
          </div>
          
          <div className="space-y-3">
            {careerSection.items.length > 0 ? (
              careerSection.items.map((progression, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="h-4 w-4 text-gray-400" />
                    <span className="text-sm font-medium text-gray-700">
                      {progression.label}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={cn(
                      'px-2 py-1 rounded-full text-xs font-medium',
                      progression.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                      progression.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    )}>
                      {progression.status}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-4 text-gray-500">
                {careerSection.isLoading ? 'Loading career history...' : 'No career progression recorded'}
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Statistics Overview */}
      {(skillStats || certificationStats || performanceTrends) && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Performance Statistics
          </h3>
          
          <div className="grid gap-4 md:grid-cols-3">
            {skillStats && (
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <Award className="h-5 w-5 text-blue-600" />
                  <h4 className="font-medium text-gray-900">Skills</h4>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-gray-600">
                    Total: {skillStats.totalSkills} skills
                  </p>
                  <p className="text-sm text-gray-600">
                    Average Level: {skillStats.averageLevel}/5
                  </p>
                  <p className="text-sm text-gray-600">
                    Categories: {skillStats.skillCategories}
                  </p>
                </div>
              </div>
            )}

            {certificationStats && (
              <div className="bg-green-50 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <Shield className="h-5 w-5 text-green-600" />
                  <h4 className="font-medium text-gray-900">Certifications</h4>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-gray-600">
                    Total: {certificationStats.total}
                  </p>
                  <p className="text-sm text-gray-600">
                    Active: {certificationStats.active}
                  </p>
                  <p className="text-sm text-gray-600">
                    Expiring Soon: {certificationStats.expiringSoon}
                  </p>
                </div>
              </div>
            )}

            {performanceTrends && (
              <div className="bg-purple-50 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <TrendingUp className="h-5 w-5 text-purple-600" />
                  <h4 className="font-medium text-gray-900">Performance</h4>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-gray-600">
                    Average Rating: {performanceTrends.averageRating}/5
                  </p>
                  <p className="text-sm text-gray-600">
                    Evaluations: {performanceTrends.totalEvaluations}
                  </p>
                  <p className="text-sm text-gray-600">
                    Trend: {performanceTrends.trend}
                  </p>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* Skill Recommendations Section */}
      {employeeData.skillRecommendations.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-900">
                Skill Recommendations
              </h3>
            </div>
            {isLoadingData && (
              <RefreshCw className="h-4 w-4 text-gray-400 animate-spin" />
            )}
          </div>
          
          <div className="space-y-3">
            {employeeData.skillRecommendations.map((recommendation, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center space-x-2">
                  <Award className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium text-gray-700">
                    {recommendation.skillName}
                  </span>
                  {recommendation.category && (
                    <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded">
                      {recommendation.category}
                    </span>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-gray-500">
                    Priority: {recommendation.priority}
                  </span>
                  <button className="text-xs text-blue-600 hover:text-blue-800 font-medium">
                    Learn More
                  </button>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Additional Information */}
      {(employee.emergencyContact || employee.notes) && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
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
