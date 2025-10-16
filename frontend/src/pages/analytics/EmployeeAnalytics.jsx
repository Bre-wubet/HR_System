import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Calendar, 
  Briefcase, 
  MapPin,
  Award,
  Clock,
  RefreshCw,
  Filter,
  Download,
  PieChart,
  Activity
} from 'lucide-react';
import useEmployeeStore from '../../stores/useEmployeeStore';
import useAuthStore from '../../stores/useAuthStore';
import { Button } from '../../components/ui/Button';

/**
 * EmployeeAnalytics Component
 * Comprehensive analytics dashboard for employee data with real backend integration
 */
const EmployeeAnalytics = () => {
  const { user, permissions, roles } = useAuthStore();
  const {
    employees,
    departments,
    skills,
    isLoading,
    error,
    fetchEmployees,
    fetchDepartments,
    fetchSkills,
    getSkillAnalytics,
    getCareerProgressionAnalytics
  } = useEmployeeStore();

  // State for analytics data
  const [analyticsData, setAnalyticsData] = useState({
    totalEmployees: 0,
    activeEmployees: 0,
    newHires: 0,
    avgTenure: 0,
    departmentDistribution: [],
    skillDistribution: [],
    careerProgression: [],
    genderDistribution: [],
    jobTypeDistribution: [],
    statusDistribution: []
  });

  const [filters, setFilters] = useState({
    department: '',
    status: '',
    dateRange: 'all'
  });

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedChart, setSelectedChart] = useState('department');

  // Check if user has analytics permissions
  const hasAnalyticsPermission = permissions?.includes('employee:read') || 
                                 roles?.includes('super_admin') || 
                                 roles?.includes('admin');

  // Load data on component mount
  useEffect(() => {
    if (hasAnalyticsPermission) {
      loadAnalyticsData();
    }
  }, [hasAnalyticsPermission]);

  // Load analytics data
  const loadAnalyticsData = async () => {
    try {
      setIsRefreshing(true);
      
      // Fetch all required data in parallel
      await Promise.all([
        fetchEmployees({ take: 1000 }), // Get all employees for analytics
        fetchDepartments(),
        fetchSkills()
      ]);

      // Calculate analytics from the fetched data
      calculateAnalytics();
      
    } catch (error) {
      console.error('Error loading analytics data:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Calculate analytics from employee data
  const calculateAnalytics = () => {
    if (!employees || employees.length === 0) return;

    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();

    // Basic metrics
    const totalEmployees = employees.length;
    const activeEmployees = employees.filter(emp => emp.status === 'ACTIVE').length;
    const newHires = employees.filter(emp => {
      const hireDate = new Date(emp.hireDate);
      return hireDate.getFullYear() === currentYear && hireDate.getMonth() === currentMonth;
    }).length;

    // Calculate average tenure
    const totalTenureMonths = employees.reduce((sum, emp) => {
      const hireDate = new Date(emp.hireDate);
      const tenureMonths = (now - hireDate) / (1000 * 60 * 60 * 24 * 30);
      return sum + tenureMonths;
    }, 0);
    const avgTenure = Math.round(totalTenureMonths / totalEmployees);

    // Department distribution
    const departmentCounts = {};
    employees.forEach(emp => {
      const deptName = emp.department?.name || 'Unknown';
      departmentCounts[deptName] = (departmentCounts[deptName] || 0) + 1;
    });
    const departmentDistribution = Object.entries(departmentCounts).map(([name, count]) => ({
      name,
      count,
      percentage: Math.round((count / totalEmployees) * 100)
    }));

    // Gender distribution
    const genderCounts = {};
    employees.forEach(emp => {
      const gender = emp.gender || 'Unknown';
      genderCounts[gender] = (genderCounts[gender] || 0) + 1;
    });
    const genderDistribution = Object.entries(genderCounts).map(([gender, count]) => ({
      gender,
      count,
      percentage: Math.round((count / totalEmployees) * 100)
    }));

    // Job type distribution
    const jobTypeCounts = {};
    employees.forEach(emp => {
      const jobType = emp.jobType || 'Unknown';
      jobTypeCounts[jobType] = (jobTypeCounts[jobType] || 0) + 1;
    });
    const jobTypeDistribution = Object.entries(jobTypeCounts).map(([jobType, count]) => ({
      jobType,
      count,
      percentage: Math.round((count / totalEmployees) * 100)
    }));

    // Status distribution
    const statusCounts = {};
    employees.forEach(emp => {
      const status = emp.status || 'Unknown';
      statusCounts[status] = (statusCounts[status] || 0) + 1;
    });
    const statusDistribution = Object.entries(statusCounts).map(([status, count]) => ({
      status,
      count,
      percentage: Math.round((count / totalEmployees) * 100)
    }));

    setAnalyticsData({
      totalEmployees,
      activeEmployees,
      newHires,
      avgTenure,
      departmentDistribution,
      skillDistribution: [], // Will be populated from skills API
      careerProgression: [], // Will be populated from career progression API
      genderDistribution,
      jobTypeDistribution,
      statusDistribution
    });
  };

  // Handle filter changes
  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  // Export analytics data
  const exportAnalytics = () => {
    const dataStr = JSON.stringify(analyticsData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `employee-analytics-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Chart color schemes
  const chartColors = [
    '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
    '#06B6D4', '#84CC16', '#F97316', '#EC4899', '#6366F1'
  ];

  if (!hasAnalyticsPermission) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <div className="text-center py-12">
          <Users className="h-12 w-12 mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Access Restricted</h3>
          <p className="text-gray-500">
            You don't have permission to view employee analytics. Please contact your administrator.
          </p>
        </div>
      </motion.div>
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
          <h1 className="text-2xl font-bold text-gray-900">Employee Analytics</h1>
          <p className="text-gray-600">Comprehensive insights and trends for employee data</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            onClick={loadAnalyticsData}
            disabled={isRefreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button
            variant="outline"
            onClick={exportAnalytics}
            disabled={isLoading}
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-soft p-4 border border-gray-200">
        <div className="flex items-center space-x-4">
          <Filter className="h-5 w-5 text-gray-500" />
          <div className="flex items-center space-x-4">
            <select
              value={filters.department}
              onChange={(e) => handleFilterChange('department', e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Departments</option>
              {departments.map(dept => (
                <option key={dept.id} value={dept.id}>{dept.name}</option>
              ))}
            </select>
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
              <option value="PROBATION">Probation</option>
              <option value="TERMINATED">Terminated</option>
              <option value="RESIGNED">Resigned</option>
            </select>
          </div>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-soft p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Employees</p>
              <p className="text-xl font-bold text-blue-600">{analyticsData.totalEmployees}</p>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-soft p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Employees</p>
              <p className="text-xl font-bold text-green-600">{analyticsData.activeEmployees}</p>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <Activity className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-soft p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">New Hires (This Month)</p>
              <p className="text-xl font-bold text-purple-600">{analyticsData.newHires}</p>
            </div>
            <div className="p-3 bg-purple-50 rounded-lg">
              <TrendingUp className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-soft p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg. Tenure</p>
                <p className="text-xl font-bold text-orange-600">{analyticsData.avgTenure} months</p>
            </div>
            <div className="p-3 bg-orange-50 rounded-lg">
              <Clock className="h-6 w-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Department Distribution */}
        <div className="bg-white rounded-xl shadow-soft p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-900">Department Distribution</h3>
            <MapPin className="h-5 w-5 text-gray-500" />
          </div>
          {analyticsData.departmentDistribution.length > 0 ? (
            <div className="space-y-3">
              {analyticsData.departmentDistribution.map((dept, index) => (
                <div key={dept.name} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: chartColors[index % chartColors.length] }}
                    />
                    <span className="text-sm font-medium text-gray-700">{dept.name}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-500">{dept.count}</span>
                    <span className="text-xs text-gray-400">({dept.percentage}%)</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <MapPin className="h-8 w-8 mx-auto text-gray-300 mb-2" />
              <p className="text-gray-500">No department data available</p>
            </div>
          )}
        </div>

        {/* Gender Distribution */}
        <div className="bg-white rounded-xl shadow-soft p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-900">Gender Distribution</h3>
            <PieChart className="h-5 w-5 text-gray-500" />
          </div>
          {analyticsData.genderDistribution.length > 0 ? (
            <div className="space-y-3">
              {analyticsData.genderDistribution.map((gender, index) => (
                <div key={gender.gender} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: chartColors[index % chartColors.length] }}
                    />
                    <span className="text-sm font-medium text-gray-700">{gender.gender}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-500">{gender.count}</span>
                    <span className="text-xs text-gray-400">({gender.percentage}%)</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <PieChart className="h-8 w-8 mx-auto text-gray-300 mb-2" />
              <p className="text-gray-500">No gender data available</p>
            </div>
          )}
        </div>

        {/* Job Type Distribution */}
        <div className="bg-white rounded-xl shadow-soft p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-900">Job Type Distribution</h3>
            <Briefcase className="h-5 w-5 text-gray-500" />
          </div>
          {analyticsData.jobTypeDistribution.length > 0 ? (
            <div className="space-y-3">
              {analyticsData.jobTypeDistribution.map((jobType, index) => (
                <div key={jobType.jobType} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: chartColors[index % chartColors.length] }}
                    />
                    <span className="text-sm font-medium text-gray-700">{jobType.jobType}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-500">{jobType.count}</span>
                    <span className="text-xs text-gray-400">({jobType.percentage}%)</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Briefcase className="h-8 w-8 mx-auto text-gray-300 mb-2" />
              <p className="text-gray-500">No job type data available</p>
            </div>
          )}
        </div>

        {/* Employment Status Distribution */}
        <div className="bg-white rounded-xl shadow-soft p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-900">Employment Status</h3>
            <Award className="h-5 w-5 text-gray-500" />
          </div>
          {analyticsData.statusDistribution.length > 0 ? (
            <div className="space-y-3">
              {analyticsData.statusDistribution.map((status, index) => (
                <div key={status.status} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: chartColors[index % chartColors.length] }}
                    />
                    <span className="text-sm font-medium text-gray-700">{status.status}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-500">{status.count}</span>
                    <span className="text-xs text-gray-400">({status.percentage}%)</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Award className="h-8 w-8 mx-auto text-gray-300 mb-2" />
              <p className="text-gray-500">No status data available</p>
            </div>
          )}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl shadow-soft p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Employee Activity</h3>
        {employees && employees.length > 0 ? (
          <div className="space-y-3">
            {employees.slice(0, 5).map((employee) => (
              <div key={employee.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-blue-600">
                      {employee.firstName?.[0]}{employee.lastName?.[0]}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {employee.firstName} {employee.lastName}
                    </p>
                    <p className="text-xs text-gray-500">{employee.jobTitle}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500">{employee.department?.name}</p>
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                    employee.status === 'ACTIVE' 
                      ? 'bg-green-100 text-green-800'
                      : employee.status === 'PROBATION'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {employee.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Users className="h-8 w-8 mx-auto text-gray-300 mb-2" />
            <p className="text-gray-500">No employee data available</p>
          </div>
        )}
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default EmployeeAnalytics;