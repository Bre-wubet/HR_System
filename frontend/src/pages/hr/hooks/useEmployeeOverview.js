import { useState, useEffect, useCallback } from 'react';
import useEmployeeStore from '../../../stores/useEmployeeStore';
import toast from 'react-hot-toast';

/**
 * Custom hook for managing employee overview data
 * Provides comprehensive data fetching and management for employee details
 */
export const useEmployeeOverview = (employeeId) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [employeeData, setEmployeeData] = useState({
    skills: [],
    certifications: [],
    evaluations: [],
    careerHistory: [],
    skillRecommendations: [],
    analytics: null
  });

  const {
    fetchEmployeeSkills,
    fetchEmployeeCertifications,
    fetchEmployeeEvaluations,
    fetchCareerProgressionHistory,
    getSkillRecommendations,
    getSkillAnalytics,
    getEmployeeById
  } = useEmployeeStore();

  // Load all employee-related data
  const loadEmployeeData = useCallback(async (id) => {
    if (!id) return;

    setIsLoading(true);
    try {
      const [
        skillsResult,
        certificationsResult,
        evaluationsResult,
        careerResult,
        recommendationsResult,
        analyticsResult
      ] = await Promise.allSettled([
        fetchEmployeeSkills(id),
        fetchEmployeeCertifications(id),
        fetchEmployeeEvaluations(id),
        fetchCareerProgressionHistory(id),
        getSkillRecommendations(id),
        getSkillAnalytics()
      ]);

      setEmployeeData({
        skills: skillsResult.status === 'fulfilled' && skillsResult.value.success 
          ? skillsResult.value.data : [],
        certifications: certificationsResult.status === 'fulfilled' && certificationsResult.value.success 
          ? certificationsResult.value.data : [],
        evaluations: evaluationsResult.status === 'fulfilled' && evaluationsResult.value.success 
          ? evaluationsResult.value.data : [],
        careerHistory: careerResult.status === 'fulfilled' && careerResult.value.success 
          ? careerResult.value.data : [],
        skillRecommendations: recommendationsResult.status === 'fulfilled' && recommendationsResult.value.success 
          ? recommendationsResult.value.data : [],
        analytics: analyticsResult.status === 'fulfilled' && analyticsResult.value.success 
          ? analyticsResult.value.data : null
      });

    } catch (error) {
      console.error('Error loading employee data:', error);
      toast.error('Failed to load employee data');
    } finally {
      setIsLoading(false);
    }
  }, [fetchEmployeeSkills, fetchEmployeeCertifications, fetchEmployeeEvaluations, fetchCareerProgressionHistory, getSkillRecommendations, getSkillAnalytics]);

  // Refresh data
  const refreshData = useCallback(async (id) => {
    if (!id) return;
    
    setIsRefreshing(true);
    try {
      await loadEmployeeData(id);
      toast.success('Employee data refreshed');
    } catch (error) {
      toast.error('Failed to refresh employee data');
    } finally {
      setIsRefreshing(false);
    }
  }, [loadEmployeeData]);

  // Load data when employeeId changes
  useEffect(() => {
    if (employeeId) {
      loadEmployeeData(employeeId);
    }
  }, [employeeId, loadEmployeeData]);

  // Get skill statistics
  const getSkillStats = useCallback(() => {
    const { skills } = employeeData;
    if (!skills.length) return null;

    const totalSkills = skills.length;
    const averageLevel = skills.reduce((sum, skill) => sum + skill.level, 0) / totalSkills;
    const skillCategories = [...new Set(skills.map(skill => skill.skill?.category).filter(Boolean))];
    const topSkills = skills
      .sort((a, b) => b.level - a.level)
      .slice(0, 5)
      .map(skill => ({
        name: skill.skill?.name,
        level: skill.level,
        category: skill.skill?.category
      }));

    return {
      totalSkills,
      averageLevel: Math.round(averageLevel * 10) / 10,
      skillCategories: skillCategories.length,
      topSkills
    };
  }, [employeeData.skills]);

  // Get certification status summary
  const getCertificationStats = useCallback(() => {
    const { certifications } = employeeData;
    if (!certifications.length) return null;

    const active = certifications.filter(cert => cert.status === 'ACTIVE').length;
    const expired = certifications.filter(cert => cert.status === 'EXPIRED').length;
    const expiringSoon = certifications.filter(cert => {
      const expiresAt = new Date(cert.expiresAt);
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
      return expiresAt <= thirtyDaysFromNow && expiresAt > new Date();
    }).length;

    return {
      total: certifications.length,
      active,
      expired,
      expiringSoon
    };
  }, [employeeData.certifications]);

  // Get performance trends
  const getPerformanceTrends = useCallback(() => {
    const { evaluations } = employeeData;
    if (!evaluations.length) return null;

    const sortedEvaluations = evaluations
      .sort((a, b) => new Date(a.evaluationDate) - new Date(b.evaluationDate));
    
    const latestEvaluation = sortedEvaluations[sortedEvaluations.length - 1];
    const averageRating = evaluations.reduce((sum, evaluation) => sum + evaluation.overallRating, 0) / evaluations.length;
    
    return {
      totalEvaluations: evaluations.length,
      averageRating: Math.round(averageRating * 10) / 10,
      latestRating: latestEvaluation?.overallRating,
      trend: sortedEvaluations.length > 1 
        ? latestEvaluation?.overallRating > sortedEvaluations[sortedEvaluations.length - 2]?.overallRating 
          ? 'improving' : 'declining'
        : 'stable'
    };
  }, [employeeData.evaluations]);

  return {
    employeeData,
    isLoading,
    isRefreshing,
    loadEmployeeData,
    refreshData,
    getSkillStats,
    getCertificationStats,
    getPerformanceTrends
  };
};

export default useEmployeeOverview;
