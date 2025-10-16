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
import { cn } from '../../../../lib/utils';

/**
 * Interview Form Component
 * Handles creating and editing interviews
 */
const InterviewForm = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  interview = null, 
  candidates = [],
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
  
  const isEdit = !!interview;
  
  useEffect(() => {
    if (isOpen) {
      if (interview) {
        const interviewDate = new Date(interview.date);
        setFormData({
          candidateId: interview.candidateId || '',
          interviewerId: interview.interviewerId || '',
          date: interviewDate.toISOString().split('T')[0],
          time: interviewDate.toTimeString().slice(0, 5),
          duration: interview.duration || 60,
          type: interview.type || 'IN_PERSON',
          location: interview.location || '',
          meetingLink: interview.meetingLink || '',
          notes: interview.notes || '',
        });
      } else {
        setFormData({
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
      }
      setErrors({});
      setIsSubmitting(false);
    }
  }, [interview, isOpen]);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Basic validation
    const newErrors = {};
    if (!formData.candidateId) newErrors.candidateId = 'Please select a candidate';
    if (!formData.interviewerId) newErrors.interviewerId = 'Please select an interviewer';
    if (!formData.date) newErrors.date = 'Please select a date';
    if (!formData.time) newErrors.time = 'Please select a time';
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
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
      console.error('Error submitting interview:', error);
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
      title={isEdit ? 'Edit Interview' : 'Schedule New Interview'}
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
                className={cn(errors.date && 'border-red-500')}
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
                className={cn(errors.time && 'border-red-500')}
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
        
        {/* Participants */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <User className="h-5 w-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">Participants</h3>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Candidate *
              </label>
              <select
                value={formData.candidateId}
                onChange={(e) => handleChange('candidateId', e.target.value)}
                className={cn(
                  'w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent',
                  errors.candidateId && 'border-red-500'
                )}
                disabled={isSubmitting}
              >
                <option value="">Select a candidate</option>
                {candidates.map(candidate => (
                  <option key={candidate.id} value={candidate.id}>
                    {candidate.firstName} {candidate.lastName} - {candidate.jobPosting?.title}
                  </option>
                ))}
              </select>
              {errors.candidateId && (
                <p className="text-sm text-red-600 mt-1">{errors.candidateId}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Interviewer *
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
        </div>
        
        {/* Location/Meeting Details */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <MapPin className="h-5 w-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">Location & Meeting Details</h3>
          </div>
          
          {formData.type === 'IN_PERSON' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Location
              </label>
              <Input
                value={formData.location}
                onChange={(e) => handleChange('location', e.target.value)}
                placeholder="e.g., Conference Room A, Office Building"
                disabled={isSubmitting}
              />
            </div>
          )}
          
          {(formData.type === 'VIDEO' || formData.type === 'PHONE') && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Meeting Link / Phone Number
              </label>
              <Input
                value={formData.meetingLink}
                onChange={(e) => handleChange('meetingLink', e.target.value)}
                placeholder={formData.type === 'VIDEO' ? 'Meeting link (Zoom, Teams, etc.)' : 'Phone number'}
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
            {isEdit ? 'Update Interview' : 'Schedule Interview'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default InterviewForm;
