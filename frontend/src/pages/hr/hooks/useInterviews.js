import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';

import apiClient from '../../../api/axiosClient';
import employeeApi from '../../../api/employeeApi';
import { queryKeys } from '../../../lib/react-query';

/**
 * Hook for fetching all interviews across all candidates
 */
export const useAllInterviews = () => {
  return useQuery({
    queryKey: queryKeys.recruitment.interviews.all,
    queryFn: async () => {
      // First get all job postings
      const jobsResponse = await apiClient.get('/hr/recruitment/jobs');
      const jobs = jobsResponse.data.data;
      
      // Then get candidates for each job
      const allCandidates = [];
      for (const job of jobs) {
        try {
          const candidatesResponse = await apiClient.get(`/hr/recruitment/jobs/${job.id}/candidates`);
          const jobCandidates = candidatesResponse.data.data.map(candidate => ({
            ...candidate,
            jobPosting: job,
            jobPostingId: job.id
          }));
          allCandidates.push(...jobCandidates);
        } catch (error) {
          console.warn(`Failed to fetch candidates for job ${job.id}:`, error);
        }
      }
      
      // Then get interviews for each candidate
      const allInterviews = [];
      for (const candidate of allCandidates) {
        try {
          const interviewsResponse = await apiClient.get(`/hr/recruitment/candidates/${candidate.id}/interviews`);
          const candidateInterviews = interviewsResponse.data.data.map(interview => ({
            ...interview,
            candidate: candidate,
            candidateId: candidate.id
          }));
          allInterviews.push(...candidateInterviews);
        } catch (error) {
          console.warn(`Failed to fetch interviews for candidate ${candidate.id}:`, error);
        }
      }
      
      return allInterviews;
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

/**
 * Hook for fetching all candidates for interview scheduling
 */
export const useAllCandidatesForInterviews = () => {
  return useQuery({
    queryKey: queryKeys.recruitment.candidates.all,
    queryFn: async () => {
      // First get all job postings
      const jobsResponse = await apiClient.get('/hr/recruitment/jobs');
      const jobs = jobsResponse.data.data;
      
      // Then get candidates for each job
      const allCandidates = [];
      for (const job of jobs) {
        try {
          const candidatesResponse = await apiClient.get(`/hr/recruitment/jobs/${job.id}/candidates`);
          const jobCandidates = candidatesResponse.data.data.map(candidate => ({
            ...candidate,
            jobPosting: job,
            jobPostingId: job.id
          }));
          allCandidates.push(...jobCandidates);
        } catch (error) {
          console.warn(`Failed to fetch candidates for job ${job.id}:`, error);
        }
      }
      
      return allCandidates;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

/**
 * Hook for fetching available interviewers
 */
export const useInterviewers = () => {
  return useQuery({
    queryKey: queryKeys.employees.managers,
    queryFn: async () => {
      const res = await employeeApi.listManagers();
      return res.data.data || [];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

/**
 * Hook for scheduling interviews
 */
export const useScheduleInterview = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (interviewData) => {
      const response = await apiClient.post('/hr/recruitment/interviews', interviewData);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.recruitment.interviews.all });
      toast.success('Interview scheduled successfully');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to schedule interview');
    },
  });
};

/**
 * Hook for updating interviews
 */
export const useUpdateInterview = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, data }) => {
      const response = await apiClient.put(`/hr/recruitment/interviews/${id}`, data);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.recruitment.interviews.all });
      toast.success('Interview updated successfully');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update interview');
    },
  });
};

/**
 * Hook for deleting interviews
 */
export const useDeleteInterview = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id) => {
      const response = await apiClient.delete(`/hr/recruitment/interviews/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.recruitment.interviews.all });
      toast.success('Interview deleted successfully');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to delete interview');
    },
  });
};
