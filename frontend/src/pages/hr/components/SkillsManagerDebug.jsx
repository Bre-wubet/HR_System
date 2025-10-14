import React from 'react';
import { motion } from 'framer-motion';
import { Award, Plus, AlertCircle, Loader2, Edit, Trash2 } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { Modal } from '../../../components/ui/Modal';
import { 
  SKILL_LEVELS, 
  getSkillLevelColor, 
  formatDate
} from '../../../api/employeeApi';

/**
 * Debug Skills Manager Component
 * Enhanced version with better error handling and debugging
 */
export const SkillsManager = ({ 
  employeeId, 
  skills = [], 
  availableSkills = [], 
  onAddSkill, 
  onUpdateSkill, 
  onRemoveSkill,
  isLoading = false 
}) => {
  const [showAddModal, setShowAddModal] = React.useState(false);
  const [editingSkill, setEditingSkill] = React.useState(null);
  const [selectedSkill, setSelectedSkill] = React.useState('');
  const [skillLevel, setSkillLevel] = React.useState(1);
  const [evidence, setEvidence] = React.useState('');
  const [notes, setNotes] = React.useState('');

  // Debug logging
  // React.useEffect(() => {
  //   console.log('SkillsManager Debug Info:', {
  //     employeeId,
  //     skills,
  //     skillsLength: skills?.length,
  //     isLoading,
  //     availableSkills: availableSkills?.length
  //   });
  // }, [employeeId, skills, isLoading, availableSkills]);

  const handleAddSkill = async () => {
    if (!selectedSkill) return;
    
    const skillData = {
      skillId: selectedSkill,
      level: skillLevel,
      evidence: evidence.trim() || null,
      notes: notes.trim() || null,
    };

    try {
      const result = await onAddSkill(employeeId, skillData);
      if (result?.success) {
        setShowAddModal(false);
        setSelectedSkill('');
        setSkillLevel(1);
        setEvidence('');
        setNotes('');
      }
    } catch (error) {
      console.error('Error adding skill:', error);
    }
  };

  const handleUpdateSkill = async (assignmentId, skillData) => {
    try {
      const result = await onUpdateSkill(employeeId, assignmentId, skillData);
      if (result?.success) {
        setEditingSkill(null);
      }
    } catch (error) {
      console.error('Error updating skill:', error);
    }
  };

  const handleRemoveSkill = async (assignmentId) => {
    if (window.confirm('Are you sure you want to remove this skill?')) {
      try {
        await onRemoveSkill(employeeId, assignmentId);
      } catch (error) {
        console.error('Error removing skill:', error);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <Award className="h-5 w-5 mr-2 text-blue-600" />
            Skills & Competencies
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            Manage employee skills and proficiency levels
          </p>
        </div>
        <Button 
          size="sm" 
          onClick={() => setShowAddModal(true)}
          disabled={isLoading}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Skill
        </Button>
      </div>

      {/* Debug Information */}
      {/* <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="text-sm font-medium text-blue-800 mb-2">Debug Information</h4>
        <div className="text-xs text-blue-700 space-y-1">
          <p>Employee ID: {employeeId}</p>
          <p>Skills Count: {skills?.length || 0}</p>
          <p>Available Skills: {availableSkills?.length || 0}</p>
          <p>Loading: {isLoading ? 'Yes' : 'No'}</p>
          <p>Skills Data: {JSON.stringify(skills, null, 2)}</p>
        </div>
      </div> */}

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <span className="ml-2 text-gray-600">Loading skills...</span>
        </div>
      )}

      {/* Skills List */}
      {!isLoading && (
        <>
          {skills?.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Award className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-medium mb-2">No skills added yet</p>
              <p className="text-sm text-gray-400 mb-4">
                Add skills to track employee competencies and proficiency levels
              </p>
              <Button 
                size="sm" 
                onClick={() => setShowAddModal(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add First Skill
              </Button>
            </div>
          ) : (
            <div className="grid gap-4">
              {skills.map((skill) => (
                <motion.div
                  key={skill.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h4 className="font-medium text-gray-900">
                          {skill.skill?.name || 'Unknown Skill'}
                        </h4>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSkillLevelColor(skill.level)}`}>
                          Level {skill.level} - {SKILL_LEVELS[skill.level] || 'Unknown'}
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
                        onClick={() => setEditingSkill(skill)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveSkill(skill.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Add Skill Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add Skill"
        size="md"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Skill *
            </label>
            <select
              value={selectedSkill}
              onChange={(e) => setSelectedSkill(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select a skill</option>
              {availableSkills.map((skill) => (
                <option key={skill.id} value={skill.id}>
                  {skill.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Proficiency Level *
            </label>
            <select
              value={skillLevel}
              onChange={(e) => setSkillLevel(Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {Object.entries(SKILL_LEVELS).map(([level, description]) => (
                <option key={level} value={level}>
                  Level {level} - {description}
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
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={3}
              placeholder="Describe evidence of this skill (projects, certifications, etc.)"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={2}
              placeholder="Additional notes about this skill"
            />
          </div>

          <div className="flex justify-end space-x-3">
            <Button variant="outline" onClick={() => setShowAddModal(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleAddSkill}
              disabled={!selectedSkill || isLoading}
            >
              Add Skill
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
