import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  User, 
  Mail, 
  Phone, 
  Calendar, 
  Star, 
  FileText, 
  Download, 
  Eye, 
  Edit3,
  ArrowLeft,
  MapPin,
  Building,
  Clock
} from 'lucide-react';

import { Button } from '../../../../components/ui/Button';
import { Modal } from '../../../../components/ui/Modal';
import { cn } from '../../../../lib/utils';
import CandidateDocumentsSection from './CandidateDocumentsSection';
import useRecruitmentStore from '../../../../stores/useRecruitmentStore';
import { recruitmentUtils } from '../../../../api/recruitmentApi';

/**
 * Candidate Detail View Component
 * Displays comprehensive candidate information including documents
 */
const CandidateDetailView = ({ 
  candidate, 
  onEdit, 
  onClose,
  isLoading = false 
}) => {
  const [documents, setDocuments] = useState([]);
  const [isLoadingDocuments, setIsLoadingDocuments] = useState(false);
  
  const {
    fetchCandidateDocuments,
    uploadCandidateDocument,
    addCandidateDocument,
    removeCandidateDocument
  } = useRecruitmentStore();

  useEffect(() => {
    if (candidate?.id) {
      loadDocuments();
    }
  }, [candidate?.id]);

  const loadDocuments = async () => {
    setIsLoadingDocuments(true);
    try {
      console.log('Loading documents for candidate:', candidate.id);
      const result = await fetchCandidateDocuments(candidate.id);
      console.log('Documents result:', result);
      if (result.success) {
        setDocuments(result.data);
        console.log('Documents set:', result.data);
      } else {
        console.error('Failed to load documents:', result.error);
      }
    } catch (error) {
      console.error('Failed to load documents:', error);
    } finally {
      setIsLoadingDocuments(false);
    }
  };

  const handleFileUpload = async (files) => {
    try {
      for (const file of files) {
        const uploadResult = await uploadCandidateDocument(candidate.id, file);
        if (uploadResult.success) {
          await addCandidateDocument(candidate.id, {
            name: file.name,
            fileUrl: uploadResult.data.fileUrl,
            documentType: getDocumentType(file.name)
          });
          await loadDocuments(); // Refresh documents
        }
      }
    } catch (error) {
      console.error('Error uploading documents:', error);
    }
  };

  const handleRemoveFile = async (file) => {
    try {
      await removeCandidateDocument(candidate.id, file.id);
      await loadDocuments(); // Refresh documents
    } catch (error) {
      console.error('Error removing document:', error);
    }
  };

  const handlePreviewFile = (file) => {
    // Preview functionality handled by CandidateDocumentsSection
  };

  const handleDownloadFile = (file) => {
    if (file.fileUrl) {
      const link = document.createElement('a');
      link.href = file.fileUrl;
      link.download = file.name;
      link.click();
    }
  };

  const getDocumentType = (fileName) => {
    const name = fileName.toLowerCase();
    if (name.includes('resume') || name.includes('cv')) return 'RESUME';
    if (name.includes('cover')) return 'COVER_LETTER';
    if (name.includes('portfolio')) return 'PORTFOLIO';
    if (name.includes('certificate') || name.includes('cert')) return 'CERTIFICATE';
    return 'OTHER';
  };

  if (!candidate) return null;

  const stageInfo = recruitmentUtils.INTERVIEW_STAGES[candidate.stage];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="p-2"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="h-12 w-12 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center">
            <User className="h-6 w-6 text-blue-700" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {candidate.firstName} {candidate.lastName}
            </h1>
            <div className="flex items-center space-x-2 mt-1">
              <span className={cn(
                'px-3 py-1 rounded-full text-sm font-medium',
                `bg-${stageInfo?.color}-100 text-${stageInfo?.color}-800`
              )}>
                {stageInfo?.label}
              </span>
              {candidate.score && (
                <div className="flex items-center space-x-1">
                  <Star className="h-4 w-4 text-yellow-500" />
                  <span className="text-sm font-medium text-gray-700">
                    {candidate.score}/100
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            onClick={() => onEdit(candidate.id)}
            disabled={isLoading}
          >
            <Edit3 className="h-4 w-4 mr-2" />
            Edit Candidate
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Personal Information */}
        <div className="lg:col-span-1 space-y-6">
          {/* Contact Information */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Mail className="h-5 w-5 mr-2 text-blue-600" />
              Contact Information
            </h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Mail className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-700">{candidate.email}</span>
              </div>
              {candidate.phone && (
                <div className="flex items-center space-x-3">
                  <Phone className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-700">{candidate.phone}</span>
                </div>
              )}
            </div>
          </div>

          {/* Application Details */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Calendar className="h-5 w-5 mr-2 text-blue-600" />
              Application Details
            </h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Calendar className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-700">
                  Applied: {recruitmentUtils.formatDate(candidate.createdAt)}
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <Building className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-700">
                  {candidate.jobPosting?.title || 'Unknown Position'}
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <MapPin className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-700">
                  {candidate.jobPosting?.department?.name || 'Unknown Department'}
                </span>
              </div>
            </div>
          </div>

          {/* Score and Feedback */}
          {(candidate.score || candidate.feedback) && (
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Star className="h-5 w-5 mr-2 text-blue-600" />
                Evaluation
              </h3>
              <div className="space-y-3">
                {candidate.score && (
                  <div className="flex items-center space-x-3">
                    <Star className="h-4 w-4 text-yellow-500" />
                    <span className="text-sm font-medium text-gray-700">
                      Score: {candidate.score}/100
                    </span>
                    <span className={cn(
                      'px-2 py-1 rounded-full text-xs font-medium',
                      `bg-${recruitmentUtils.getScoreColor(candidate.score)}-100 text-${recruitmentUtils.getScoreColor(candidate.score)}-800`
                    )}>
                      {recruitmentUtils.getScoreLabel(candidate.score)}
                    </span>
                  </div>
                )}
                {candidate.feedback && (
                  <div>
                    <p className="text-sm text-gray-700">
                      {candidate.feedback}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right Column - Documents */}
        <div className="lg:col-span-2">
          <CandidateDocumentsSection
            candidateId={candidate.id}
            uploadedFiles={[]}
            existingFiles={documents}
            onFileUpload={handleFileUpload}
            onRemoveFile={handleRemoveFile}
            onPreviewFile={handlePreviewFile}
            onDownloadFile={handleDownloadFile}
            isLoading={isLoadingDocuments}
          />
        </div>
      </div>
    </motion.div>
  );
};

export default CandidateDetailView;
