import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Star, 
  Calendar, 
  Award, 
  FileText, 
  Download,
  ExternalLink,
  CheckCircle,
  AlertCircle,
  Clock
} from 'lucide-react';

import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { 
  SKILL_LEVELS, 
  getSkillLevelColor, 
  formatDate, 
  formatDateTime,
  isCertificationExpired,
  isCertificationExpiringSoon 
} from '../../api/employeeApi';

// Skills Management Component
export const SkillsManager = ({ 
  employeeId, 
  skills = [], 
  availableSkills = [], 
  onAddSkill, 
  onUpdateSkill, 
  onRemoveSkill,
  isLoading = false 
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingSkill, setEditingSkill] = useState(null);
  const [selectedSkill, setSelectedSkill] = useState('');
  const [skillLevel, setSkillLevel] = useState(1);
  const [evidence, setEvidence] = useState('');
  const [notes, setNotes] = useState('');

  const handleAddSkill = async () => {
    if (!selectedSkill) return;
    
    const skillData = {
      skillId: selectedSkill,
      level: skillLevel,
      evidence,
      notes,
    };

    const result = await onAddSkill(employeeId, skillData);
    if (result.success) {
      setShowAddModal(false);
      resetForm();
    }
  };

  const handleUpdateSkill = async () => {
    if (!editingSkill) return;
    
    const skillData = {
      level: skillLevel,
      evidence,
      notes,
    };

    const result = await onUpdateSkill(employeeId, editingSkill.id, skillData);
    if (result.success) {
      setEditingSkill(null);
      resetForm();
    }
  };

  const handleRemoveSkill = async (assignmentId) => {
    if (window.confirm('Are you sure you want to remove this skill?')) {
      await onRemoveSkill(employeeId, assignmentId);
    }
  };

  const resetForm = () => {
    setSelectedSkill('');
    setSkillLevel(1);
    setEvidence('');
    setNotes('');
  };

  const openEditModal = (skill) => {
    setEditingSkill(skill);
    setSkillLevel(skill.level);
    setEvidence(skill.evidence || '');
    setNotes(skill.notes || '');
    setShowAddModal(true);
  };

  const closeModal = () => {
    setShowAddModal(false);
    setEditingSkill(null);
    resetForm();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Skills</h3>
        <Button 
          size="sm" 
          onClick={() => setShowAddModal(true)}
          disabled={isLoading}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Skill
        </Button>
      </div>

      {skills.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <Award className="h-12 w-12 mx-auto mb-4 text-gray-300" />
          <p>No skills added yet</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {skills.map((skill) => (
            <motion.div
              key={skill.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-lg border border-gray-200 p-4"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h4 className="font-medium text-gray-900">{skill.skill.name}</h4>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSkillLevelColor(skill.level)}`}>
                      Level {skill.level} - {SKILL_LEVELS[skill.level]}
                    </span>
                  </div>
                  
                  {skill.evidence && (
                    <p className="text-sm text-gray-600 mb-2">
                      <strong>Evidence:</strong> {skill.evidence}
                    </p>
                  )}
                  
                  {skill.notes && (
                    <p className="text-sm text-gray-600 mb-2">
                      <strong>Notes:</strong> {skill.notes}
                    </p>
                  )}
                  
                  <div className="flex items-center space-x-4 text-xs text-gray-500">
                    {skill.assessedBy && (
                      <span>Assessed by: {skill.assessedBy.firstName} {skill.assessedBy.lastName}</span>
                    )}
                    {skill.assessedAt && (
                      <span>Assessed: {formatDate(skill.assessedAt)}</span>
                    )}
                    {skill.isSelfAssessed && (
                      <span className="text-blue-600">Self-assessed</span>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => openEditModal(skill)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveSkill(skill.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Add/Edit Skill Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={closeModal}
        title={editingSkill ? 'Edit Skill' : 'Add Skill'}
        size="md"
      >
        <div className="space-y-4">
          {!editingSkill && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Skill
              </label>
              <select
                value={selectedSkill}
                onChange={(e) => setSelectedSkill(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="">Select a skill</option>
                {availableSkills.map((skill) => (
                  <option key={skill.id} value={skill.id}>
                    {skill.name} - {skill.category}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Skill Level
            </label>
            <select
              value={skillLevel}
              onChange={(e) => setSkillLevel(Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              {Object.entries(SKILL_LEVELS).map(([level, name]) => (
                <option key={level} value={level}>
                  Level {level} - {name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Evidence
            </label>
            <textarea
              value={evidence}
              onChange={(e) => setEvidence(e.target.value)}
              placeholder="Describe evidence of this skill level..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              rows={3}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Additional notes..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              rows={2}
            />
          </div>

          <div className="flex justify-end space-x-3">
            <Button variant="outline" onClick={closeModal}>
              Cancel
            </Button>
            <Button 
              onClick={editingSkill ? handleUpdateSkill : handleAddSkill}
              disabled={!selectedSkill && !editingSkill}
            >
              {editingSkill ? 'Update Skill' : 'Add Skill'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

// Certifications Management Component
export const CertificationsManager = ({ 
  employeeId, 
  certifications = [], 
  onAddCertification, 
  onRemoveCertification,
  isLoading = false 
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [certificationData, setCertificationData] = useState({
    name: '',
    issuer: '',
    issuedAt: '',
    expiresAt: '',
    credentialId: '',
    documentUrl: '',
  });

  const handleAddCertification = async () => {
    if (!certificationData.name || !certificationData.issuedAt) return;
    
    const result = await onAddCertification(employeeId, certificationData);
    if (result.success) {
      setShowAddModal(false);
      setCertificationData({
        name: '',
        issuer: '',
        issuedAt: '',
        expiresAt: '',
        credentialId: '',
        documentUrl: '',
      });
    }
  };

  const handleRemoveCertification = async (certId) => {
    if (window.confirm('Are you sure you want to remove this certification?')) {
      await onRemoveCertification(employeeId, certId);
    }
  };

  const getCertificationStatus = (cert) => {
    if (!cert.expiresAt) return { status: 'active', color: 'text-success-600', icon: CheckCircle };
    if (isCertificationExpired(cert.expiresAt)) return { status: 'expired', color: 'text-error-600', icon: AlertCircle };
    if (isCertificationExpiringSoon(cert.expiresAt)) return { status: 'expiring', color: 'text-warning-600', icon: Clock };
    return { status: 'active', color: 'text-success-600', icon: CheckCircle };
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Certifications</h3>
        <Button 
          size="sm" 
          onClick={() => setShowAddModal(true)}
          disabled={isLoading}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Certification
        </Button>
      </div>

      {certifications.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <Award className="h-12 w-12 mx-auto mb-4 text-gray-300" />
          <p>No certifications added yet</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {certifications.map((cert) => {
            const status = getCertificationStatus(cert);
            const StatusIcon = status.icon;
            
            return (
              <motion.div
                key={cert.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-lg border border-gray-200 p-4"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h4 className="font-medium text-gray-900">{cert.name}</h4>
                      <StatusIcon className={`h-4 w-4 ${status.color}`} />
                    </div>
                    
                    {cert.issuer && (
                      <p className="text-sm text-gray-600 mb-1">
                        <strong>Issuer:</strong> {cert.issuer}
                      </p>
                    )}
                    
                    {cert.credentialId && (
                      <p className="text-sm text-gray-600 mb-1">
                        <strong>Credential ID:</strong> {cert.credentialId}
                      </p>
                    )}
                    
                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                      <span>Issued: {formatDate(cert.issuedAt)}</span>
                      {cert.expiresAt && (
                        <span>Expires: {formatDate(cert.expiresAt)}</span>
                      )}
                    </div>
                    
                    {cert.documentUrl && (
                      <div className="mt-2">
                        <a
                          href={cert.documentUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center text-sm text-primary-600 hover:text-primary-500"
                        >
                          <ExternalLink className="h-4 w-4 mr-1" />
                          View Certificate
                        </a>
                      </div>
                    )}
                  </div>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveCertification(cert.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Add Certification Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add Certification"
        size="md"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Certification Name *
            </label>
            <input
              type="text"
              value={certificationData.name}
              onChange={(e) => setCertificationData({ ...certificationData, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="e.g., AWS Certified Solutions Architect"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Issuer
            </label>
            <input
              type="text"
              value={certificationData.issuer}
              onChange={(e) => setCertificationData({ ...certificationData, issuer: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="e.g., Amazon Web Services"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Credential ID
            </label>
            <input
              type="text"
              value={certificationData.credentialId}
              onChange={(e) => setCertificationData({ ...certificationData, credentialId: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="e.g., AWS-123456"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Issue Date *
            </label>
            <input
              type="date"
              value={certificationData.issuedAt}
              onChange={(e) => setCertificationData({ ...certificationData, issuedAt: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Expiration Date
            </label>
            <input
              type="date"
              value={certificationData.expiresAt}
              onChange={(e) => setCertificationData({ ...certificationData, expiresAt: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Document URL
            </label>
            <input
              type="url"
              value={certificationData.documentUrl}
              onChange={(e) => setCertificationData({ ...certificationData, documentUrl: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="https://..."
            />
          </div>

          <div className="flex justify-end space-x-3">
            <Button variant="outline" onClick={() => setShowAddModal(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleAddCertification}
              disabled={!certificationData.name || !certificationData.issuedAt}
            >
              Add Certification
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

// Evaluations Display Component
export const EvaluationsDisplay = ({ evaluations = [] }) => {
  const getScoreColor = (score) => {
    if (score >= 8) return 'text-success-600 bg-success-100';
    if (score >= 6) return 'text-warning-600 bg-warning-100';
    return 'text-error-600 bg-error-100';
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">Evaluations</h3>

      {evaluations.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
          <p>No evaluations yet</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {evaluations.map((evaluation) => (
            <motion.div
              key={evaluation.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-lg border border-gray-200 p-4"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getScoreColor(evaluation.score)}`}>
                    Score: {evaluation.score}/10
                  </span>
                  {evaluation.probation && (
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-warning-100 text-warning-800">
                      Probation
                    </span>
                  )}
                </div>
                <span className="text-sm text-gray-500">
                  {formatDate(evaluation.date)}
                </span>
              </div>
              
              {evaluation.feedback && (
                <p className="text-gray-700 mb-2">{evaluation.feedback}</p>
              )}
              
              {evaluation.evaluator && (
                <p className="text-sm text-gray-500">
                  Evaluated by: {evaluation.evaluator.firstName} {evaluation.evaluator.lastName}
                </p>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

// Career Progression Timeline Component
export const CareerProgressionTimeline = ({ progressions = [] }) => {
  const getProgressionIcon = (type) => {
    switch (type) {
      case 'PROMOTION':
        return <Star className="h-5 w-5 text-success-600" />;
      case 'TRANSFER':
        return <ExternalLink className="h-5 w-5 text-primary-600" />;
      default:
        return <Calendar className="h-5 w-5 text-gray-600" />;
    }
  };

  const getProgressionColor = (type) => {
    switch (type) {
      case 'PROMOTION':
        return 'border-success-200 bg-success-50';
      case 'TRANSFER':
        return 'border-primary-200 bg-primary-50';
      default:
        return 'border-gray-200 bg-gray-50';
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">Career Progression</h3>

      {progressions.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300" />
          <p>No career progression history</p>
        </div>
      ) : (
        <div className="space-y-4">
          {progressions.map((progression, index) => (
            <motion.div
              key={progression.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`relative border-l-4 ${getProgressionColor(progression.type)} p-4 rounded-r-lg`}
            >
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  {getProgressionIcon(progression.type)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-900 capitalize">
                      {progression.type.toLowerCase()}
                    </h4>
                    <span className="text-sm text-gray-500">
                      {formatDate(progression.effectiveDate)}
                    </span>
                  </div>
                  
                  {progression.type === 'PROMOTION' && (
                    <div className="space-y-1">
                      {progression.previousJobTitle && progression.newJobTitle && (
                        <p className="text-sm text-gray-600">
                          <strong>From:</strong> {progression.previousJobTitle} → <strong>To:</strong> {progression.newJobTitle}
                        </p>
                      )}
                      {progression.previousSalary && progression.newSalary && (
                        <p className="text-sm text-gray-600">
                          <strong>Salary:</strong> ${progression.previousSalary.toLocaleString()} → ${progression.newSalary.toLocaleString()}
                        </p>
                      )}
                    </div>
                  )}
                  
                  {progression.type === 'TRANSFER' && (
                    <div className="space-y-1">
                      {progression.previousDepartmentId && progression.newDepartmentId && (
                        <p className="text-sm text-gray-600">
                          Department transfer
                        </p>
                      )}
                      {progression.previousManagerId && progression.newManagerId && (
                        <p className="text-sm text-gray-600">
                          Manager change
                        </p>
                      )}
                    </div>
                  )}
                  
                  {progression.reason && (
                    <p className="text-sm text-gray-600 mt-2">
                      <strong>Reason:</strong> {progression.reason}
                    </p>
                  )}
                  
                  {progression.approvedBy && (
                    <p className="text-xs text-gray-500 mt-2">
                      Approved by: {progression.approvedBy.firstName} {progression.approvedBy.lastName}
                    </p>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default {
  SkillsManager,
  CertificationsManager,
  EvaluationsDisplay,
  CareerProgressionTimeline,
};
