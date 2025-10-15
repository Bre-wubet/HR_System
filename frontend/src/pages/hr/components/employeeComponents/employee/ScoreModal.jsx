import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Star, MessageSquare, Save, X } from 'lucide-react';

import { Button } from '../../../../../components/ui/Button';
import { Modal } from '../../../../../components/ui/Modal';
import { Input } from '../../../../../components/ui/Input';
import { recruitmentUtils } from '../../../../../api/recruitmentApi';

/**
 * Score Modal Component
 * Handles candidate scoring and feedback
 */
const ScoreModal = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  candidate,
  isLoading = false 
}) => {
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  useEffect(() => {
    if (candidate) {
      setScore(candidate.score || 0);
      setFeedback(candidate.feedback || '');
    }
  }, [candidate]);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (score < 0 || score > 100) {
      return;
    }
    
    setIsSubmitting(true);
    try {
      await onSubmit({ candidateId: candidate.id, score, feedback });
      onClose();
    } catch (error) {
      console.error('Error saving score:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
    }
  };
  
  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    if (score >= 40) return 'text-orange-600';
    return 'text-red-600';
  };
  
  const getScoreLabel = (score) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Fair';
    return 'Poor';
  };
  
  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={`Score Candidate: ${candidate?.firstName} ${candidate?.lastName}`}
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Score Section */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Star className="h-5 w-5 text-yellow-500" />
            <h3 className="text-lg font-semibold text-gray-900">Candidate Evaluation</h3>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Overall Score (0-100)
            </label>
            <div className="flex items-center space-x-4">
              <Input
                type="number"
                min="0"
                max="100"
                value={score}
                onChange={(e) => setScore(Number(e.target.value))}
                className="w-24 text-center"
                disabled={isSubmitting}
              />
              <div className="flex-1">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all duration-300 ${
                      score >= 80 ? 'bg-green-500' :
                      score >= 60 ? 'bg-yellow-500' :
                      score >= 40 ? 'bg-orange-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${score}%` }}
                  />
                </div>
              </div>
              <div className={`text-sm font-medium ${getScoreColor(score)}`}>
                {getScoreLabel(score)}
              </div>
            </div>
          </div>
        </div>
        
        {/* Feedback Section */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <MessageSquare className="h-5 w-5 text-blue-500" />
            <h3 className="text-lg font-semibold text-gray-900">Feedback</h3>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Detailed Feedback
            </label>
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              rows={6}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-vertical"
              placeholder="Enter your detailed feedback about the candidate's performance, skills, and potential..."
              disabled={isSubmitting}
            />
          </div>
        </div>
        
        {/* Quick Feedback Templates */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Quick Feedback Templates
          </label>
          <div className="grid grid-cols-2 gap-2">
            {[
              "Strong technical skills and good communication",
              "Meets all requirements, ready for next stage",
              "Good potential but needs more experience",
              "Excellent candidate, highly recommended"
            ].map((template, index) => (
              <button
                key={index}
                type="button"
                onClick={() => setFeedback(template)}
                className="text-left p-2 text-sm text-gray-600 hover:bg-gray-50 rounded border border-gray-200 hover:border-gray-300 transition-colors"
                disabled={isSubmitting}
              >
                {template}
              </button>
            ))}
          </div>
        </div>
        
        {/* Form Actions */}
        <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
          <Button 
            variant="outline" 
            onClick={handleClose}
            disabled={isSubmitting}
          >
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
          <Button 
            type="submit"
            loading={isSubmitting}
            disabled={isSubmitting}
          >
            <Save className="h-4 w-4 mr-2" />
            Save Score
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default ScoreModal;
