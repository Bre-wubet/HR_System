import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { recruitmentApi } from '../api/recruitmentApi';
import toast from 'react-hot-toast';

const useRecruitmentStore = create(
  persist(
    (set, get) => ({
      // State
      jobPostings: [],
      candidates: [],
      interviews: [],
      kpis: null,
      selectedJobPosting: null,
      selectedCandidate: null,
      isLoading: false,
      error: null,

      // Job Postings Operations
      fetchJobPostings: async (params = {}) => {
        set({ isLoading: true, error: null });
        try {
          const response = await recruitmentApi.listJobPostings(params);
          const data = response.data.data;
          set({ jobPostings: data, isLoading: false });
          return { success: true, data };
        } catch (error) {
          const errorMessage = error.response?.data?.message || 'Failed to fetch job postings';
          set({ error: errorMessage, isLoading: false });
          toast.error(errorMessage);
          return { success: false, error: errorMessage };
        }
      },

      createJobPosting: async (jobData) => {
        set({ isLoading: true, error: null });
        try {
          const response = await recruitmentApi.createJobPosting(jobData);
          const newJobPosting = response.data.data;
          set(state => ({
            jobPostings: [newJobPosting, ...state.jobPostings],
            isLoading: false
          }));
          toast.success('Job posting created successfully');
          return { success: true, data: newJobPosting };
        } catch (error) {
          const errorMessage = error.response?.data?.message || 'Failed to create job posting';
          set({ error: errorMessage, isLoading: false });
          toast.error(errorMessage);
          return { success: false, error: errorMessage };
        }
      },

      getJobPostingById: async (id) => {
        set({ isLoading: true, error: null });
        try {
          const response = await recruitmentApi.getJobPostingById(id);
          const jobPosting = response.data.data;
          set({ selectedJobPosting: jobPosting, isLoading: false });
          return { success: true, data: jobPosting };
        } catch (error) {
          const errorMessage = error.response?.data?.message || 'Failed to fetch job posting';
          set({ error: errorMessage, isLoading: false });
          toast.error(errorMessage);
          return { success: false, error: errorMessage };
        }
      },

      updateJobPosting: async (id, updateData) => {
        set({ isLoading: true, error: null });
        try {
          const response = await recruitmentApi.updateJobPosting(id, updateData);
          const updatedJobPosting = response.data.data;
          set(state => ({
            jobPostings: state.jobPostings.map(job => 
              job.id === id ? updatedJobPosting : job
            ),
            selectedJobPosting: state.selectedJobPosting?.id === id ? updatedJobPosting : state.selectedJobPosting,
            isLoading: false
          }));
          toast.success('Job posting updated successfully');
          return { success: true, data: updatedJobPosting };
        } catch (error) {
          const errorMessage = error.response?.data?.message || 'Failed to update job posting';
          set({ error: errorMessage, isLoading: false });
          toast.error(errorMessage);
          return { success: false, error: errorMessage };
        }
      },

      archiveJobPosting: async (id) => {
        set({ isLoading: true, error: null });
        try {
          await recruitmentApi.archiveJobPosting(id);
          set(state => ({
            jobPostings: state.jobPostings.filter(job => job.id !== id),
            selectedJobPosting: state.selectedJobPosting?.id === id ? null : state.selectedJobPosting,
            isLoading: false
          }));
          toast.success('Job posting archived successfully');
          return { success: true };
        } catch (error) {
          const errorMessage = error.response?.data?.message || 'Failed to archive job posting';
          set({ error: errorMessage, isLoading: false });
          toast.error(errorMessage);
          return { success: false, error: errorMessage };
        }
      },

      // Candidate Operations
      fetchCandidatesForJob: async (jobId, params = {}) => {
        set({ isLoading: true, error: null });
        try {
          const response = await recruitmentApi.listCandidatesForJob(jobId, params);
          const data = response.data.data;
          set({ candidates: data, isLoading: false });
          return { success: true, data };
        } catch (error) {
          const errorMessage = error.response?.data?.message || 'Failed to fetch candidates';
          set({ error: errorMessage, isLoading: false });
          toast.error(errorMessage);
          return { success: false, error: errorMessage };
        }
      },

      createCandidateForJob: async (jobId, candidateData) => {
        set({ isLoading: true, error: null });
        try {
          const response = await recruitmentApi.createCandidateForJob(jobId, candidateData);
          const newCandidate = response.data.data;
          set(state => ({
            candidates: [newCandidate, ...state.candidates],
            isLoading: false
          }));
          toast.success('Candidate added successfully');
          return { success: true, data: newCandidate };
        } catch (error) {
          const errorMessage = error.response?.data?.message || 'Failed to add candidate';
          set({ error: errorMessage, isLoading: false });
          toast.error(errorMessage);
          return { success: false, error: errorMessage };
        }
      },

      updateCandidateStage: async (candidateId, stage) => {
        set({ isLoading: true, error: null });
        try {
          const response = await recruitmentApi.updateCandidateStage(candidateId, stage);
          const updatedCandidate = response.data.data;
          set(state => ({
            candidates: state.candidates.map(candidate => 
              candidate.id === candidateId ? updatedCandidate : candidate
            ),
            selectedCandidate: state.selectedCandidate?.id === candidateId ? updatedCandidate : state.selectedCandidate,
            isLoading: false
          }));
          toast.success(`Candidate moved to ${stage} stage`);
          return { success: true, data: updatedCandidate };
        } catch (error) {
          const errorMessage = error.response?.data?.message || 'Failed to update candidate stage';
          set({ error: errorMessage, isLoading: false });
          toast.error(errorMessage);
          return { success: false, error: errorMessage };
        }
      },

      setCandidateScore: async (candidateId, score, feedback) => {
        set({ isLoading: true, error: null });
        try {
          const response = await recruitmentApi.setCandidateScore(candidateId, score, feedback);
          const updatedCandidate = response.data.data;
          set(state => ({
            candidates: state.candidates.map(candidate => 
              candidate.id === candidateId ? updatedCandidate : candidate
            ),
            selectedCandidate: state.selectedCandidate?.id === candidateId ? updatedCandidate : state.selectedCandidate,
            isLoading: false
          }));
          toast.success('Candidate score updated successfully');
          return { success: true, data: updatedCandidate };
        } catch (error) {
          const errorMessage = error.response?.data?.message || 'Failed to update candidate score';
          set({ error: errorMessage, isLoading: false });
          toast.error(errorMessage);
          return { success: false, error: errorMessage };
        }
      },

      hireCandidate: async (candidateId, hireData) => {
        set({ isLoading: true, error: null });
        try {
          const response = await recruitmentApi.hireCandidate(candidateId, hireData);
          const hiredCandidate = response.data.data;
          set(state => ({
            candidates: state.candidates.map(candidate => 
              candidate.id === candidateId ? hiredCandidate : candidate
            ),
            selectedCandidate: state.selectedCandidate?.id === candidateId ? hiredCandidate : state.selectedCandidate,
            isLoading: false
          }));
          toast.success('Candidate hired successfully');
          return { success: true, data: hiredCandidate };
        } catch (error) {
          const errorMessage = error.response?.data?.message || 'Failed to hire candidate';
          set({ error: errorMessage, isLoading: false });
          toast.error(errorMessage);
          return { success: false, error: errorMessage };
        }
      },

      // Interview Operations
      scheduleInterview: async (interviewData) => {
        set({ isLoading: true, error: null });
        try {
          const response = await recruitmentApi.scheduleInterview(interviewData);
          const newInterview = response.data.data;
          set(state => ({
            interviews: [newInterview, ...state.interviews],
            isLoading: false
          }));
          toast.success('Interview scheduled successfully');
          return { success: true, data: newInterview };
        } catch (error) {
          const errorMessage = error.response?.data?.message || 'Failed to schedule interview';
          set({ error: errorMessage, isLoading: false });
          toast.error(errorMessage);
          return { success: false, error: errorMessage };
        }
      },

      updateInterview: async (interviewId, updateData) => {
        set({ isLoading: true, error: null });
        try {
          const response = await recruitmentApi.updateInterview(interviewId, updateData);
          const updatedInterview = response.data.data;
          set(state => ({
            interviews: state.interviews.map(interview => 
              interview.id === interviewId ? updatedInterview : interview
            ),
            isLoading: false
          }));
          toast.success('Interview updated successfully');
          return { success: true, data: updatedInterview };
        } catch (error) {
          const errorMessage = error.response?.data?.message || 'Failed to update interview';
          set({ error: errorMessage, isLoading: false });
          toast.error(errorMessage);
          return { success: false, error: errorMessage };
        }
      },

      fetchInterviewsForCandidate: async (candidateId) => {
        set({ isLoading: true, error: null });
        try {
          const response = await recruitmentApi.listInterviewsForCandidate(candidateId);
          const data = response.data.data;
          set({ interviews: data, isLoading: false });
          return { success: true, data };
        } catch (error) {
          const errorMessage = error.response?.data?.message || 'Failed to fetch interviews';
          set({ error: errorMessage, isLoading: false });
          toast.error(errorMessage);
          return { success: false, error: errorMessage };
        }
      },

      // KPIs and Analytics
      fetchRecruitmentKpis: async () => {
        set({ isLoading: true, error: null });
        try {
          const response = await recruitmentApi.getRecruitmentKpis();
          const data = response.data.data;
          set({ kpis: data, isLoading: false });
          return { success: true, data };
        } catch (error) {
          const errorMessage = error.response?.data?.message || 'Failed to fetch recruitment KPIs';
          set({ error: errorMessage, isLoading: false });
          toast.error(errorMessage);
          return { success: false, error: errorMessage };
        }
      },

      // Utility Actions
      setSelectedJobPosting: (jobPosting) => {
        set({ selectedJobPosting: jobPosting });
      },

      setSelectedCandidate: (candidate) => {
        set({ selectedCandidate: candidate });
      },

      clearError: () => {
        set({ error: null });
      },

      reset: () => {
        set({
          jobPostings: [],
          candidates: [],
          interviews: [],
          kpis: null,
          selectedJobPosting: null,
          selectedCandidate: null,
          isLoading: false,
          error: null,
        });
      },
    }),
    {
      name: 'recruitment-store',
      partialize: (state) => ({
        // Only persist essential data, not loading states
        jobPostings: state.jobPostings,
        selectedJobPosting: state.selectedJobPosting,
        selectedCandidate: state.selectedCandidate,
      }),
    }
  )
);

export default useRecruitmentStore;
