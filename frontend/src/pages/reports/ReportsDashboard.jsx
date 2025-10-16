import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  FileText, Download, Users, Calendar, Briefcase, BarChart3, 
  TrendingUp, RefreshCw, Filter, Target, Clock, AlertCircle,
  UserCheck, UserX, CheckCircle, XCircle, UserPlus, Award,
  Building, PieChart, Activity, Zap, ArrowRight, ExternalLink
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useReportsStore } from '../../stores/useReportsStore';
import useAuthStore from '../../stores/useAuthStore';
import { useNavigate } from 'react-router-dom';

/**
 * ReportsDashboard Component
 * Comprehensive unified dashboard for all HR reports and analytics
 */
const ReportsDashboard = () => {
  const navigate = useNavigate();
  const { user, permissions } = useAuthStore();
  const {
    // Attendance data
    attendanceSummary,
    absenceAnalytics,
    leaveRequests,
    
    // Employee data
    employeeData,
    departments,
    skillAnalytics,
    careerProgressionAnalytics,
    organizationalChart,
    
    // Recruitment data
    recruitmentData,
    
    // Loading states
    isLoading,
    
    // Errors
    errors,
    
    // Actions
    fetchAttendanceSummary,
    fetchAbsenceAnalytics,
    fetchLeaveRequests,
    fetchEmployeeData,
    fetchDepartments,
    fetchSkillAnalytics,
    fetchCareerProgressionAnalytics,
    fetchOrganizationalChart,
    fetchRecruitmentData,
    fetchRecruitmentKpis,
    exportReport,
    refreshAllData
  } = useReportsStore();

  const [dateRange, setDateRange] = useState({
    from: new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().split('T')[0], // Last month
    to: new Date().toISOString().split('T')[0] // Today
  });
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [isExporting, setIsExporting] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [rateLimitError, setRateLimitError] = useState(false);

  // Permission checks
  const hasAttendancePermission = permissions?.includes('attendance:read');
  const hasEmployeePermission = permissions?.includes('employee:read');
  const hasRecruitmentPermission = permissions?.includes('recruitment:read');

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    try {
      setIsLoadingData(true);
      setRateLimitError(false);
      
      const params = {
        from: dateRange.from,
        to: dateRange.to,
        ...(departmentFilter && { departmentId: departmentFilter })
      };

      // Sequential loading to avoid rate limiting
      const loadWithDelay = async (fn, delay = 500) => {
        await new Promise(resolve => setTimeout(resolve, delay));
        return fn();
      };

      // Load attendance data sequentially
      if (hasAttendancePermission) {
        await loadWithDelay(() => fetchAttendanceSummary(params), 0);
        await loadWithDelay(() => fetchAbsenceAnalytics(params), 500);
        await loadWithDelay(() => fetchLeaveRequests({ take: 100 }), 500);
      }

      // Load employee data sequentially
      if (hasEmployeePermission) {
        await loadWithDelay(() => fetchEmployeeData({ take: 200 }), 500);
        await loadWithDelay(() => fetchDepartments(), 500);
        await loadWithDelay(() => fetchSkillAnalytics(), 500);
        await loadWithDelay(() => fetchCareerProgressionAnalytics(params), 500);
        await loadWithDelay(() => fetchOrganizationalChart(), 500);
      }

      // Load recruitment data sequentially
      if (hasRecruitmentPermission) {
        await loadWithDelay(() => fetchRecruitmentData({ take: 100, ...params }), 500);
        await loadWithDelay(() => fetchRecruitmentKpis(params), 500);
      }
    } catch (error) {
      console.error('Error loading all data:', error);
      
      // Handle rate limiting specifically
      if (error.response?.status === 429) {
        console.warn('Rate limit exceeded. Retrying with longer delays...');
        setRateLimitError(true);
        // Retry with exponential backoff
        setTimeout(() => {
          loadAllData();
        }, 5000); // Wait 5 seconds before retry
      }
    } finally {
      setIsLoadingData(false);
    }
  };

  const handleDateRangeChange = (field, value) => {
    const newDateRange = { ...dateRange, [field]: value };
    setDateRange(newDateRange);
  };

  const handleExportAll = async () => {
    try {
      setIsExporting(true);
      
      const params = {
        from: dateRange.from,
        to: dateRange.to,
        ...(departmentFilter && { departmentId: departmentFilter })
      };

      // Export all available data
      const exportPromises = [];
      
      if (hasAttendancePermission) {
        exportPromises.push(
          exportReport('summary', params),
          exportReport('absence', params),
          exportReport('leave', params)
        );
      }
      
      if (hasEmployeePermission) {
        exportPromises.push(
          exportReport('employee', params),
          exportReport('skills', params),
          exportReport('career', params)
        );
      }
      
      if (hasRecruitmentPermission) {
        exportPromises.push(
          exportReport('jobs', params),
          exportReport('candidates', params),
          exportReport('interviews', params),
          exportReport('kpis', params)
        );
      }

      const allData = await Promise.all(exportPromises);
      
      // Create comprehensive report
      const comprehensiveReport = {
        metadata: {
          generatedAt: new Date().toISOString(),
          generatedBy: user?.email,
          dateRange: dateRange,
          departmentFilter: departmentFilter || 'All Departments'
        },
        attendance: hasAttendancePermission ? {
          summary: allData[0],
          absence: allData[1],
          leave: allData[2]
        } : null,
        employee: hasEmployeePermission ? {
          directory: allData[hasAttendancePermission ? 3 : 0],
          skills: allData[hasAttendancePermission ? 4 : 1],
          career: allData[hasAttendancePermission ? 5 : 2]
        } : null,
        recruitment: hasRecruitmentPermission ? {
          jobs: allData[hasAttendancePermission && hasEmployeePermission ? 6 : hasAttendancePermission || hasEmployeePermission ? 3 : 0],
          candidates: allData[hasAttendancePermission && hasEmployeePermission ? 7 : hasAttendancePermission || hasEmployeePermission ? 4 : 1],
          interviews: allData[hasAttendancePermission && hasEmployeePermission ? 8 : hasAttendancePermission || hasEmployeePermission ? 5 : 2],
          kpis: allData[hasAttendancePermission && hasEmployeePermission ? 9 : hasAttendancePermission || hasEmployeePermission ? 6 : 3]
        } : null
      };

      // Download comprehensive report
      const blob = new Blob([JSON.stringify(comprehensiveReport, null, 2)], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `comprehensive-hr-report-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting comprehensive report:', error);
      alert('Failed to export comprehensive report. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  // Calculate comprehensive statistics
  const overallStats = {
    attendance: attendanceSummary ? {
      total: attendanceSummary.total || 0,
      present: attendanceSummary.present || 0,
      absent: attendanceSummary.absent || 0,
      late: attendanceSummary.late || 0,
      onLeave: attendanceSummary.onLeave || 0
    } : null,
    
    employee: employeeData ? {
      total: employeeData.length,
      active: employeeData.filter(emp => emp.status === 'ACTIVE').length,
      inactive: employeeData.filter(emp => emp.status === 'INACTIVE').length,
      terminated: employeeData.filter(emp => emp.status === 'TERMINATED').length,
      probation: employeeData.filter(emp => emp.status === 'PROBATION').length
    } : null,
    
    recruitment: recruitmentData ? {
      totalJobs: recruitmentData.jobPostings?.length || 0,
      activeJobs: recruitmentData.jobPostings?.filter(job => job.status === 'ACTIVE').length || 0,
      totalCandidates: recruitmentData.candidates?.length || 0,
      hiredCandidates: recruitmentData.candidates?.filter(candidate => candidate.stage === 'HIRED').length || 0,
      totalInterviews: recruitmentData.interviews?.length || 0,
      hireRate: recruitmentData.candidates?.length > 0 
        ? Math.round((recruitmentData.candidates.filter(candidate => candidate.stage === 'HIRED').length / recruitmentData.candidates.length) * 100)
        : 0
    } : null
  };

  // Quick action cards
  const quickActions = [
    {
      id: 'attendance',
      title: 'Attendance Reports',
      description: 'View attendance summaries, absence analytics, and leave requests',
      icon: Calendar,
      color: 'green',
      path: '/reports/attendance',
      permission: hasAttendancePermission,
      stats: overallStats.attendance ? `${overallStats.attendance.total} records` : 'No data'
    },
    {
      id: 'employee',
      title: 'Employee Reports',
      description: 'Access employee directory, skills analytics, and career progression',
      icon: Users,
      color: 'blue',
      path: '/reports/employees',
      permission: hasEmployeePermission,
      stats: overallStats.employee ? `${overallStats.employee.total} employees` : 'No data'
    },
    {
      id: 'recruitment',
      title: 'Recruitment Reports',
      description: 'Review job postings, candidate pipeline, and hiring metrics',
      icon: Briefcase,
      color: 'purple',
      path: '/reports/recruitment',
      permission: hasRecruitmentPermission,
      stats: overallStats.recruitment ? `${overallStats.recruitment.totalJobs} jobs` : 'No data'
    }
  ];

  // Recent activity items
  const recentActivity = [
    ...(leaveRequests?.slice(0, 3).map(request => ({
      id: `leave-${request.id}`,
      type: 'leave',
      title: `Leave request from ${request.employee?.firstName} ${request.employee?.lastName}`,
      status: request.status,
      date: request.appliedAt,
      icon: Calendar
    })) || []),
    ...(recruitmentData?.candidates?.slice(0, 2).map(candidate => ({
      id: `candidate-${candidate.id}`,
      type: 'candidate',
      title: `New candidate: ${candidate.firstName} ${candidate.lastName}`,
      status: candidate.stage,
      date: candidate.createdAt,
      icon: UserPlus
    })) || [])
  ].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5);

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'attendance', label: 'Attendance', icon: Calendar },
    { id: 'employee', label: 'Employee', icon: Users },
    { id: 'recruitment', label: 'Recruitment', icon: Briefcase }
  ];

  const hasAnyPermission = hasAttendancePermission || hasEmployeePermission || hasRecruitmentPermission;

  if (!hasAnyPermission) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Access Denied</h3>
          <p className="text-gray-600">You don't have permission to view any reports.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Loading Overlay */}
      {isLoadingData && (
        <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-50 rounded-xl">
          <div className="text-center">
            <RefreshCw className="h-8 w-8 text-blue-600 animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Loading reports data...</p>
            <p className="text-sm text-gray-500 mt-2">Sequential loading to avoid rate limits</p>
          </div>
        </div>
      )}
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
      {/* Rate Limit Warning */}
      {rateLimitError && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6"
        >
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-yellow-600 mr-3" />
            <div>
              <h3 className="text-sm font-medium text-yellow-800">Rate Limit Exceeded</h3>
              <p className="text-sm text-yellow-700 mt-1">
                Too many requests detected. Data is being loaded sequentially to avoid rate limiting. 
                Please wait a moment for all data to load.
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Reports Dashboard</h1>
          <p className="text-gray-600">Comprehensive HR analytics and reporting center</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button
            onClick={loadAllData}
            disabled={isLoadingData}
            variant="outline"
            size="sm"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoadingData ? 'animate-spin' : ''}`} />
            {isLoadingData ? 'Loading...' : 'Refresh All'}
          </Button>
          <Button
            onClick={handleExportAll}
            disabled={isExporting}
            size="sm"
          >
            <Download className="h-4 w-4 mr-2" />
            {isExporting ? 'Exporting...' : 'Export All'}
          </Button>
          <FileText className="h-6 w-6 text-primary-600" />
        </div>
      </div>

      {/* Global Filters */}
      <div className="bg-white rounded-xl shadow-soft p-6">
        <div className="flex items-center space-x-4 mb-4">
          <Filter className="h-5 w-5 text-gray-500" />
          <h3 className="text-lg font-semibold text-gray-900">Global Filters</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">From Date</label>
            <Input
              type="date"
              value={dateRange.from}
              onChange={(e) => handleDateRangeChange('from', e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">To Date</label>
            <Input
              type="date"
              value={dateRange.to}
              onChange={(e) => handleDateRangeChange('to', e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
            >
              <option value="">All Departments</option>
              {departments.map(dept => (
                <option key={dept.id} value={dept.id}>{dept.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-xl shadow-soft p-6">
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-colors ${
                activeTab === tab.id
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <tab.icon className="h-4 w-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Quick Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {quickActions.map((action, index) => (
              <motion.div
                key={action.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`bg-white rounded-xl shadow-soft p-6 hover:shadow-medium transition-shadow cursor-pointer ${
                  !action.permission ? 'opacity-50 cursor-not-allowed' : ''
                }`}
                onClick={() => action.permission && navigate(action.path)}
              >
                <div className="flex items-start space-x-4">
                  <div className={`p-3 bg-${action.color}-50 rounded-lg`}>
                    <action.icon className={`h-6 w-6 text-${action.color}-600`} />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{action.title}</h3>
                    <p className="text-gray-600 text-sm mb-3">{action.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">{action.stats}</span>
                      {action.permission ? (
                        <ArrowRight className="h-4 w-4 text-gray-400" />
                      ) : (
                        <AlertCircle className="h-4 w-4 text-red-400" />
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-xl shadow-soft p-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Employees</p>
                  <p className="text-2xl font-bold text-gray-900">{overallStats.employee?.total || 0}</p>
                </div>
                <Users className="h-8 w-8 text-blue-500" />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-xl shadow-soft p-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Jobs</p>
                  <p className="text-2xl font-bold text-purple-600">{overallStats.recruitment?.activeJobs || 0}</p>
                </div>
                <Briefcase className="h-8 w-8 text-purple-500" />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-xl shadow-soft p-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Attendance Rate</p>
                  <p className="text-2xl font-bold text-green-600">
                    {overallStats.attendance?.total > 0 
                      ? Math.round((overallStats.attendance.present / overallStats.attendance.total) * 100)
                      : 0}%
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-500" />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-xl shadow-soft p-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Hire Rate</p>
                  <p className="text-2xl font-bold text-orange-600">{overallStats.recruitment?.hireRate || 0}%</p>
                </div>
                <Target className="h-8 w-8 text-orange-500" />
              </div>
            </motion.div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-xl shadow-soft p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
            <div className="space-y-3">
              {recentActivity.length > 0 ? (
                recentActivity.map((activity, index) => (
                  <motion.div
                    key={activity.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg"
                  >
                    <activity.icon className="h-5 w-5 text-gray-500" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                      <p className="text-xs text-gray-500">{new Date(activity.date).toLocaleDateString()}</p>
                    </div>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      activity.status === 'APPROVED' || activity.status === 'HIRED' ? 'bg-green-100 text-green-800' :
                      activity.status === 'PENDING' || activity.status === 'APPLIED' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {activity.status}
                    </span>
                  </motion.div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-8">No recent activity</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Attendance Tab */}
      {activeTab === 'attendance' && hasAttendancePermission && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white rounded-xl shadow-soft p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Records</p>
                  <p className="text-2xl font-bold text-gray-900">{overallStats.attendance?.total || 0}</p>
                </div>
                <Users className="h-8 w-8 text-blue-500" />
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-soft p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Present</p>
                  <p className="text-2xl font-bold text-green-600">{overallStats.attendance?.present || 0}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-soft p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Absent</p>
                  <p className="text-2xl font-bold text-red-600">{overallStats.attendance?.absent || 0}</p>
                </div>
                <XCircle className="h-8 w-8 text-red-500" />
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-soft p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Late</p>
                  <p className="text-2xl font-bold text-yellow-600">{overallStats.attendance?.late || 0}</p>
                </div>
                <Clock className="h-8 w-8 text-yellow-500" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-soft p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Attendance Summary</h3>
              <Button
                onClick={() => navigate('/reports/attendance')}
                variant="outline"
                size="sm"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                View Details
              </Button>
            </div>
            <p className="text-gray-600">
              {overallStats.attendance ? 
                `Current attendance rate: ${Math.round((overallStats.attendance.present / overallStats.attendance.total) * 100)}%` :
                'No attendance data available'
              }
            </p>
          </div>
        </div>
      )}

      {/* Employee Tab */}
      {activeTab === 'employee' && hasEmployeePermission && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            <div className="bg-white rounded-xl shadow-soft p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total</p>
                  <p className="text-2xl font-bold text-gray-900">{overallStats.employee?.total || 0}</p>
                </div>
                <Users className="h-8 w-8 text-blue-500" />
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-soft p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active</p>
                  <p className="text-2xl font-bold text-green-600">{overallStats.employee?.active || 0}</p>
                </div>
                <UserCheck className="h-8 w-8 text-green-500" />
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-soft p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Inactive</p>
                  <p className="text-2xl font-bold text-gray-600">{overallStats.employee?.inactive || 0}</p>
                </div>
                <UserX className="h-8 w-8 text-gray-500" />
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-soft p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Terminated</p>
                  <p className="text-2xl font-bold text-red-600">{overallStats.employee?.terminated || 0}</p>
                </div>
                <AlertCircle className="h-8 w-8 text-red-500" />
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-soft p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Probation</p>
                  <p className="text-2xl font-bold text-yellow-600">{overallStats.employee?.probation || 0}</p>
                </div>
                <Calendar className="h-8 w-8 text-yellow-500" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-soft p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Employee Analytics</h3>
              <Button
                onClick={() => navigate('/reports/employees')}
                variant="outline"
                size="sm"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                View Details
              </Button>
            </div>
            <p className="text-gray-600">
              {overallStats.employee ? 
                `Active employees: ${overallStats.employee.active}/${overallStats.employee.total} (${Math.round((overallStats.employee.active / overallStats.employee.total) * 100)}%)` :
                'No employee data available'
              }
            </p>
          </div>
        </div>
      )}

      {/* Recruitment Tab */}
      {activeTab === 'recruitment' && hasRecruitmentPermission && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white rounded-xl shadow-soft p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Jobs</p>
                  <p className="text-2xl font-bold text-gray-900">{overallStats.recruitment?.totalJobs || 0}</p>
                </div>
                <Briefcase className="h-8 w-8 text-blue-500" />
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-soft p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Jobs</p>
                  <p className="text-2xl font-bold text-green-600">{overallStats.recruitment?.activeJobs || 0}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-soft p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Candidates</p>
                  <p className="text-2xl font-bold text-purple-600">{overallStats.recruitment?.totalCandidates || 0}</p>
                </div>
                <Users className="h-8 w-8 text-purple-500" />
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-soft p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Hired</p>
                  <p className="text-2xl font-bold text-green-600">{overallStats.recruitment?.hiredCandidates || 0}</p>
                </div>
                <UserPlus className="h-8 w-8 text-green-500" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-soft p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Recruitment Analytics</h3>
              <Button
                onClick={() => navigate('/reports/recruitment')}
                variant="outline"
                size="sm"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                View Details
              </Button>
            </div>
            <p className="text-gray-600">
              {overallStats.recruitment ? 
                `Hire rate: ${overallStats.recruitment.hireRate}% (${overallStats.recruitment.hiredCandidates}/${overallStats.recruitment.totalCandidates} candidates)` :
                'No recruitment data available'
              }
            </p>
          </div>
        </div>
      )}
      </motion.div>
    </div>
  );
};

export default ReportsDashboard;
