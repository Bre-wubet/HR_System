import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  FileText, Download, Calendar, Clock, Users, TrendingUp, 
  AlertCircle, RefreshCw, Filter, BarChart3, PieChart 
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useReportsStore } from '../../stores/useReportsStore';
import useAuthStore from '../../stores/useAuthStore';

/**
 * AttendanceReports Component
 * Comprehensive attendance reports dashboard with real backend integration
 */
const AttendanceReports = () => {
  const { user, permissions } = useAuthStore();
  const {
    attendanceSummary,
    absenceAnalytics,
    leaveRequests,
    isLoading,
    errors,
    filters,
    fetchAttendanceSummary,
    fetchAbsenceAnalytics,
    fetchLeaveRequests,
    exportReport,
    setFilters
  } = useReportsStore();

  const [dateRange, setDateRange] = useState({
    from: new Date(new Date().setDate(1)).toISOString().split('T')[0], // First day of current month
    to: new Date().toISOString().split('T')[0] // Today
  });
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [isExporting, setIsExporting] = useState(false);

  const hasAttendancePermission = permissions?.includes('attendance:read');

  useEffect(() => {
    if (hasAttendancePermission) {
      loadAttendanceData();
    }
  }, [hasAttendancePermission]);

  const loadAttendanceData = async () => {
    try {
      const params = {
        from: dateRange.from,
        to: dateRange.to,
        ...(departmentFilter && { departmentId: departmentFilter })
      };

      await Promise.all([
        fetchAttendanceSummary(params),
        fetchAbsenceAnalytics(params),
        fetchLeaveRequests({ take: 100 })
      ]);
    } catch (error) {
      console.error('Error loading attendance data:', error);
    }
  };

  const handleDateRangeChange = (field, value) => {
    const newDateRange = { ...dateRange, [field]: value };
    setDateRange(newDateRange);
    setFilters('attendance', newDateRange);
  };

  const handleExport = async (reportType) => {
    try {
      setIsExporting(true);
      const params = {
        from: dateRange.from,
        to: dateRange.to,
        ...(departmentFilter && { departmentId: departmentFilter })
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
      id: 'summary',
      title: 'Attendance Summary',
      description: 'Overview of attendance statistics and trends',
      icon: BarChart3,
      data: attendanceSummary,
      loading: isLoading.attendance,
      error: errors.attendance
    },
    {
      id: 'absence',
      title: 'Absence Analytics',
      description: 'Detailed analysis of employee absences',
      icon: AlertCircle,
      data: absenceAnalytics,
      loading: isLoading.absence,
      error: errors.absence
    },
    {
      id: 'leave',
      title: 'Leave Requests',
      description: 'Current and historical leave request data',
      icon: Calendar,
      data: leaveRequests,
      loading: isLoading.attendance,
      error: errors.attendance
    }
  ];

  if (!hasAttendancePermission) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Access Denied</h3>
          <p className="text-gray-600">You don't have permission to view attendance reports.</p>
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
          <h1 className="text-2xl font-bold text-gray-900">Attendance Reports</h1>
          <p className="text-gray-600">Generate and download comprehensive attendance reports</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            onClick={loadAttendanceData}
            disabled={isLoading.attendance || isLoading.absence}
            variant="outline"
            size="sm"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${(isLoading.attendance || isLoading.absence) ? 'animate-spin' : ''}`} />
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
            <Input
              placeholder="Department ID (optional)"
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      {attendanceSummary && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl shadow-soft p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Records</p>
                <p className="text-2xl font-bold text-gray-900">{attendanceSummary.total || 0}</p>
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
                <p className="text-sm font-medium text-gray-600">Present</p>
                <p className="text-2xl font-bold text-green-600">{attendanceSummary.present || 0}</p>
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
                <p className="text-sm font-medium text-gray-600">Absent</p>
                <p className="text-2xl font-bold text-red-600">{attendanceSummary.absent || 0}</p>
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
                <p className="text-sm font-medium text-gray-600">Late</p>
                <p className="text-2xl font-bold text-yellow-600">{attendanceSummary.late || 0}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-500" />
            </div>
          </motion.div>
        </div>
      )}

      {/* Reports Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reports.map((report, index) => (
          <motion.div
            key={report.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-xl shadow-soft p-6 hover:shadow-medium transition-shadow"
          >
            <div className="flex items-start space-x-4">
              <div className="p-3 bg-green-50 rounded-lg">
                <report.icon className="h-6 w-6 text-green-600" />
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
                    {report.id === 'summary' && `Total: ${report.data.total || 0} records`}
                    {report.id === 'absence' && `Analytics data available`}
                    {report.id === 'leave' && `${report.data.length || 0} leave requests`}
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

      {/* Data Preview */}
      {attendanceSummary && (
        <div className="bg-white rounded-xl shadow-soft p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Summary Preview</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-2xl font-bold text-gray-900">{attendanceSummary.total || 0}</p>
              <p className="text-sm text-gray-600">Total</p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <p className="text-2xl font-bold text-green-600">{attendanceSummary.present || 0}</p>
              <p className="text-sm text-gray-600">Present</p>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <p className="text-2xl font-bold text-red-600">{attendanceSummary.absent || 0}</p>
              <p className="text-sm text-gray-600">Absent</p>
            </div>
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <p className="text-2xl font-bold text-yellow-600">{attendanceSummary.late || 0}</p>
              <p className="text-sm text-gray-600">Late</p>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default AttendanceReports;
