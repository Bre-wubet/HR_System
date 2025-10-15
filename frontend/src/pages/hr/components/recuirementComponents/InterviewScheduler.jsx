import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Calendar, 
  Clock, 
  User, 
  MapPin, 
  Video, 
  Phone,
  Save,
  X
} from 'lucide-react';

import { Button } from '../../../../components/ui/Button';
import { Modal } from '../../../../components/ui/Modal';
import { Input } from '../../../../components/ui/Input';
import { recruitmentUtils } from '../../../../api/recruitmentApi';
import { cn } from '../../../../lib/utils';

/**
 * Interview Scheduler Component
 * Handles scheduling interviews for candidates
 */
const InterviewScheduler = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  candidate,
  interviewers = [],
  isLoading = false 
}) => {
  const [formData, setFormData] = useState({
    candidateId: '',
    interviewerId: '',
    date: '',
    time: '',
    duration: 60,
    type: 'IN_PERSON',
    location: '',
    meetingLink: '',
    notes: '',
  });
  
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  useEffect(() => {
    if (candidate) {
      setFormData(prev => ({
        ...prev,
        candidateId: candidate.id,
        date: '',
        time: '',
      }));
    }
  }, [candidate]);
  
  useEffect(() => {
    if (isOpen) {
      setErrors({});
      setIsSubmitting(false);
    }
  }, [isOpen]);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const validation = recruitmentUtils.validateInterview(formData);
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }
    
    setIsSubmitting(true);
    try {
      const interviewData = {
        ...formData,
        date: new Date(`${formData.date}T${formData.time}`).toISOString(),
      };
      await onSubmit(interviewData);
      onClose();
    } catch (error) {
      console.error('Error scheduling interview:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };
  
  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
    }
  };
  
  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={`Schedule Interview: ${candidate?.firstName} ${candidate?.lastName}`}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Interview Details */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Calendar className="h-5 w-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">Interview Details</h3>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Interview Date *
              </label>
              <Input
                type="date"
                value={formData.date}
                onChange={(e) => handleChange('date', e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className={errors.date && 'border-red-500'}
                disabled={isSubmitting}
              />
              {errors.date && (
                <p className="text-sm text-red-600 mt-1">{errors.date}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Interview Time *
              </label>
              <Input
                type="time"
                value={formData.time}
                onChange={(e) => handleChange('time', e.target.value)}
                className={errors.time && 'border-red-500'}
                disabled={isSubmitting}
              />
              {errors.time && (
                <p className="text-sm text-red-600 mt-1">{errors.time}</p>
              )}
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Duration (minutes)
              </label>
              <select
                value={formData.duration}
                onChange={(e) => handleChange('duration', Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={isSubmitting}
              >
                <option value={30}>30 minutes</option>
                <option value={60}>1 hour</option>
                <option value={90}>1.5 hours</option>
                <option value={120}>2 hours</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Interview Type
              </label>
              <select
                value={formData.type}
                onChange={(e) => handleChange('type', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={isSubmitting}
              >
                <option value="IN_PERSON">In Person</option>
                <option value="VIDEO">Video Call</option>
                <option value="PHONE">Phone Call</option>
              </select>
            </div>
          </div>
        </div>
        
        {/* Interviewer Selection */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <User className="h-5 w-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">Interviewer</h3>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Select Interviewer *
            </label>
            <select
              value={formData.interviewerId}
              onChange={(e) => handleChange('interviewerId', e.target.value)}
              className={cn(
                'w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent',
                errors.interviewerId && 'border-red-500'
              )}
              disabled={isSubmitting}
            >
              <option value="">Select an interviewer</option>
              {interviewers.map(interviewer => (
                <option key={interviewer.id} value={interviewer.id}>
                  {interviewer.firstName} {interviewer.lastName} - {interviewer.jobTitle}
                </option>
              ))}
            </select>
            {errors.interviewerId && (
              <p className="text-sm text-red-600 mt-1">{errors.interviewerId}</p>
            )}
          </div>
        </div>
        
        {/* Location/Meeting Details */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <MapPin className="h-5 w-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">Location Details</h3>
          </div>
          
          {formData.type === 'IN_PERSON' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Meeting Location
              </label>
              <Input
                value={formData.location}
                onChange={(e) => handleChange('location', e.target.value)}
                placeholder="e.g., Conference Room A, Office Building"
                disabled={isSubmitting}
              />
            </div>
          )}
          
          {formData.type === 'VIDEO' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Meeting Link
              </label>
              <Input
                value={formData.meetingLink}
                onChange={(e) => handleChange('meetingLink', e.target.value)}
                placeholder="https://meet.google.com/..."
                disabled={isSubmitting}
              />
            </div>
          )}
        </div>
        
        {/* Additional Notes */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Clock className="h-5 w-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">Additional Information</h3>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => handleChange('notes', e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-vertical"
              placeholder="Any additional notes or instructions for the interview..."
              disabled={isSubmitting}
            />
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
            Schedule Interview
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default InterviewScheduler;
