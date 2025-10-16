import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  FileText, Download, Users, Calendar, Briefcase, Building, 
  TrendingUp, RefreshCw, Filter, BarChart3, PieChart, Award,
  AlertCircle, UserCheck, UserX
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useReportsStore } from '../../stores/useReportsStore';
import useAuthStore from '../../stores/useAuthStore';

/**
 * EmployeeReports Component
 * Comprehensive employee reports dashboard with real backend integration
 */
const EmployeeReports = () => {
  const { user, permissions } = useAuthStore();
  const {
    employeeData,
    departments,
    skillAnalytics,
    careerProgressionAnalytics,
    organizationalChart,
    isLoading,
    errors,
    filters: storeFilters,
    fetchEmployeeData,
    fetchDepartments,
    fetchSkillAnalytics,
    fetchCareerProgressionAnalytics,
    fetchOrganizationalChart,
    exportReport,
    setFilters
  } = useReportsStore();

  const [filters, setLocalFilters] = useState({
    departmentId: '',
    status: '',
    take: 100
  });
  const [dateRange, setDateRange] = useState({
    from: new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().split('T')[0], // Last month
    to: new Date().toISOString().split('T')[0] // Today
  });
  const [isExporting, setIsExporting] = useState(false);

  const hasEmployeePermission = permissions?.includes('employee:read');

  useEffect(() => {
    if (hasEmployeePermission) {
      loadEmployeeData();
    }
  }, [hasEmployeePermission]);

  const loadEmployeeData = async () => {
    try {
      const params = {
        take: filters.take,
        ...(filters.departmentId && { departmentId: filters.departmentId }),
        ...(filters.status && { status: filters.status })
      };

      const careerParams = {
        from: dateRange.from,
        to: dateRange.to,
        ...(filters.departmentId && { departmentId: filters.departmentId })
      };

      await Promise.all([
        fetchEmployeeData(params),
        fetchDepartments(),
        fetchSkillAnalytics(),
        fetchCareerProgressionAnalytics(careerParams),
        fetchOrganizationalChart()
      ]);
    } catch (error) {
      console.error('Error loading employee data:', error);
    }
  };

  const handleFilterChange = (field, value) => {
    const newFilters = { ...filters, [field]: value };
    setLocalFilters(newFilters);
    setFilters('employee', newFilters);
  };

  const handleDateRangeChange = (field, value) => {
    const newDateRange = { ...dateRange, [field]: value };
    setDateRange(newDateRange);
  };

  const handleExport = async (reportType) => {
    try {
      setIsExporting(true);
      const params = {
        take: filters.take,
        ...(filters.departmentId && { departmentId: filters.departmentId }),
        ...(filters.status && { status: filters.status }),
        ...(dateRange.from && { from: dateRange.from }),
        ...(dateRange.to && { to: dateRange.to })
      };

      const data = await exportReport(reportType, params);
      
      // Create and download file
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${reportType}-report-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting report:', error);
      alert('Failed to export report. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const reports = [
    {
      id: 'employee',
      title: 'Employee Directory',
      description: 'Complete list of all employees with contact information',
      icon: Users,
      data: employeeData,
      loading: isLoading.employee,
      error: errors.employee
    },
    {
      id: 'skills',
      title: 'Skills Analytics',
      description: 'Analysis of employee skills and competencies',
      icon: Award,
      data: skillAnalytics,
      loading: isLoading.skills,
      error: errors.skills
    },
    {
      id: 'career',
      title: 'Career Progression',
      description: 'Employee career advancement and promotions',
      icon: TrendingUp,
      data: careerProgressionAnalytics,
      loading: isLoading.career,
      error: errors.career
    },
    {
      id: 'org-chart',
      title: 'Organizational Chart',
      description: 'Company structure and reporting relationships',
      icon: Building,
      data: organizationalChart,
      loading: isLoading.employee,
      error: errors.employee
    }
  ];

  // Calculate employee statistics
  const employeeStats = employeeData ? {
    total: employeeData.length,
    active: employeeData.filter(emp => emp.status === 'ACTIVE').length,
    inactive: employeeData.filter(emp => emp.status === 'INACTIVE').length,
    terminated: employeeData.filter(emp => emp.status === 'TERMINATED').length,
    probation: employeeData.filter(emp => emp.status === 'PROBATION').length
  } : null;

  if (!hasEmployeePermission) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Access Denied</h3>
          <p className="text-gray-600">You don't have permission to view employee reports.</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Employee Reports</h1>
          <p className="text-gray-600">Generate and download comprehensive employee reports</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            onClick={loadEmployeeData}
            disabled={isLoading.employee || isLoading.skills || isLoading.career}
            variant="outline"
            size="sm"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${(isLoading.employee || isLoading.skills || isLoading.career) ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <FileText className="h-6 w-6 text-primary-600" />
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-soft p-6">
        <div className="flex items-center space-x-4 mb-4">
          <Filter className="h-5 w-5 text-gray-500" />
          <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={filters.departmentId}
              onChange={(e) => handleFilterChange('departmentId', e.target.value)}
            >
              <option value="">All Departments</option>
              {departments.map(dept => (
                <option key={dept.id} value={dept.id}>{dept.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
            >
              <option value="">All Status</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
              <option value="TERMINATED">Terminated</option>
              <option value="PROBATION">Probation</option>
            </select>
          </div>
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
        </div>
      </div>

      {/* Quick Stats */}
      {employeeStats && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl shadow-soft p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Employees</p>
                <p className="text-2xl font-bold text-gray-900">{employeeStats.total}</p>
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
                <p className="text-sm font-medium text-gray-600">Active</p>
                <p className="text-2xl font-bold text-green-600">{employeeStats.active}</p>
              </div>
              <UserCheck className="h-8 w-8 text-green-500" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl shadow-soft p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Inactive</p>
                <p className="text-2xl font-bold text-gray-600">{employeeStats.inactive}</p>
              </div>
              <UserX className="h-8 w-8 text-gray-500" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl shadow-soft p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Terminated</p>
                <p className="text-2xl font-bold text-red-600">{employeeStats.terminated}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-red-500" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl shadow-soft p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Probation</p>
                <p className="text-2xl font-bold text-yellow-600">{employeeStats.probation}</p>
              </div>
              <Calendar className="h-8 w-8 text-yellow-500" />
            </div>
          </motion.div>
        </div>
      )}

      {/* Reports Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {reports.map((report, index) => (
          <motion.div
            key={report.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-xl shadow-soft p-6 hover:shadow-medium transition-shadow"
          >
            <div className="flex items-start space-x-4">
              <div className="p-3 bg-blue-50 rounded-lg">
                <report.icon className="h-6 w-6 text-blue-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{report.title}</h3>
                <p className="text-gray-600 text-sm mb-4">{report.description}</p>
                
                {report.loading && (
                  <div className="flex items-center text-sm text-gray-500 mb-4">
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Loading...
                  </div>
                )}

                {report.error && (
                  <div className="flex items-center text-sm text-red-500 mb-4">
                    <AlertCircle className="h-4 w-4 mr-2" />
                    {report.error}
                  </div>
                )}

                {report.data && !report.loading && !report.error && (
                  <div className="text-sm text-gray-500 mb-4">
                    {report.id === 'employee' && `${report.data.length || 0} employees`}
                    {report.id === 'skills' && `Skills analytics available`}
                    {report.id === 'career' && `Career progression data available`}
                    {report.id === 'org-chart' && `Organizational chart available`}
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">
                    Last updated: {new Date().toLocaleDateString()}
                  </span>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handleExport(report.id)}
                    disabled={isExporting || report.loading || report.error}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    {isExporting ? 'Exporting...' : 'Export'}
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Skills Analytics Preview */}
      {skillAnalytics && (
        <div className="bg-white rounded-xl shadow-soft p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Skills Analytics Preview</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <p className="text-2xl font-bold text-blue-600">{skillAnalytics.totalSkills || 0}</p>
              <p className="text-sm text-gray-600">Total Skills</p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <p className="text-2xl font-bold text-green-600">{skillAnalytics.skillsByCategory?.length || 0}</p>
              <p className="text-sm text-gray-600">Categories</p>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <p className="text-2xl font-bold text-purple-600">{skillAnalytics.skillLevelDistribution?.length || 0}</p>
              <p className="text-sm text-gray-600">Levels</p>
            </div>
          </div>
        </div>
      )}

      {/* Career Progression Preview */}
      {careerProgressionAnalytics && careerProgressionAnalytics.length > 0 && (
        <div className="bg-white rounded-xl shadow-soft p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Career Progression Preview</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {careerProgressionAnalytics.map((progression, index) => (
              <div key={index} className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-lg font-bold text-gray-900">{progression.type}</p>
                <p className="text-sm text-gray-600">{progression._count?.type || 0} progressions</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default EmployeeReports;
