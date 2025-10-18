import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart3, 
  PieChart, 
  TrendingUp, 
  TrendingDown,
  Calendar,
  Clock,
  Users,
  Activity,
  Target,
  Award,
  AlertTriangle,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { Button } from '../../../../components/ui/Button';
import { Modal } from '../../../../components/ui/Modal';
import { ATTENDANCE_STATUS } from '../../../../api/attendanceApi';

/**
 * AttendanceAnalytics Component
 * Comprehensive analytics dashboard for attendance data
 */
export const AttendanceAnalytics = ({ 
  attendance = [], 
  attendanceSummary = null, 
  absenceAnalytics = null,
  onDateRangeChange 
}) => {
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [showModal, setShowModal] = useState(false);

  // Calculate analytics data
  const analytics = React.useMemo(() => {
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    
    const monthlyAttendance = attendance.filter(record => {
      const recordDate = new Date(record.date);
      return recordDate >= startOfMonth && recordDate <= endOfMonth;
    });

    const weeklyAttendance = attendance.filter(record => {
      const recordDate = new Date(record.date);
      const startOfWeek = new Date(today);
      startOfWeek.setDate(today.getDate() - today.getDay());
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      return recordDate >= startOfWeek && recordDate <= endOfWeek;
    });

    const dailyAttendance = attendance.filter(record => {
      const recordDate = new Date(record.date);
      return recordDate.toDateString() === today.toDateString();
    });

    return {
      monthly: {
        total: monthlyAttendance.length,
        present: monthlyAttendance.filter(a => a.status === ATTENDANCE_STATUS.PRESENT).length,
        absent: monthlyAttendance.filter(a => a.status === ATTENDANCE_STATUS.ABSENT).length,
        late: monthlyAttendance.filter(a => a.status === ATTENDANCE_STATUS.LATE).length,
        onLeave: monthlyAttendance.filter(a => a.status === ATTENDANCE_STATUS.ON_LEAVE).length,
        attendanceRate: monthlyAttendance.length > 0 ? 
          Math.round((monthlyAttendance.filter(a => a.status === ATTENDANCE_STATUS.PRESENT).length / monthlyAttendance.length) * 100) : 0,
        punctualityRate: monthlyAttendance.length > 0 ?
          Math.round((monthlyAttendance.filter(a => a.status === ATTENDANCE_STATUS.PRESENT).length / monthlyAttendance.length) * 100) : 0
      },
      weekly: {
        total: weeklyAttendance.length,
        present: weeklyAttendance.filter(a => a.status === ATTENDANCE_STATUS.PRESENT).length,
        absent: weeklyAttendance.filter(a => a.status === ATTENDANCE_STATUS.ABSENT).length,
        late: weeklyAttendance.filter(a => a.status === ATTENDANCE_STATUS.LATE).length,
        onLeave: weeklyAttendance.filter(a => a.status === ATTENDANCE_STATUS.ON_LEAVE).length,
        attendanceRate: weeklyAttendance.length > 0 ? 
          Math.round((weeklyAttendance.filter(a => a.status === ATTENDANCE_STATUS.PRESENT).length / weeklyAttendance.length) * 100) : 0
      },
      daily: {
        total: dailyAttendance.length,
        present: dailyAttendance.filter(a => a.status === ATTENDANCE_STATUS.PRESENT).length,
        absent: dailyAttendance.filter(a => a.status === ATTENDANCE_STATUS.ABSENT).length,
        late: dailyAttendance.filter(a => a.status === ATTENDANCE_STATUS.LATE).length,
        onLeave: dailyAttendance.filter(a => a.status === ATTENDANCE_STATUS.ON_LEAVE).length,
        attendanceRate: dailyAttendance.length > 0 ? 
          Math.round((dailyAttendance.filter(a => a.status === ATTENDANCE_STATUS.PRESENT).length / dailyAttendance.length) * 100) : 0
      }
    };
  }, [attendance]);

  const getCurrentData = () => {
    switch (selectedPeriod) {
      case 'daily':
        return analytics.daily;
      case 'weekly':
        return analytics.weekly;
      case 'monthly':
        return analytics.monthly;
      default:
        return analytics.monthly;
    }
  };

  const currentData = getCurrentData();

  const StatCard = ({ title, value, icon: Icon, color, trend, subtitle }) => {
    const colorClasses = {
      green: 'text-green-600 bg-green-50 border-green-200',
      red: 'text-red-600 bg-red-50 border-red-200',
      yellow: 'text-yellow-600 bg-yellow-50 border-yellow-200',
      blue: 'text-blue-600 bg-blue-50 border-blue-200',
      purple: 'text-purple-600 bg-purple-50 border-purple-200',
    };

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-soft p-6 border border-gray-200"
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            {subtitle && (
              <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
            )}
            {trend !== undefined && (
              <div className="flex items-center space-x-1 mt-1">
                {trend > 0 ? (
                  <TrendingUp className="h-3 w-3 text-green-600" />
                ) : trend < 0 ? (
                  <TrendingDown className="h-3 w-3 text-red-600" />
                ) : (
                  <Activity className="h-3 w-3 text-gray-600" />
                )}
                <span className={`text-xs font-medium ${trend > 0 ? 'text-green-600' : trend < 0 ? 'text-red-600' : 'text-gray-600'}`}>
                  {trend > 0 ? '+' : ''}{trend}% vs last period
                </span>
              </div>
            )}
          </div>
          <div className={`p-3 rounded-lg border ${colorClasses[color]}`}>
            <Icon className="h-6 w-6" />
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Attendance Analytics</h2>
          <p className="text-sm text-gray-600">Comprehensive insights into attendance patterns</p>
        </div>
        <div className="flex items-center space-x-2">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
          </select>
          <Button variant="outline" onClick={() => setShowModal(true)}>
            <BarChart3 className="h-4 w-4 mr-2" />
            Detailed View
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Attendance Rate"
          value={`${currentData.attendanceRate}%`}
          icon={Target}
          color="blue"
          trend={currentData.attendanceRate > 90 ? 5 : currentData.attendanceRate > 80 ? 2 : -3}
          subtitle={`${currentData.present} of ${currentData.total} employees`}
        />
        <StatCard
          title="Present"
          value={currentData.present}
          icon={CheckCircle}
          color="green"
          trend={currentData.present > currentData.total * 0.8 ? 3 : -2}
        />
        <StatCard
          title="Absent"
          value={currentData.absent}
          icon={XCircle}
          color="red"
          trend={currentData.absent < currentData.total * 0.1 ? -2 : 4}
        />
        <StatCard
          title="Late Arrivals"
          value={currentData.late}
          icon={AlertTriangle}
          color="yellow"
          trend={currentData.late < currentData.total * 0.05 ? -1 : 2}
        />
      </div>

      {/* Performance Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-soft p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Indicators</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Award className="h-4 w-4 text-blue-600" />
                <span className="text-sm text-gray-600">Punctuality Score</span>
              </div>
              <span className="text-sm font-medium text-gray-900">
                {currentData.punctualityRate}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${currentData.punctualityRate}%` }}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Activity className="h-4 w-4 text-green-600" />
                <span className="text-sm text-gray-600">Consistency Rate</span>
              </div>
              <span className="text-sm font-medium text-gray-900">
                {Math.round((currentData.present / Math.max(currentData.total, 1)) * 100)}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-green-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${Math.round((currentData.present / Math.max(currentData.total, 1)) * 100)}%` }}
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-soft p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Trends & Insights</h3>
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              {currentData.attendanceRate > 90 ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : currentData.attendanceRate > 80 ? (
                <AlertTriangle className="h-4 w-4 text-yellow-600" />
              ) : (
                <XCircle className="h-4 w-4 text-red-600" />
              )}
              <span className="text-sm text-gray-600">
                {currentData.attendanceRate > 90 ? 'Excellent' : 
                 currentData.attendanceRate > 80 ? 'Good' : 'Needs Improvement'} attendance rate
              </span>
            </div>
            
            <div className="flex items-center space-x-2">
              {currentData.late < currentData.total * 0.05 ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <AlertTriangle className="h-4 w-4 text-yellow-600" />
              )}
              <span className="text-sm text-gray-600">
                {currentData.late < currentData.total * 0.05 ? 'Low' : 'High'} tardiness rate
              </span>
            </div>
            
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4 text-blue-600" />
              <span className="text-sm text-gray-600">
                {currentData.onLeave} employees on leave
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Analytics Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Detailed Attendance Analytics"
        size="xl"
      >
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <h4 className="font-semibold text-gray-900">Daily</h4>
              <p className="text-2xl font-bold text-blue-600">{analytics.daily.attendanceRate}%</p>
              <p className="text-sm text-gray-600">{analytics.daily.present} present</p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <h4 className="font-semibold text-gray-900">Weekly</h4>
              <p className="text-2xl font-bold text-green-600">{analytics.weekly.attendanceRate}%</p>
              <p className="text-sm text-gray-600">{analytics.weekly.present} present</p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <h4 className="font-semibold text-gray-900">Monthly</h4>
              <p className="text-2xl font-bold text-purple-600">{analytics.monthly.attendanceRate}%</p>
              <p className="text-sm text-gray-600">{analytics.monthly.present} present</p>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-semibold text-gray-900">Recommendations</h4>
            <div className="space-y-2">
              {analytics.monthly.attendanceRate < 85 && (
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    Consider implementing attendance improvement programs to boost the current {analytics.monthly.attendanceRate}% rate.
                  </p>
                </div>
              )}
              {analytics.monthly.late > analytics.monthly.total * 0.1 && (
                <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                  <p className="text-sm text-orange-800">
                    High tardiness rate detected. Consider flexible start times or punctuality incentives.
                  </p>
                </div>
              )}
              {analytics.monthly.attendanceRate > 95 && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm text-green-800">
                    Excellent attendance rate! Consider recognizing top performers.
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center justify-end space-x-3 pt-4">
            <Button
              variant="outline"
              onClick={() => setShowModal(false)}
            >
              Close
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default AttendanceAnalytics;
