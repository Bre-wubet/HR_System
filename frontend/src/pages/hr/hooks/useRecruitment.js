import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { recruitmentApi } from '../../../api/recruitmentApi';
import employeeApi from '../../../api/employeeApi';
import { queryKeys } from '../../../lib/react-query';
import toast from 'react-hot-toast';

/**
 * Hook for fetching job postings with filters
 */
export const useJobPostings = (params = {}) => {
  return useQuery({
    queryKey: queryKeys.recruitment.jobPostings.list(params),
    queryFn: async () => {
      const response = await recruitmentApi.listJobPostings(params);
      return response.data.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

/**
 * Hook for fetching a single job posting
 */
export const useJobPosting = (id) => {
  return useQuery({
    queryKey: queryKeys.recruitment.jobPostings.detail(id),
    queryFn: async () => {
      const response = await recruitmentApi.getJobPostingById(id);
      return response.data.data;
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
};

/**
 * Hook for creating a job posting
 */
export const useCreateJobPosting = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: recruitmentApi.createJobPosting,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.recruitment.jobPostings.all });
      toast.success('Job posting created successfully');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to create job posting');
    },
  });
};

/**
 * Hook for updating a job posting
 */
export const useUpdateJobPosting = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }) => recruitmentApi.updateJobPosting(id, data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.recruitment.jobPostings.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.recruitment.jobPostings.detail(variables.id) });
      toast.success('Job posting updated successfully');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update job posting');
    },
  });
};

/**
 * Hook for archiving a job posting
 */
export const useArchiveJobPosting = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: recruitmentApi.archiveJobPosting,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.recruitment.jobPostings.all });
      toast.success('Job posting archived successfully');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to archive job posting');
    },
  });
};

/**
 * Hook for deleting a job posting
 */
export const useDeleteJobPosting = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: recruitmentApi.deleteJobPosting,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.recruitment.jobPostings.all });
      toast.success('Job posting deleted successfully');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to delete job posting');
    },
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
 * Hook for fetching candidates for a job
 */
export const useCandidatesForJob = (jobId, params = {}) => {
  return useQuery({
    queryKey: queryKeys.recruitment.candidates.list(jobId),
    queryFn: async () => {
      const response = await recruitmentApi.listCandidatesForJob(jobId, params);
      return response.data.data;
    },
    enabled: !!jobId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

/**
 * Hook for creating a candidate
 */
export const useCreateCandidate = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ jobId, data }) => recruitmentApi.createCandidateForJob(jobId, data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.recruitment.candidates.list(variables.jobId) });
      toast.success('Candidate added successfully');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to add candidate');
    },
  });
};

/**
 * Hook for updating candidate stage
 */
export const useUpdateCandidateStage = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ candidateId, stage }) => recruitmentApi.updateCandidateStage(candidateId, stage),
    onSuccess: (data, variables) => {
      // Invalidate all candidate queries since stage affects multiple views
      queryClient.invalidateQueries({ queryKey: queryKeys.recruitment.candidates.all });
      toast.success(`Candidate moved to ${variables.stage} stage`);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update candidate stage');
    },
  });
};

/**
 * Hook for setting candidate score
 */
export const useSetCandidateScore = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ candidateId, score, feedback }) => 
      recruitmentApi.setCandidateScore(candidateId, score, feedback),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.recruitment.candidates.all });
      toast.success('Candidate score updated successfully');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update candidate score');
    },
  });
};

/**
 * Hook for hiring a candidate
 */
export const useHireCandidate = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ candidateId, data }) => recruitmentApi.hireCandidate(candidateId, data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.recruitment.candidates.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.recruitment.kpis });
      toast.success('Candidate hired successfully');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to hire candidate');
    },
  });
};

/**
 * Hook for scheduling an interview
 */
export const useScheduleInterview = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: recruitmentApi.scheduleInterview,
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.recruitment.candidates.interviews(variables.candidateId) 
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.recruitment.interviews.all });
      toast.success('Interview scheduled successfully');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to schedule interview');
    },
  });
};

/**
 * Hook for updating an interview
 */
export const useUpdateInterview = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ interviewId, data }) => recruitmentApi.updateInterview(interviewId, data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.recruitment.interviews.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.recruitment.interviews.detail(variables.interviewId) });
      toast.success('Interview updated successfully');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update interview');
    },
  });
};

/**
 * Hook for fetching interviews for a candidate
 */
export const useInterviewsForCandidate = (candidateId) => {
  return useQuery({
    queryKey: queryKeys.recruitment.candidates.interviews(candidateId),
    queryFn: async () => {
      const response = await recruitmentApi.listInterviewsForCandidate(candidateId);
      return response.data.data;
    },
    enabled: !!candidateId,
    staleTime: 2 * 60 * 1000,
  });
};

/**
 * Hook for fetching recruitment KPIs
 */
export const useRecruitmentKpis = () => {
  return useQuery({
    queryKey: queryKeys.recruitment.kpis,
    queryFn: async () => {
      const response = await recruitmentApi.getRecruitmentKpis();
      return response.data.data;
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

/**
 * Hook for generating offer letter
 */
export const useGenerateOfferLetter = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ candidateId, data }) => recruitmentApi.generateOfferLetter(candidateId, data),
    onSuccess: () => {
      toast.success('Offer letter generated successfully');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to generate offer letter');
    },
  });
};

/**
 * Hook for creating employment contract
 */
export const useCreateEmploymentContract = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ candidateId, data }) => recruitmentApi.createEmploymentContract(candidateId, data),
    onSuccess: () => {
      toast.success('Employment contract created successfully');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to create employment contract');
    },
  });
};

/**
 * Hook for creating onboarding checklist
 */
export const useCreateOnboardingChecklist = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ candidateId, data }) => recruitmentApi.createOnboardingChecklist(candidateId, data),
    onSuccess: () => {
      toast.success('Onboarding checklist created successfully');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to create onboarding checklist');
    },
  });
};

/**
 * Comprehensive hook for recruitment data management
 * Combines multiple queries and mutations for a specific job posting
 */
export const useRecruitmentDetail = (jobId) => {
  const queryClient = useQueryClient();
  
  // Fetch job posting details
  const { data: jobPosting, isLoading: isLoadingJob, error: jobError } = useJobPosting(jobId);
  
  // Fetch candidates for this job
  const { data: candidates, isLoading: isLoadingCandidates, error: candidatesError } = useCandidatesForJob(jobId);
  
  // Fetch available interviewers
  const { data: interviewers = [] } = useInterviewers();
  
  // Mutations
  const createCandidateMutation = useCreateCandidate();
  const updateStageMutation = useUpdateCandidateStage();
  const setScoreMutation = useSetCandidateScore();
  const hireMutation = useHireCandidate();
  const scheduleInterviewMutation = useScheduleInterview();
  
  const isLoading = isLoadingJob || isLoadingCandidates;
  const hasError = jobError || candidatesError;
  
  const refetchAll = () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.recruitment.jobPostings.detail(jobId) });
    queryClient.invalidateQueries({ queryKey: queryKeys.recruitment.candidates.list(jobId) });
  };
  
  return {
    // Data
    jobPosting,
    candidates: candidates || [],
    interviewers,
    
    // Loading states
    isLoading,
    isLoadingJob,
    isLoadingCandidates,
    
    // Error states
    hasError,
    jobError,
    candidatesError,
    
    // Actions
    refetchAll,
    createCandidate: createCandidateMutation.mutate,
    updateCandidateStage: updateStageMutation.mutate,
    setCandidateScore: setScoreMutation.mutate,
    hireCandidate: hireMutation.mutate,
    scheduleInterview: scheduleInterviewMutation.mutate,
    
    // Mutation states
    isCreatingCandidate: createCandidateMutation.isPending,
    isUpdatingStage: updateStageMutation.isPending,
    isSettingScore: setScoreMutation.isPending,
    isHiring: hireMutation.isPending,
    isSchedulingInterview: scheduleInterviewMutation.isPending,
  };
};
