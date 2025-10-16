import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart3, 
  Users, 
  Clock, 
  Briefcase,
  TrendingUp,
  Activity,
  Calendar,
  Target,
  RefreshCw,
  Download,
  ArrowRight,
  PieChart,
  MapPin,
  Award,
  CheckCircle,
  UserCheck,
  Timer,
  Filter
} from 'lucide-react';
import { Link } from 'react-router-dom';
import useEmployeeStore from '../../stores/useEmployeeStore';
import useAttendanceStore from '../../stores/useAttendanceStore';
import useRecruitmentStore from '../../stores/useRecruitmentStore';
import useAuthStore from '../../stores/useAuthStore';
import { Button } from '../../components/ui/Button';

/**
 * AnalyticsDashboard Component
 * Comprehensive overview dashboard for all analytics modules
 */
const AnalyticsDashboard = () => {
  const { user, permissions, roles } = useAuthStore();
  const {
    employees,
    isLoading: employeesLoading,
    fetchEmployees
  } = useEmployeeStore();
  
  const {
    attendance,
    leaveRequests,
    attendanceSummary,
    isLoading: attendanceLoading,
    fetchAttendance,
    fetchLeaveRequests,
    fetchAttendanceSummary
  } = useAttendanceStore();
  
  const {
    jobPostings,
    candidates,
    kpis,
    isLoading: recruitmentLoading,
    fetchJobPostings,
    fetchRecruitmentKpis
  } = useRecruitmentStore();

  // State for dashboard data
  const [dashboardData, setDashboardData] = useState({
    employeeMetrics: {
      totalEmployees: 0,
      activeEmployees: 0,
      newHires: 0,
      avgTenure: 0
    },
    attendanceMetrics: {
      totalAttendance: 0,
      presentToday: 0,
      pendingLeaveRequests: 0,
      approvedLeaveRequests: 0
    },
    recruitmentMetrics: {
      totalJobs: 0,
      activeJobs: 0,
      totalCandidates: 0,
      hiredCandidates: 0,
      hireRate: 0
    }
  });

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);

  // Check permissions for different analytics modules
  const hasEmployeePermission = permissions?.includes('employee:read') || 
                               roles?.includes('super_admin') || 
                               roles?.includes('admin');
  
  const hasAttendancePermission = permissions?.includes('attendance:read') || 
                                 roles?.includes('super_admin') || 
                                 roles?.includes('admin');
  
  const hasRecruitmentPermission = permissions?.includes('recruitment:read') || 
                                  roles?.includes('super_admin') || 
                                  roles?.includes('admin');

  // Load all analytics data
  useEffect(() => {
    loadAllAnalyticsData();
  }, []);

  const loadAllAnalyticsData = async () => {
    try {
      setIsRefreshing(true);
      
      const promises = [];
      
      if (hasEmployeePermission) {
        promises.push(fetchEmployees({ take: 200 }));
      }
      
      if (hasAttendancePermission) {
        promises.push(
          fetchAttendance({ take: 200 }),
          fetchLeaveRequests({ take: 200 }),
          fetchAttendanceSummary({ from: new Date(new Date().setDate(1)).toISOString() })
        );
      }
      
      if (hasRecruitmentPermission) {
        promises.push(
          fetchJobPostings(),
          fetchRecruitmentKpis()
        );
      }

      await Promise.all(promises);
      
      // Calculate metrics after data is loaded
      calculateDashboardMetrics();
      
      setLastUpdated(new Date());
      
    } catch (error) {
      console.error('Error loading analytics data:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const calculateDashboardMetrics = () => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();

    // Employee metrics
    const totalEmployees = employees?.length || 0;
    const activeEmployees = employees?.filter(emp => emp.status === 'ACTIVE').length || 0;
    const newHires = employees?.filter(emp => {
      const hireDate = new Date(emp.hireDate);
      return hireDate.getFullYear() === currentYear && hireDate.getMonth() === currentMonth;
    }).length || 0;

    const avgTenure = totalEmployees > 0 ? Math.round(
      employees.reduce((sum, emp) => {
        const hireDate = new Date(emp.hireDate);
        const tenureMonths = (now - hireDate) / (1000 * 60 * 60 * 24 * 30);
        return sum + tenureMonths;
      }, 0) / totalEmployees
    ) : 0;

    // Attendance metrics
    const totalAttendance = attendance?.length || 0;
    const today = new Date().toISOString().split('T')[0];
    const presentToday = attendance?.filter(record => 
      record.date?.split('T')[0] === today && record.status === 'PRESENT'
    ).length || 0;

    const pendingLeaveRequests = leaveRequests?.filter(req => req.status === 'PENDING').length || 0;
    const approvedLeaveRequests = leaveRequests?.filter(req => req.status === 'APPROVED').length || 0;

    // Recruitment metrics
    const totalJobs = jobPostings?.length || 0;
    const activeJobs = jobPostings?.filter(job => job.isActive).length || 0;
    
    const allCandidates = jobPostings?.reduce((acc, job) => {
      return acc.concat(job.candidates || []);
    }, []) || [];
    
    const totalCandidates = allCandidates.length;
    const hiredCandidates = allCandidates.filter(candidate => candidate.stage === 'HIRED').length;
    const hireRate = totalCandidates > 0 ? Math.round((hiredCandidates / totalCandidates) * 100) : 0;

    setDashboardData({
      employeeMetrics: {
        totalEmployees,
        activeEmployees,
        newHires,
        avgTenure
      },
      attendanceMetrics: {
        totalAttendance,
        presentToday,
        pendingLeaveRequests,
        approvedLeaveRequests
      },
      recruitmentMetrics: {
        totalJobs,
        activeJobs,
        totalCandidates,
        hiredCandidates,
        hireRate
      }
    });
  };

  // Export all analytics data
  const exportAllAnalytics = () => {
    const exportData = {
      timestamp: new Date().toISOString(),
      employeeMetrics: dashboardData.employeeMetrics,
      attendanceMetrics: dashboardData.attendanceMetrics,
      recruitmentMetrics: dashboardData.recruitmentMetrics,
      rawData: {
        employees: employees?.slice(0, 100), // Limit for export
        attendance: attendance?.slice(0, 100),
        leaveRequests: leaveRequests?.slice(0, 100),
        jobPostings: jobPostings?.slice(0, 100),
        candidates: candidates?.slice(0, 100)
      }
    };

    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `analytics-dashboard-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Chart colors
  const chartColors = {
    primary: '#3B82F6',
    success: '#10B981',
    warning: '#F59E0B',
    danger: '#EF4444',
    purple: '#8B5CF6',
    orange: '#F97316'
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="text-gray-600">Comprehensive overview of all HR analytics</p>
          {lastUpdated && (
            <p className="text-sm text-gray-500 mt-1">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </p>
          )}
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            onClick={loadAllAnalyticsData}
            disabled={isRefreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh All
          </Button>
          <Button
            variant="outline"
            onClick={exportAllAnalytics}
            disabled={isRefreshing}
          >
            <Download className="h-4 w-4 mr-2" />
            Export All
          </Button>
        </div>
      </div>

      {/* Quick Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Employee Stats */}
        <div className="bg-white rounded-xl shadow-soft p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Employees</p>
              <p className="text-2xl font-bold text-blue-600">{dashboardData.employeeMetrics.totalEmployees}</p>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-xs text-gray-500">
              {dashboardData.employeeMetrics.activeEmployees} active
            </span>
          </div>
        </div>

        {/* Attendance Stats */}
        <div className="bg-white rounded-xl shadow-soft p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Present Today</p>
              <p className="text-2xl font-bold text-green-600">{dashboardData.attendanceMetrics.presentToday}</p>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-xs text-gray-500">
              {dashboardData.attendanceMetrics.pendingLeaveRequests} pending leaves
            </span>
          </div>
        </div>

        {/* Recruitment Stats */}
        <div className="bg-white rounded-xl shadow-soft p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Jobs</p>
              <p className="text-2xl font-bold text-purple-600">{dashboardData.recruitmentMetrics.activeJobs}</p>
            </div>
            <div className="p-3 bg-purple-50 rounded-lg">
              <Briefcase className="h-6 w-6 text-purple-600" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-xs text-gray-500">
              {dashboardData.recruitmentMetrics.totalCandidates} candidates
            </span>
          </div>
        </div>

        {/* Performance Stats */}
        <div className="bg-white rounded-xl shadow-soft p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Hire Rate</p>
              <p className="text-2xl font-bold text-orange-600">{dashboardData.recruitmentMetrics.hireRate}%</p>
            </div>
            <div className="p-3 bg-orange-50 rounded-lg">
              <Target className="h-6 w-6 text-orange-600" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-xs text-gray-500">
              {dashboardData.recruitmentMetrics.hiredCandidates} hired
            </span>
          </div>
        </div>
      </div>

      {/* Analytics Modules */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Employee Analytics */}
        {hasEmployeePermission && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl shadow-soft p-6 border border-gray-200"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-50 rounded-lg">
                  <Users className="h-5 w-5 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Employee Analytics</h3>
              </div>
              <Link to="/analytics/employees">
                <Button variant="outline" size="sm">
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">New Hires (This Month)</span>
                <span className="text-sm font-medium text-gray-900">{dashboardData.employeeMetrics.newHires}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Average Tenure</span>
                <span className="text-sm font-medium text-gray-900">{dashboardData.employeeMetrics.avgTenure} months</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Active Rate</span>
                <span className="text-sm font-medium text-gray-900">
                  {dashboardData.employeeMetrics.totalEmployees > 0 
                    ? Math.round((dashboardData.employeeMetrics.activeEmployees / dashboardData.employeeMetrics.totalEmployees) * 100)
                    : 0}%
                </span>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-200">
              <Link to="/analytics/employees">
                <Button variant="outline" className="w-full">
                  View Detailed Analytics
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </div>
          </motion.div>
        )}

        {/* Attendance Analytics */}
        {hasAttendancePermission && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl shadow-soft p-6 border border-gray-200"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-50 rounded-lg">
                  <Clock className="h-5 w-5 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Attendance Analytics</h3>
              </div>
              <Link to="/analytics/attendance">
                <Button variant="outline" size="sm">
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Total Records</span>
                <span className="text-sm font-medium text-gray-900">{dashboardData.attendanceMetrics.totalAttendance}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Pending Leaves</span>
                <span className="text-sm font-medium text-gray-900">{dashboardData.attendanceMetrics.pendingLeaveRequests}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Approved Leaves</span>
                <span className="text-sm font-medium text-gray-900">{dashboardData.attendanceMetrics.approvedLeaveRequests}</span>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-200">
              <Link to="/analytics/attendance">
                <Button variant="outline" className="w-full">
                  View Detailed Analytics
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </div>
          </motion.div>
        )}

        {/* Recruitment Analytics */}
        {hasRecruitmentPermission && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-xl shadow-soft p-6 border border-gray-200"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-purple-50 rounded-lg">
                  <Briefcase className="h-5 w-5 text-purple-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Recruitment Analytics</h3>
              </div>
              <Link to="/analytics/recruitment">
                <Button variant="outline" size="sm">
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Total Jobs</span>
                <span className="text-sm font-medium text-gray-900">{dashboardData.recruitmentMetrics.totalJobs}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Total Candidates</span>
                <span className="text-sm font-medium text-gray-900">{dashboardData.recruitmentMetrics.totalCandidates}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Hire Rate</span>
                <span className="text-sm font-medium text-gray-900">{dashboardData.recruitmentMetrics.hireRate}%</span>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-200">
              <Link to="/analytics/recruitment">
                <Button variant="outline" className="w-full">
                  View Detailed Analytics
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </div>
          </motion.div>
        )}
      </div>

      {/* Recent Activity Summary */}
      <div className="bg-white rounded-xl shadow-soft p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-blue-50 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <Users className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-900">Employee Updates</span>
            </div>
            <p className="text-xs text-blue-700">
              {dashboardData.employeeMetrics.newHires} new hires this month
            </p>
          </div>
          
          <div className="p-4 bg-green-50 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <Calendar className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium text-green-900">Leave Requests</span>
            </div>
            <p className="text-xs text-green-700">
              {dashboardData.attendanceMetrics.pendingLeaveRequests} pending approval
            </p>
          </div>
          
          <div className="p-4 bg-purple-50 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <Briefcase className="h-4 w-4 text-purple-600" />
              <span className="text-sm font-medium text-purple-900">Recruitment</span>
            </div>
            <p className="text-xs text-purple-700">
              {dashboardData.recruitmentMetrics.hiredCandidates} candidates hired
            </p>
          </div>
        </div>
      </div>

      {/* Permission Notice */}
      {!hasEmployeePermission && !hasAttendancePermission && !hasRecruitmentPermission && (
        <div className="text-center py-12">
          <BarChart3 className="h-12 w-12 mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Access Restricted</h3>
          <p className="text-gray-500">
            You don't have permission to view analytics. Please contact your administrator.
          </p>
        </div>
      )}
    </motion.div>
  );
};

export default AnalyticsDashboard;
