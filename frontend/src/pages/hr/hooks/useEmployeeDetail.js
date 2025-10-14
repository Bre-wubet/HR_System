import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import useEmployeeStore from '../../../stores/useEmployeeStore';
import toast from 'react-hot-toast';

/**
 * Custom hook for employee data management
 * Provides comprehensive employee data fetching and mutations
 */
export const useEmployeeDetail = (employeeId) => {
  const queryClient = useQueryClient();
  const {
    getEmployeeById,
    fetchEmployeeSkills,
    getAllSkills,
    fetchEmployeeCertifications,
    fetchEmployeeEvaluations,
    fetchCareerProgressionHistory,
    fetchEmployeeDocuments,
    addEmployeeSkill,
    updateEmployeeSkill,
    removeEmployeeSkill,
    addEmployeeCertification,
    removeEmployeeCertification,
    addEmployeeDocument,
    removeEmployeeDocument,
  } = useEmployeeStore();

  // Main employee query
  const {
    data: employee,
    isLoading: isLoadingEmployee,
    error: employeeError,
    refetch: refetchEmployee,
  } = useQuery({
    queryKey: ['employee', employeeId],
    queryFn: async () => {
      const result = await getEmployeeById(employeeId);
      return result.success ? result.data : null;
    },
    enabled: !!employeeId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Skills query
  const {
    data: skills = [],
    isLoading: isLoadingSkills,
    refetch: refetchSkills,
  } = useQuery({
    queryKey: ['employee-skills', employeeId],
    queryFn: async () => {
      const result = await fetchEmployeeSkills(employeeId);
      return result.success ? result.data : [];
    },
    enabled: !!employeeId,
  });

  // Available skills query
  const {
    data: availableSkills = [],
    isLoading: isLoadingAvailableSkills,
  } = useQuery({
    queryKey: ['available-skills'],
    queryFn: async () => {
      const result = await getAllSkills();
      return result.success ? result.data : [];
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  // Certifications query
  const {
    data: certifications = [],
    isLoading: isLoadingCertifications,
    refetch: refetchCertifications,
  } = useQuery({
    queryKey: ['employee-certifications', employeeId],
    queryFn: async () => {
      const result = await fetchEmployeeCertifications(employeeId);
      return result.success ? result.data : [];
    },
    enabled: !!employeeId,
  });

  // Evaluations query
  const {
    data: evaluations = [],
    isLoading: isLoadingEvaluations,
    refetch: refetchEvaluations,
  } = useQuery({
    queryKey: ['employee-evaluations', employeeId],
    queryFn: async () => {
      const result = await fetchEmployeeEvaluations(employeeId);
      return result.success ? result.data : [];
    },
    enabled: !!employeeId,
  });

  // Career history query
  const {
    data: careerHistory = [],
    isLoading: isLoadingCareerHistory,
    refetch: refetchCareerHistory,
  } = useQuery({
    queryKey: ['employee-career-history', employeeId],
    queryFn: async () => {
      const result = await fetchCareerProgressionHistory(employeeId);
      return result.success ? result.data : [];
    },
    enabled: !!employeeId,
  });

  // Documents query
  const {
    data: documents = [],
    isLoading: isLoadingDocuments,
    refetch: refetchDocuments,
  } = useQuery({
    queryKey: ['employee-documents', employeeId],
    queryFn: async () => {
      const result = await fetchEmployeeDocuments(employeeId);
      return result.success ? result.data : [];
    },
    enabled: !!employeeId,
  });

  // Mutations
  const addSkillMutation = useMutation({
    mutationFn: ({ employeeId, skillData }) => addEmployeeSkill(employeeId, skillData),
    onSuccess: () => {
      queryClient.invalidateQueries(['employee-skills', employeeId]);
      toast.success('Skill added successfully');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to add skill');
    },
  });

  const updateSkillMutation = useMutation({
    mutationFn: ({ employeeId, assignmentId, skillData }) => 
      updateEmployeeSkill(employeeId, assignmentId, skillData),
    onSuccess: () => {
      queryClient.invalidateQueries(['employee-skills', employeeId]);
      toast.success('Skill updated successfully');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update skill');
    },
  });

  const removeSkillMutation = useMutation({
    mutationFn: ({ employeeId, assignmentId }) => 
      removeEmployeeSkill(employeeId, assignmentId),
    onSuccess: () => {
      queryClient.invalidateQueries(['employee-skills', employeeId]);
      toast.success('Skill removed successfully');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to remove skill');
    },
  });

  const addCertificationMutation = useMutation({
    mutationFn: ({ employeeId, certificationData }) => 
      addEmployeeCertification(employeeId, certificationData),
    onSuccess: () => {
      queryClient.invalidateQueries(['employee-certifications', employeeId]);
      toast.success('Certification added successfully');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to add certification');
    },
  });

  const removeCertificationMutation = useMutation({
    mutationFn: ({ employeeId, certId }) => 
      removeEmployeeCertification(employeeId, certId),
    onSuccess: () => {
      queryClient.invalidateQueries(['employee-certifications', employeeId]);
      toast.success('Certification removed successfully');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to remove certification');
    },
  });

  const addDocumentMutation = useMutation({
    mutationFn: ({ employeeId, documentData }) => 
      addEmployeeDocument(employeeId, documentData),
    onSuccess: () => {
      queryClient.invalidateQueries(['employee-documents', employeeId]);
      toast.success('Document added successfully');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to add document');
    },
  });

  const removeDocumentMutation = useMutation({
    mutationFn: ({ employeeId, docId }) => 
      removeEmployeeDocument(employeeId, docId),
    onSuccess: () => {
      queryClient.invalidateQueries(['employee-documents', employeeId]);
      toast.success('Document removed successfully');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to remove document');
    },
  });

  // Computed values
  const isLoading = isLoadingEmployee || isLoadingSkills || isLoadingCertifications || 
                   isLoadingEvaluations || isLoadingCareerHistory || isLoadingDocuments;

  const hasError = !!employeeError;

  // Refetch all data
  const refetchAll = () => {
    refetchEmployee();
    refetchSkills();
    refetchCertifications();
    refetchEvaluations();
    refetchCareerHistory();
    refetchDocuments();
  };

  return {
    // Data
    employee,
    skills,
    availableSkills,
    certifications,
    evaluations,
    careerHistory,
    documents,
    
    // Loading states
    isLoading,
    isLoadingEmployee,
    isLoadingSkills,
    isLoadingAvailableSkills,
    isLoadingCertifications,
    isLoadingEvaluations,
    isLoadingCareerHistory,
    isLoadingDocuments,
    
    // Error states
    hasError,
    employeeError,
    
    // Actions
    refetchAll,
    refetchEmployee,
    refetchSkills,
    refetchCertifications,
    refetchEvaluations,
    refetchCareerHistory,
    refetchDocuments,
    
    // Mutations
    addSkill: addSkillMutation.mutate,
    updateSkill: updateSkillMutation.mutate,
    removeSkill: removeSkillMutation.mutate,
    addCertification: addCertificationMutation.mutate,
    removeCertification: removeCertificationMutation.mutate,
    addDocument: addDocumentMutation.mutate,
    removeDocument: removeDocumentMutation.mutate,
    
    // Mutation states
    isAddingSkill: addSkillMutation.isPending,
    isUpdatingSkill: updateSkillMutation.isPending,
    isRemovingSkill: removeSkillMutation.isPending,
    isAddingCertification: addCertificationMutation.isPending,
    isRemovingCertification: removeCertificationMutation.isPending,
    isAddingDocument: addDocumentMutation.isPending,
    isRemovingDocument: removeDocumentMutation.isPending,
  };
};

export default useEmployeeDetail;
