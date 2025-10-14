import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import apiClient from '../api/axiosClient';
import toast from 'react-hot-toast';

const useEmployeeStore = create(
  persist(
    (set, get) => ({
      // State
      employees: [],
      departments: [],
      skills: [],
      managers: [],
      selectedEmployee: null,
      isLoading: false,
      error: null,

      // Employee CRUD Operations
      fetchEmployees: async (params = {}) => {
        set({ isLoading: true, error: null });
        try {
          const response = await apiClient.get('/hr/employees', { params });
          const data = response.data.data;
          set({ employees: data, isLoading: false });
          return { success: true, data };
        } catch (error) {
          const errorMessage = error.response?.data?.message || 'Failed to fetch employees';
          set({ error: errorMessage, isLoading: false });
          toast.error(errorMessage);
          return { success: false, error: errorMessage };
        }
      },

      createEmployee: async (employeeData) => {
        set({ isLoading: true, error: null });
        try {
          const response = await apiClient.post('/hr/employees', employeeData);
          const newEmployee = response.data.data;
          set(state => ({
            employees: [newEmployee, ...state.employees],
            isLoading: false
          }));
          toast.success('Employee created successfully');
          return { success: true, data: newEmployee };
        } catch (error) {
          const errorMessage = error.response?.data?.message || 'Failed to create employee';
          set({ error: errorMessage, isLoading: false });
          toast.error(errorMessage);
          return { success: false, error: errorMessage };
        }
      },

      updateEmployee: async (employeeId, updateData) => {
        set({ isLoading: true, error: null });
        try {
          const response = await apiClient.put(`/hr/employees/${employeeId}`, updateData);
          const updatedEmployee = response.data.data;
          set(state => ({
            employees: state.employees.map(emp => 
              emp.id === employeeId ? updatedEmployee : emp
            ),
            selectedEmployee: state.selectedEmployee?.id === employeeId ? updatedEmployee : state.selectedEmployee,
            isLoading: false
          }));
          toast.success('Employee updated successfully');
          return { success: true, data: updatedEmployee };
        } catch (error) {
          const errorMessage = error.response?.data?.message || 'Failed to update employee';
          set({ error: errorMessage, isLoading: false });
          toast.error(errorMessage);
          return { success: false, error: errorMessage };
        }
      },

      deleteEmployee: async (employeeId) => {
        set({ isLoading: true, error: null });
        try {
          await apiClient.delete(`/hr/employees/${employeeId}`);
          set(state => ({
            employees: state.employees.filter(emp => emp.id !== employeeId),
            selectedEmployee: state.selectedEmployee?.id === employeeId ? null : state.selectedEmployee,
            isLoading: false
          }));
          toast.success('Employee deleted successfully');
          return { success: true };
        } catch (error) {
          const errorMessage = error.response?.data?.message || 'Failed to delete employee';
          set({ error: errorMessage, isLoading: false });
          toast.error(errorMessage);
          return { success: false, error: errorMessage };
        }
      },

      getEmployeeById: async (employeeId) => {
        set({ isLoading: true, error: null });
        try {
          const response = await apiClient.get(`/hr/employees/${employeeId}`);
          const employee = response.data.data;
          set({ selectedEmployee: employee, isLoading: false });
          return { success: true, data: employee };
        } catch (error) {
          const errorMessage = error.response?.data?.message || 'Failed to fetch employee';
          set({ error: errorMessage, isLoading: false });
          toast.error(errorMessage);
          return { success: false, error: errorMessage };
        }
      },

      // Department Operations
      fetchDepartments: async () => {
        try {
          const response = await apiClient.get('/hr/employees/departments');
          const departments = response.data.data;
          set({ departments });
          return { success: true, data: departments };
        } catch (error) {
          const errorMessage = error.response?.data?.message || 'Failed to fetch departments';
          toast.error(errorMessage);
          return { success: false, error: errorMessage };
        }
      },

      // Manager Operations
      fetchManagers: async () => {
        try {
          const response = await apiClient.get('/hr/employees/managers');
          const managers = response.data.data;
          set({ managers });
          return { success: true, data: managers };
        } catch (error) {
          const errorMessage = error.response?.data?.message || 'Failed to fetch managers';
          toast.error(errorMessage);
          return { success: false, error: errorMessage };
        }
      },

      // Skills Operations
      fetchSkills: async () => {
        try {
          const response = await apiClient.get('/hr/employees/skills');
          const skills = response.data.data;
          set({ skills });
          return { success: true, data: skills };
        } catch (error) {
          const errorMessage = error.response?.data?.message || 'Failed to fetch skills';
          toast.error(errorMessage);
          return { success: false, error: errorMessage };
        }
      },

      fetchEmployeeSkills: async (employeeId) => {
        try {
          const response = await apiClient.get(`/hr/employees/${employeeId}/skills`);
          const skills = response.data.data;
          return { success: true, data: skills };
        } catch (error) {
          const errorMessage = error.response?.data?.message || 'Failed to fetch employee skills';
          toast.error(errorMessage);
          return { success: false, error: errorMessage };
        }
      },

      addEmployeeSkill: async (employeeId, skillData) => {
        try {
          const response = await apiClient.post(`/hr/employees/${employeeId}/skills`, skillData);
          const skill = response.data.data;
          toast.success('Skill added successfully');
          return { success: true, data: skill };
        } catch (error) {
          const errorMessage = error.response?.data?.message || 'Failed to add skill';
          toast.error(errorMessage);
          return { success: false, error: errorMessage };
        }
      },

      updateEmployeeSkill: async (employeeId, assignmentId, skillData) => {
        try {
          const response = await apiClient.put(`/hr/employees/${employeeId}/skills/${assignmentId}`, skillData);
          const skill = response.data.data;
          toast.success('Skill updated successfully');
          return { success: true, data: skill };
        } catch (error) {
          const errorMessage = error.response?.data?.message || 'Failed to update skill';
          toast.error(errorMessage);
          return { success: false, error: errorMessage };
        }
      },

      removeEmployeeSkill: async (employeeId, assignmentId) => {
        try {
          await apiClient.delete(`/hr/employees/${employeeId}/skills/${assignmentId}`);
          toast.success('Skill removed successfully');
          return { success: true };
        } catch (error) {
          const errorMessage = error.response?.data?.message || 'Failed to remove skill';
          toast.error(errorMessage);
          return { success: false, error: errorMessage };
        }
      },

      // Certifications Operations
      fetchEmployeeCertifications: async (employeeId) => {
        try {
          const response = await apiClient.get(`/hr/employees/${employeeId}/certifications`);
          const certifications = response.data.data;
          return { success: true, data: certifications };
        } catch (error) {
          const errorMessage = error.response?.data?.message || 'Failed to fetch certifications';
          toast.error(errorMessage);
          return { success: false, error: errorMessage };
        }
      },

      addEmployeeCertification: async (employeeId, certificationData) => {
        try {
          const response = await apiClient.post(`/hr/employees/${employeeId}/certifications`, certificationData);
          const certification = response.data.data;
          toast.success('Certification added successfully');
          return { success: true, data: certification };
        } catch (error) {
          const errorMessage = error.response?.data?.message || 'Failed to add certification';
          toast.error(errorMessage);
          return { success: false, error: errorMessage };
        }
      },

      removeEmployeeCertification: async (employeeId, certId) => {
        try {
          await apiClient.delete(`/hr/employees/${employeeId}/certifications/${certId}`);
          toast.success('Certification removed successfully');
          return { success: true };
        } catch (error) {
          const errorMessage = error.response?.data?.message || 'Failed to remove certification';
          toast.error(errorMessage);
          return { success: false, error: errorMessage };
        }
      },

      // Documents Operations
      fetchEmployeeDocuments: async (employeeId) => {
        try {
          const response = await apiClient.get(`/hr/employees/${employeeId}/documents`);
          const documents = response.data.data;
          return { success: true, data: documents };
        } catch (error) {
          const errorMessage = error.response?.data?.message || 'Failed to fetch documents';
          toast.error(errorMessage);
          return { success: false, error: errorMessage };
        }
      },

      addEmployeeDocument: async (employeeId, documentData) => {
        try {
          const response = await apiClient.post(`/hr/employees/${employeeId}/documents`, documentData);
          const document = response.data.data;
          toast.success('Document added successfully');
          return { success: true, data: document };
        } catch (error) {
          const errorMessage = error.response?.data?.message || 'Failed to add document';
          toast.error(errorMessage);
          return { success: false, error: errorMessage };
        }
      },

      removeEmployeeDocument: async (employeeId, docId) => {
        try {
          await apiClient.delete(`/hr/employees/${employeeId}/documents/${docId}`);
          toast.success('Document removed successfully');
          return { success: true };
        } catch (error) {
          const errorMessage = error.response?.data?.message || 'Failed to remove document';
          toast.error(errorMessage);
          return { success: false, error: errorMessage };
        }
      },

      // Evaluations Operations
      fetchEmployeeEvaluations: async (employeeId) => {
        try {
          const response = await apiClient.get(`/hr/employees/${employeeId}/evaluations`);
          const evaluations = response.data.data;
          return { success: true, data: evaluations };
        } catch (error) {
          const errorMessage = error.response?.data?.message || 'Failed to fetch evaluations';
          toast.error(errorMessage);
          return { success: false, error: errorMessage };
        }
      },

      addEmployeeEvaluation: async (employeeId, evaluationData) => {
        try {
          const response = await apiClient.post(`/hr/employees/${employeeId}/evaluations`, evaluationData);
          const evaluation = response.data.data;
          toast.success('Evaluation added successfully');
          return { success: true, data: evaluation };
        } catch (error) {
          const errorMessage = error.response?.data?.message || 'Failed to add evaluation';
          toast.error(errorMessage);
          return { success: false, error: errorMessage };
        }
      },

      // Career Progression Operations
      promoteEmployee: async (employeeId, promotionData) => {
        try {
          const response = await apiClient.post(`/hr/employees/${employeeId}/promote`, promotionData);
          const result = response.data.data;
          toast.success('Employee promoted successfully');
          return { success: true, data: result };
        } catch (error) {
          const errorMessage = error.response?.data?.message || 'Failed to promote employee';
          toast.error(errorMessage);
          return { success: false, error: errorMessage };
        }
      },

      transferEmployee: async (employeeId, transferData) => {
        try {
          const response = await apiClient.post(`/hr/employees/${employeeId}/transfer`, transferData);
          const result = response.data.data;
          toast.success('Employee transferred successfully');
          return { success: true, data: result };
        } catch (error) {
          const errorMessage = error.response?.data?.message || 'Failed to transfer employee';
          toast.error(errorMessage);
          return { success: false, error: errorMessage };
        }
      },

      fetchCareerProgressionHistory: async (employeeId) => {
        try {
          const response = await apiClient.get(`/hr/employees/${employeeId}/career-history`);
          const history = response.data.data;
          return { success: true, data: history };
        } catch (error) {
          const errorMessage = error.response?.data?.message || 'Failed to fetch career progression history';
          toast.error(errorMessage);
          return { success: false, error: errorMessage };
        }
      },

      // Probation Operations
      startProbation: async (employeeId, probationData) => {
        try {
          const response = await apiClient.post(`/hr/employees/${employeeId}/probation/start`, probationData);
          const result = response.data.data;
          toast.success('Probation started successfully');
          return { success: true, data: result };
        } catch (error) {
          const errorMessage = error.response?.data?.message || 'Failed to start probation';
          toast.error(errorMessage);
          return { success: false, error: errorMessage };
        }
      },

      endProbation: async (employeeId, probationData) => {
        try {
          const response = await apiClient.post(`/hr/employees/${employeeId}/probation/end`, probationData);
          const result = response.data.data;
          toast.success('Probation ended successfully');
          return { success: true, data: result };
        } catch (error) {
          const errorMessage = error.response?.data?.message || 'Failed to end probation';
          toast.error(errorMessage);
          return { success: false, error: errorMessage };
        }
      },

      // Offboarding Operations
      offboardEmployee: async (employeeId, offboardData) => {
        try {
          const response = await apiClient.post(`/hr/employees/${employeeId}/offboard`, offboardData);
          const result = response.data.data;
          toast.success('Employee offboarded successfully');
          return { success: true, data: result };
        } catch (error) {
          const errorMessage = error.response?.data?.message || 'Failed to offboard employee';
          toast.error(errorMessage);
          return { success: false, error: errorMessage };
        }
      },

      // Directory and Org Chart Operations
      searchDirectory: async (searchParams) => {
        try {
          const response = await apiClient.get('/hr/employees/directory/search', { params: searchParams });
          const results = response.data.data;
          return { success: true, data: results };
        } catch (error) {
          const errorMessage = error.response?.data?.message || 'Failed to search directory';
          toast.error(errorMessage);
          return { success: false, error: errorMessage };
        }
      },

      getOrgChart: async (params = {}) => {
        try {
          const response = await apiClient.get('/hr/employees/org-chart', { params });
          const chart = response.data.data;
          return { success: true, data: chart };
        } catch (error) {
          const errorMessage = error.response?.data?.message || 'Failed to fetch org chart';
          toast.error(errorMessage);
          return { success: false, error: errorMessage };
        }
      },

      // Skill Analytics and Recommendations
      getSkillAnalytics: async () => {
        try {
          const response = await apiClient.get('/hr/employees/skills/analytics');
          const analytics = response.data.data;
          return { success: true, data: analytics };
        } catch (error) {
          const errorMessage = error.response?.data?.message || 'Failed to fetch skill analytics';
          toast.error(errorMessage);
          return { success: false, error: errorMessage };
        }
      },

      getSkillRecommendations: async (employeeId) => {
        try {
          const response = await apiClient.get(`/hr/employees/${employeeId}/skills/recommendations`);
          const recommendations = response.data.data;
          return { success: true, data: recommendations };
        } catch (error) {
          const errorMessage = error.response?.data?.message || 'Failed to fetch skill recommendations';
          toast.error(errorMessage);
          return { success: false, error: errorMessage };
        }
      },

      getSkillGapAnalysis: async (employeeId, jobPostingId) => {
        try {
          const response = await apiClient.get(`/hr/employees/${employeeId}/skills/gap-analysis/${jobPostingId}`);
          const analysis = response.data.data;
          return { success: true, data: analysis };
        } catch (error) {
          const errorMessage = error.response?.data?.message || 'Failed to fetch skill gap analysis';
          toast.error(errorMessage);
          return { success: false, error: errorMessage };
        }
      },

      // Utility Functions
      clearError: () => set({ error: null }),
      clearSelectedEmployee: () => set({ selectedEmployee: null }),
      setSelectedEmployee: (employee) => set({ selectedEmployee: employee }),
    }),
    {
      name: 'employee-storage',
      partialize: (state) => ({
        employees: state.employees,
        departments: state.departments,
        skills: state.skills,
        managers: state.managers,
        selectedEmployee: state.selectedEmployee,
      }),
    }
  )
);

export default useEmployeeStore;
