import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart3, 
  Calendar, 
  Clock, 
  TrendingUp, 
  Users,
  RefreshCw,
  Download,
  Filter
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import useAttendanceStore from '../../stores/useAttendanceStore';
import { ATTENDANCE_STATUS } from '../../api/attendanceApi';

/**
 * AttendanceAnalytics Component
 * Real-time analytics dashboard for attendance data
 */
const AttendanceAnalytics = () => {
  const [dateRange, setDateRange] = useState({
    from: new Date(new Date().setDate(1)).toISOString().split('T')[0], // First day of current month
    to: new Date().toISOString().split('T')[0] // Today
  });
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const {
    attendanceSummary,
    absenceAnalytics,
    attendance,
    loading,
    error,
    fetchAttendanceSummary,
    fetchAbsenceAnalytics,
    fetchAttendance,
    getTodayAttendance,
    getCurrentWeekAttendance,
    getCurrentMonthAttendance
  } = useAttendanceStore();

  // Load data on component mount and when filters change
  useEffect(() => {
    loadAnalyticsData();
  }, [dateRange, departmentFilter]);

  const loadAnalyticsData = async () => {
    try {
      setIsRefreshing(true);
      const params = {
        dateFrom: new Date(dateRange.from).toISOString(),
        dateTo: new Date(dateRange.to).toISOString(),
        ...(departmentFilter && { departmentId: departmentFilter })
      };

      await Promise.all([
        fetchAttendanceSummary(params),
        fetchAbsenceAnalytics(params),
        fetchAttendance({ 
          ...params, 
          take: 200 // Get more data for analytics (max allowed by backend)
        })
      ]);
    } catch (error) {
      console.error('Error loading analytics data:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const todayAttendance = getTodayAttendance();
  const weekAttendance = getCurrentWeekAttendance();
  const monthAttendance = getCurrentMonthAttendance();

  // Calculate detailed statistics
  const calculateStats = () => {
    const totalRecords = attendance.length;
    const presentRecords = attendance.filter(a => a.status === ATTENDANCE_STATUS.PRESENT);
    const absentRecords = attendance.filter(a => a.status === ATTENDANCE_STATUS.ABSENT);
    const lateRecords = attendance.filter(a => a.status === ATTENDANCE_STATUS.LATE);
    const onLeaveRecords = attendance.filter(a => a.status === ATTENDANCE_STATUS.ON_LEAVE);

    // Calculate work hours statistics
    const workHoursData = presentRecords.filter(a => a.checkIn && a.checkOut).map(a => {
      const diffMs = new Date(a.checkOut).getTime() - new Date(a.checkIn).getTime();
      return diffMs / (1000 * 60 * 60); // Convert to hours
    });

    const avgWorkHours = workHoursData.length > 0 ? 
      workHoursData.reduce((sum, hours) => sum + hours, 0) / workHoursData.length : 0;

    const totalOvertime = workHoursData.reduce((sum, hours) => sum + Math.max(0, hours - 8), 0);

    // Calculate attendance trends
    const attendanceRate = totalRecords > 0 ? (presentRecords.length / totalRecords) * 100 : 0;
    const absenceRate = totalRecords > 0 ? (absentRecords.length / totalRecords) * 100 : 0;
    const lateRate = totalRecords > 0 ? (lateRecords.length / totalRecords) * 100 : 0;

    return {
      total: totalRecords,
      present: presentRecords.length,
      absent: absentRecords.length,
      late: lateRecords.length,
      onLeave: onLeaveRecords.length,
      attendanceRate: Math.round(attendanceRate * 100) / 100,
      absenceRate: Math.round(absenceRate * 100) / 100,
      lateRate: Math.round(lateRate * 100) / 100,
      avgWorkHours: Math.round(avgWorkHours * 100) / 100,
      totalOvertime: Math.round(totalOvertime * 100) / 100,
      workHoursData
    };
  };

  const stats = calculateStats();

  // Calculate daily trends for the selected period
  const calculateDailyTrends = () => {
    const trends = [];
    const startDate = new Date(dateRange.from);
    const endDate = new Date(dateRange.to);
    
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      const dayAttendance = attendance.filter(a => 
        new Date(a.date).toDateString() === d.toDateString()
      );
      
      trends.push({
        date: d.toISOString().split('T')[0],
        present: dayAttendance.filter(a => a.status === ATTENDANCE_STATUS.PRESENT).length,
        absent: dayAttendance.filter(a => a.status === ATTENDANCE_STATUS.ABSENT).length,
        late: dayAttendance.filter(a => a.status === ATTENDANCE_STATUS.LATE).length,
        onLeave: dayAttendance.filter(a => a.status === ATTENDANCE_STATUS.ON_LEAVE).length,
        total: dayAttendance.length
      });
    }
    
    return trends;
  };

  const dailyTrends = calculateDailyTrends();

  // Calculate employee-wise statistics
  const calculateEmployeeStats = () => {
    const employeeMap = new Map();
    
    attendance.forEach(record => {
      const employeeId = record.employeeId;
      const employeeName = `${record.employee?.firstName} ${record.employee?.lastName}`;
      
      if (!employeeMap.has(employeeId)) {
        employeeMap.set(employeeId, {
          id: employeeId,
          name: employeeName,
          total: 0,
          present: 0,
          absent: 0,
          late: 0,
          onLeave: 0,
          workHours: 0,
          overtime: 0
        });
      }
      
      const stats = employeeMap.get(employeeId);
      stats.total++;
      
      switch (record.status) {
        case ATTENDANCE_STATUS.PRESENT:
          stats.present++;
          break;
        case ATTENDANCE_STATUS.ABSENT:
          stats.absent++;
          break;
        case ATTENDANCE_STATUS.LATE:
          stats.late++;
          break;
        case ATTENDANCE_STATUS.ON_LEAVE:
          stats.onLeave++;
          break;
      }
      
      if (record.checkIn && record.checkOut) {
        const diffMs = new Date(record.checkOut).getTime() - new Date(record.checkIn).getTime();
        const hours = diffMs / (1000 * 60 * 60);
        stats.workHours += hours;
        stats.overtime += Math.max(0, hours - 8);
      }
    });
    
    return Array.from(employeeMap.values()).map(emp => ({
      ...emp,
      attendanceRate: emp.total > 0 ? Math.round((emp.present / emp.total) * 100) : 0,
      avgWorkHours: emp.present > 0 ? Math.round((emp.workHours / emp.present) * 100) / 100 : 0
    }));
  };

  const employeeStats = calculateEmployeeStats();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Attendance Analytics</h1>
          <p className="text-gray-600">Insights and trends for attendance data</p>
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
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-soft p-6 border border-gray-200">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex items-center space-x-3">
            <Filter className="h-4 w-4 text-gray-400" />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date From</label>
              <Input
                type="date"
                value={dateRange.from}
                onChange={(e) => setDateRange({ ...dateRange, from: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date To</label>
              <Input
                type="date"
                value={dateRange.to}
                onChange={(e) => setDateRange({ ...dateRange, to: e.target.value })}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error loading analytics data</h3>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-soft p-6 border border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-green-50 rounded-lg">
              <Users className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-900">Present Today</h3>
              <p className="text-xl font-bold text-green-600">{stats.present}</p>
              <p className="text-sm text-gray-500">{stats.attendanceRate}% attendance rate</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-soft p-6 border border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-yellow-50 rounded-lg">
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-900">Late Arrivals</h3>
              <p className="text-2xl font-bold text-yellow-600">{stats.late}</p>
              <p className="text-sm text-gray-500">{stats.lateRate}% late rate</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-soft p-6 border border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-blue-50 rounded-lg">
              <TrendingUp className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-900">Avg. Work Hours</h3>
              <p className="text-xl font-bold text-blue-600">{stats.avgWorkHours}h</p>
              <p className="text-sm text-gray-500">{stats.totalOvertime}h total overtime</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-soft p-6 border border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-purple-50 rounded-lg">
              <BarChart3 className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-900">Total Records</h3>
              <p className="text-xl font-bold text-purple-600">{stats.total}</p>
              <p className="text-sm text-gray-500">In selected period</p>
            </div>
          </div>
        </div>
      </div>

      {/* Daily Trends Chart */}
      <div className="bg-white rounded-xl shadow-soft p-6 border border-gray-200">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Daily Attendance Trends</h3>
          <div className="flex items-center space-x-4 text-sm">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span>Present</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span>Absent</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <span>Late</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span>On Leave</span>
            </div>
          </div>
        </div>
        
        <div className="h-64 flex items-end space-x-1">
          {dailyTrends.map((trend, index) => {
            const maxValue = Math.max(trend.present, trend.absent, trend.late, trend.onLeave);
            const height = maxValue > 0 ? (trend.total / Math.max(...dailyTrends.map(t => t.total))) * 100 : 0;
            
            return (
              <div key={index} className="flex-1 flex flex-col items-center space-y-1">
                <div className="w-full flex flex-col justify-end h-48">
                  <div className="w-full bg-green-500" style={{ height: `${(trend.present / maxValue) * height}%` }}></div>
                  <div className="w-full bg-red-500" style={{ height: `${(trend.absent / maxValue) * height}%` }}></div>
                  <div className="w-full bg-yellow-500" style={{ height: `${(trend.late / maxValue) * height}%` }}></div>
                  <div className="w-full bg-blue-500" style={{ height: `${(trend.onLeave / maxValue) * height}%` }}></div>
                </div>
                <div className="text-xs text-gray-500 transform -rotate-45 origin-left">
                  {new Date(trend.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Employee Performance */}
      <div className="bg-white rounded-xl shadow-soft p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Employee Performance</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Employee
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Attendance Rate
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Avg. Work Hours
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Overtime
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Records
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {employeeStats.slice(0, 10).map((employee) => (
                <tr key={employee.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{employee.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                        <div 
                          className={`h-2 rounded-full ${employee.attendanceRate >= 90 ? 'bg-green-500' : employee.attendanceRate >= 80 ? 'bg-yellow-500' : 'bg-red-500'}`}
                          style={{ width: `${employee.attendanceRate}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-900">{employee.attendanceRate}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {employee.avgWorkHours}h
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {employee.overtime.toFixed(1)}h
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {employee.total}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
};

export default AttendanceAnalytics;
