import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  Edit, 
  MoreVertical, 
  Mail, 
  Phone, 
  Calendar, 
  MapPin, 
  Building, 
  Users, 
  DollarSign,
  Award,
  FileText,
  TrendingUp,
  Clock,
  User,
  Download,
  Share2,
  Star,
  AlertCircle,
  CheckCircle
} from 'lucide-react';

import useEmployeeStore from '../../stores/useEmployeeStore';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { 
  SkillsManager, 
  CertificationsManager, 
  EvaluationsDisplay, 
  CareerProgressionTimeline 
} from '../../components/hr/EmployeeComponents';
import { 
  getEmploymentStatusColor, 
  getJobTypeColor, 
  formatDate, 
  formatDateTime, 
  formatSalary,
  calculateAge,
  getYearsOfService,
  getInitials 
} from '../../api/employeeApi';

const EmployeeDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const {
    selectedEmployee,
    isLoading,
    getEmployeeById,
    fetchEmployeeSkills,
    fetchEmployeeCertifications,
    fetchEmployeeEvaluations,
    fetchCareerProgressionHistory,
    fetchEmployeeDocuments,
  } = useEmployeeStore();

  const [activeTab, setActiveTab] = useState('overview');
  const [showActionMenu, setShowActionMenu] = useState(false);
  const [showPromotionModal, setShowPromotionModal] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [showProbationModal, setShowProbationModal] = useState(false);

  // Fetch employee data
  const { data: employee, isLoading: isLoadingEmployee } = useQuery({
    queryKey: ['employee', id],
    queryFn: async () => {
      const result = await getEmployeeById(id);
      return result.success ? result.data : null;
    },
    enabled: !!id,
  });

  // Fetch related data
  const { data: skills = [] } = useQuery({
    queryKey: ['employee-skills', id],
    queryFn: async () => {
      const result = await fetchEmployeeSkills(id);
      return result.success ? result.data : [];
    },
    enabled: !!id,
  });

  const { data: certifications = [] } = useQuery({
    queryKey: ['employee-certifications', id],
    queryFn: async () => {
      const result = await fetchEmployeeCertifications(id);
      return result.success ? result.data : [];
    },
    enabled: !!id,
  });

  const { data: evaluations = [] } = useQuery({
    queryKey: ['employee-evaluations', id],
    queryFn: async () => {
      const result = await fetchEmployeeEvaluations(id);
      return result.success ? result.data : [];
    },
    enabled: !!id,
  });

  const { data: careerHistory = [] } = useQuery({
    queryKey: ['employee-career-history', id],
    queryFn: async () => {
      const result = await fetchCareerProgressionHistory(id);
      return result.success ? result.data : [];
    },
    enabled: !!id,
  });

  const { data: documents = [] } = useQuery({
    queryKey: ['employee-documents', id],
    queryFn: async () => {
      const result = await fetchEmployeeDocuments(id);
      return result.success ? result.data : [];
    },
    enabled: !!id,
  });

  const tabs = [
    { id: 'overview', label: 'Overview', icon: User },
    { id: 'skills', label: 'Skills', icon: Award },
    { id: 'certifications', label: 'Certifications', icon: FileText },
    { id: 'evaluations', label: 'Evaluations', icon: Star },
    { id: 'career', label: 'Career History', icon: TrendingUp },
    { id: 'documents', label: 'Documents', icon: FileText },
  ];

  if (isLoadingEmployee) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="h-12 w-12 mx-auto text-gray-400 mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Employee Not Found</h2>
        <p className="text-gray-600 mb-4">The employee you're looking for doesn't exist.</p>
        <Button onClick={() => navigate('/employees')}>
          Back to Employees
        </Button>
      </div>
    );
  }

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Basic Information */}
      <div className="bg-white rounded-xl shadow-soft p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="space-y-1">
            <p className="text-sm font-medium text-gray-500">Full Name</p>
            <p className="text-gray-900">{employee.firstName} {employee.lastName}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-gray-500">Email</p>
            <div className="flex items-center space-x-2">
              <Mail className="h-4 w-4 text-gray-400" />
              <p className="text-gray-900">{employee.email}</p>
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-gray-500">Phone</p>
            <div className="flex items-center space-x-2">
              <Phone className="h-4 w-4 text-gray-400" />
              <p className="text-gray-900">{employee.phone || 'Not provided'}</p>
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-gray-500">Gender</p>
            <p className="text-gray-900">{employee.gender || 'Not specified'}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-gray-500">Date of Birth</p>
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-gray-400" />
              <p className="text-gray-900">
                {employee.dob ? formatDate(employee.dob) : 'Not provided'}
                {employee.dob && (
                  <span className="text-sm text-gray-500 ml-2">
                    ({calculateAge(employee.dob)} years old)
                  </span>
                )}
              </p>
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-gray-500">Employee ID</p>
            <p className="text-gray-900 font-mono text-sm">{employee.id}</p>
          </div>
        </div>
      </div>

      {/* Employment Information */}
      <div className="bg-white rounded-xl shadow-soft p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Employment Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="space-y-1">
            <p className="text-sm font-medium text-gray-500">Job Title</p>
            <p className="text-gray-900">{employee.jobTitle}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-gray-500">Job Type</p>
            <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getJobTypeColor(employee.jobType)}`}>
              {employee.jobType.replace('_', ' ')}
            </span>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-gray-500">Department</p>
            <div className="flex items-center space-x-2">
              <Building className="h-4 w-4 text-gray-400" />
              <p className="text-gray-900">{employee.department?.name || 'N/A'}</p>
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-gray-500">Manager</p>
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4 text-gray-400" />
              <p className="text-gray-900">
                {employee.manager ? `${employee.manager.firstName} ${employee.manager.lastName}` : 'No manager'}
              </p>
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-gray-500">Salary</p>
            <div className="flex items-center space-x-2">
              <DollarSign className="h-4 w-4 text-gray-400" />
              <p className="text-gray-900">{formatSalary(employee.salary)}</p>
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-gray-500">Employment Status</p>
            <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getEmploymentStatusColor(employee.status)}`}>
              {employee.status}
            </span>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-gray-500">Hire Date</p>
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-gray-400" />
              <p className="text-gray-900">{formatDate(employee.hireDate)}</p>
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-gray-500">Years of Service</p>
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-gray-400" />
              <p className="text-gray-900">
                {getYearsOfService(employee.hireDate)} years
              </p>
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-gray-500">Last Updated</p>
            <p className="text-gray-900">{formatDateTime(employee.updatedAt)}</p>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-soft p-6">
          <div className="flex items-center">
            <div className="p-2 bg-primary-100 rounded-lg">
              <Award className="h-6 w-6 text-primary-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Skills</p>
              <p className="text-2xl font-semibold text-gray-900">{skills.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-soft p-6">
          <div className="flex items-center">
            <div className="p-2 bg-success-100 rounded-lg">
              <FileText className="h-6 w-6 text-success-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Certifications</p>
              <p className="text-2xl font-semibold text-gray-900">{certifications.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-soft p-6">
          <div className="flex items-center">
            <div className="p-2 bg-warning-100 rounded-lg">
              <Star className="h-6 w-6 text-warning-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Evaluations</p>
              <p className="text-2xl font-semibold text-gray-900">{evaluations.length}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderDocuments = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Documents</h3>
        <Button size="sm">
          <Upload className="h-4 w-4 mr-2" />
          Upload Document
        </Button>
      </div>

      {documents.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
          <p>No documents uploaded yet</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {documents.map((doc) => (
            <motion.div
              key={doc.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-lg border border-gray-200 p-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <FileText className="h-8 w-8 text-gray-400" />
                  <div>
                    <h4 className="font-medium text-gray-900">{doc.name}</h4>
                    <p className="text-sm text-gray-500">
                      Uploaded {formatDate(doc.uploadedAt)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button variant="ghost" size="sm">
                    <Download className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Share2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/employees')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Employees
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {employee.firstName} {employee.lastName}
            </h1>
            <p className="text-gray-600">{employee.jobTitle} • {employee.department?.name}</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <div className="relative">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowActionMenu(!showActionMenu)}
            >
              <MoreVertical className="h-4 w-4" />
            </Button>
            
            {showActionMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-medium border border-gray-200 py-1 z-50">
                <Link
                  to={`/employees/${id}/edit`}
                  className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  <Edit className="mr-3 h-4 w-4" />
                  Edit Employee
                </Link>
                <button
                  onClick={() => setShowPromotionModal(true)}
                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  <TrendingUp className="mr-3 h-4 w-4" />
                  Promote
                </button>
                <button
                  onClick={() => setShowTransferModal(true)}
                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  <Users className="mr-3 h-4 w-4" />
                  Transfer
                </button>
                {employee.status === 'ACTIVE' && (
                  <button
                    onClick={() => setShowProbationModal(true)}
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <AlertCircle className="mr-3 h-4 w-4" />
                    Start Probation
                  </button>
                )}
              </div>
            )}
          </div>
          
          <Link to={`/employees/${id}/edit`}>
            <Button size="sm">
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
          </Link>
        </div>
      </div>

      {/* Employee Card */}
      <div className="bg-white rounded-xl shadow-soft p-6">
        <div className="flex items-start space-x-6">
          <div className="h-20 w-20 bg-primary-100 rounded-full flex items-center justify-center">
            <span className="text-2xl font-bold text-primary-700">
              {getInitials(`${employee.firstName} ${employee.lastName}`)}
            </span>
          </div>
          
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-2">
              <h2 className="text-xl font-semibold text-gray-900">
                {employee.firstName} {employee.lastName}
              </h2>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getEmploymentStatusColor(employee.status)}`}>
                {employee.status}
              </span>
            </div>
            
            <p className="text-gray-600 mb-2">{employee.jobTitle}</p>
            <p className="text-sm text-gray-500">
              {employee.department?.name} • {formatSalary(employee.salary)} • 
              {getYearsOfService(employee.hireDate)} years of service
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-soft">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                    activeTab === tab.id
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'overview' && renderOverview()}
          {activeTab === 'skills' && (
            <SkillsManager
              employeeId={id}
              skills={skills}
              onAddSkill={() => {}}
              onUpdateSkill={() => {}}
              onRemoveSkill={() => {}}
            />
          )}
          {activeTab === 'certifications' && (
            <CertificationsManager
              employeeId={id}
              certifications={certifications}
              onAddCertification={() => {}}
              onRemoveCertification={() => {}}
            />
          )}
          {activeTab === 'evaluations' && (
            <EvaluationsDisplay evaluations={evaluations} />
          )}
          {activeTab === 'career' && (
            <CareerProgressionTimeline progressions={careerHistory} />
          )}
          {activeTab === 'documents' && renderDocuments()}
        </div>
      </div>
    </motion.div>
  );
};

export default EmployeeDetail;