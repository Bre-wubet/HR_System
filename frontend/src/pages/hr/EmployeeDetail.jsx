import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User,
  Award,
  FileText,
  Star,
  TrendingUp,
  Clock,
} from 'lucide-react';

// Import custom hooks and components
import { useEmployeeDetail } from './hooks/useEmployeeDetail';
import EmployeeDetailHeader from './components/EmployeeDetailHeader';
import TabNavigation from './components/TabNavigation';
import EmployeeOverview from './components/EmployeeOverview';
import EmployeeDocuments from './components/EmployeeDocuments';
import { EmployeeDetailSkeleton, TabContentSkeleton } from './components/LoadingSkeletons';
import { ErrorBoundary, EmployeeNotFound } from './components/ErrorStates';

// Import existing components
import { 
  SkillsManager, 
  CertificationsManager, 
  EvaluationsDisplay, 
  CareerProgressionTimeline 
} from '../../components/hr/EmployeeComponents';


const EmployeeDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');

  // Custom hook for employee data management
  const {
    employee,
    skills,
    certifications,
    evaluations,
    careerHistory,
    documents,
    isLoading,
    isLoadingEmployee,
    hasError,
    employeeError,
    refetchAll,
    addSkill,
    updateSkill,
    removeSkill,
    addCertification,
    removeCertification,
    addDocument,
    removeDocument,
    isAddingSkill,
    isUpdatingSkill,
    isRemovingSkill,
    isAddingCertification,
    isRemovingCertification,
    isAddingDocument,
    isRemovingDocument,
  } = useEmployeeDetail(id);

  // Tab configuration
  const tabs = useMemo(() => [
    { id: 'overview', label: 'Overview', icon: User },
    { id: 'skills', label: 'Skills', icon: Award },
    { id: 'certifications', label: 'Certifications', icon: FileText },
    { id: 'evaluations', label: 'Evaluations', icon: Star },
    { id: 'career', label: 'Career History', icon: TrendingUp },
    { id: 'documents', label: 'Documents', icon: FileText },
  ], []);

  // Event handlers
  const handleBack = () => navigate('/employees');
  const handleEdit = () => navigate(`/employees/${id}/edit`);
  const handleShare = () => {
    // TODO: Implement share functionality
    console.log('Share employee:', employee);
  };
  const handleDownload = () => {
    // TODO: Implement download/export functionality
    console.log('Download employee data:', employee);
  };

  const handleRetry = () => {
    refetchAll();
  };

  const handleGoHome = () => {
    navigate('/employees');
  };

  // Skill handlers
  const handleAddSkill = async (employeeId, skillData) => {
    return addSkill({ employeeId, skillData });
  };

  const handleUpdateSkill = async (employeeId, assignmentId, skillData) => {
    return updateSkill({ employeeId, assignmentId, skillData });
  };

  const handleRemoveSkill = async (employeeId, assignmentId) => {
    return removeSkill({ employeeId, assignmentId });
  };

  // Certification handlers
  const handleAddCertification = async (employeeId, certificationData) => {
    return addCertification({ employeeId, certificationData });
  };

  const handleRemoveCertification = async (employeeId, certId) => {
    return removeCertification({ employeeId, certId });
  };

  // Document handlers
  const handleAddDocument = async (employeeId, documentData) => {
    return addDocument({ employeeId, documentData });
  };

  const handleRemoveDocument = async (employeeId, docId) => {
    return removeDocument({ employeeId, docId });
  };

  // Loading state
  if (isLoadingEmployee) {
    return <EmployeeDetailSkeleton />;
  }

  // Error state
  if (hasError) {
    return (
      <ErrorBoundary
        error={employeeError}
        onRetry={handleRetry}
        onGoHome={handleGoHome}
        isLoading={isLoading}
      />
    );
  }

  // Not found state
  if (!employee) {
    return <EmployeeNotFound onBack={handleBack} />;
  }

  // Render tab content
  const renderTabContent = () => {
    const isTabLoading = isLoading && !isLoadingEmployee;

    switch (activeTab) {
      case 'overview':
        return <EmployeeOverview employee={employee} isLoading={isTabLoading} />;
      
      case 'skills':
        return isTabLoading ? (
          <TabContentSkeleton />
        ) : (
          <SkillsManager
            employeeId={id}
            skills={skills}
            onAddSkill={handleAddSkill}
            onUpdateSkill={handleUpdateSkill}
            onRemoveSkill={handleRemoveSkill}
            isLoading={isAddingSkill || isUpdatingSkill || isRemovingSkill}
          />
        );
      
      case 'certifications':
        return isTabLoading ? (
          <TabContentSkeleton />
        ) : (
          <CertificationsManager
            employeeId={id}
            certifications={certifications}
            onAddCertification={handleAddCertification}
            onRemoveCertification={handleRemoveCertification}
            isLoading={isAddingCertification || isRemovingCertification}
          />
        );
      
      case 'evaluations':
        return isTabLoading ? (
          <TabContentSkeleton />
        ) : (
          <EvaluationsDisplay evaluations={evaluations} />
        );
      
      case 'career':
        return isTabLoading ? (
          <TabContentSkeleton />
        ) : (
          <CareerProgressionTimeline progressions={careerHistory} />
        );
      
      case 'documents':
        return isTabLoading ? (
          <TabContentSkeleton />
        ) : (
          <EmployeeDocuments
            employeeId={id}
            documents={documents}
            onAddDocument={handleAddDocument}
            onRemoveDocument={handleRemoveDocument}
            isLoading={isAddingDocument || isRemovingDocument}
          />
        );
      
      default:
        return <EmployeeOverview employee={employee} isLoading={isTabLoading} />;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header */}
      <EmployeeDetailHeader
        employee={employee}
        onBack={handleBack}
        onEdit={handleEdit}
        onShare={handleShare}
        onDownload={handleDownload}
        isLoading={isLoading}
      />

      {/* Tab Navigation */}
      <TabNavigation
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        isLoading={isLoading}
      />

      {/* Tab Content */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              {renderTabContent()}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
};

export default EmployeeDetail;