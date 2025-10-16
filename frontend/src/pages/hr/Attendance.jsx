import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Calendar, 
  Clock, 
  Users, 
  TrendingUp, 
  Filter,
  Plus,
  Grid,
  List,
  RefreshCw
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { 
  AttendanceCard,
  CheckInOutCard,
  AttendanceStatsCard,
  AttendanceTable,
  AttendanceCalendar
} from './components/attendanceComponents';
import useAttendanceStore from '../../stores/useAttendanceStore';
import useAuthStore from '../../stores/useAuthStore';
import { ATTENDANCE_STATUS } from '../../api/attendanceApi';

/**
 * Attendance Component
 * Comprehensive attendance management dashboard with check-in/out functionality
 */
const Attendance = () => {
  const [viewMode, setViewMode] = useState('table'); // 'table' or 'calendar'
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const { user } = useAuthStore();
  const {
    attendance,
    currentEmployeeAttendance,
    attendanceSummary,
    loading,
    error,
    fetchAttendance,
    fetchEmployeeAttendance,
    fetchAttendanceSummary,
    checkIn,
    checkOut,
    recordAttendance,
    getTodayAttendance,
    getCurrentWeekAttendance,
    getCurrentMonthAttendance
  } = useAttendanceStore();

  // Load data on component mount
  useEffect(() => {
    loadAttendanceData();
  }, []);

  const loadAttendanceData = async () => {
    try {
      setIsRefreshing(true);
      await Promise.all([
        fetchAttendance({ take: 100 }),
        fetchAttendanceSummary({ from: new Date(new Date().setDate(1)).toISOString() }),
        user?.employeeId && fetchEmployeeAttendance(user.employeeId, { 
          dateFrom: new Date(new Date().setDate(1)).toISOString(),
          dateTo: new Date().toISOString()
        })
      ]);
    } catch (error) {
      console.error('Error loading attendance data:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleCheckIn = async (employeeId, data) => {
    try {
      console.log('Check-in attempt:', { employeeId, data, user });
      
      // Check if employeeId is valid
      if (!employeeId) {
        console.error('No employee ID provided. User object:', user);
        alert('Unable to check in: No employee ID found. Please contact your administrator.');
        return;
      }
      
      await checkIn(employeeId, data);
      // Refresh data after check-in
      await loadAttendanceData();
    } catch (error) {
      console.error('Error checking in:', error);
      console.error('Error details:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });
    }
  };

  const handleCheckOut = async (employeeId, data) => {
    try {
      // Check if employeeId is valid
      if (!employeeId) {
        console.error('No employee ID provided. User object:', user);
        alert('Unable to check out: No employee ID found. Please contact your administrator.');
        return;
      }
      
      await checkOut(employeeId, data);
      // Refresh data after check-out
      await loadAttendanceData();
    } catch (error) {
      console.error('Error checking out:', error);
    }
  };

  const handleEditAttendance = async (attendanceId, data) => {
    try {
      await recordAttendance({
        id: attendanceId,
        ...data,
        checkIn: data.checkIn ? new Date(data.checkIn).toISOString() : null,
        checkOut: data.checkOut ? new Date(data.checkOut).toISOString() : null,
      });
      await loadAttendanceData();
    } catch (error) {
      console.error('Error updating attendance:', error);
    }
  };

  const handleDateClick = (date, attendanceRecord) => {
    setSelectedDate(date);
    // You can implement additional logic here, like showing a modal with details
  };

  const todayAttendance = getTodayAttendance();
  const weekAttendance = getCurrentWeekAttendance();
  const monthAttendance = getCurrentMonthAttendance();

  // Calculate statistics
  const stats = {
    presentToday: todayAttendance.filter(a => a.status === ATTENDANCE_STATUS.PRESENT).length,
    absentToday: todayAttendance.filter(a => a.status === ATTENDANCE_STATUS.ABSENT).length,
    lateToday: todayAttendance.filter(a => a.status === ATTENDANCE_STATUS.LATE).length,
    onLeaveToday: todayAttendance.filter(a => a.status === ATTENDANCE_STATUS.ON_LEAVE).length,
    totalEmployees: attendanceSummary?.total || 0,
    attendanceRate: attendanceSummary ? 
      Math.round((attendanceSummary.present / attendanceSummary.total) * 100) : 0,
    avgWorkHours: monthAttendance.length > 0 ? 
      monthAttendance.reduce((sum, a) => {
        if (a.checkIn && a.checkOut) {
          const diffMs = new Date(a.checkOut).getTime() - new Date(a.checkIn).getTime();
          return sum + (diffMs / (1000 * 60 * 60));
        }
        return sum;
      }, 0) / monthAttendance.length : 0
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
          <h1 className="text-2xl font-bold text-gray-900">Attendance Management</h1>
          <p className="text-gray-600">Track and manage employee attendance and time tracking</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            onClick={loadAttendanceData}
            disabled={isRefreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Record Attendance
          </Button>
        </div>
      </div>

      {/* Quick Check-in/out for current user */}
      {user?.employeeId && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1">
            <CheckInOutCard
              employeeId={user.employeeId}
              currentAttendance={currentEmployeeAttendance?.find(a => 
                new Date(a.date).toDateString() === new Date().toDateString()
              )}
              onCheckIn={handleCheckIn}
              onCheckOut={handleCheckOut}
              loading={loading}
            />
          </div>
          <div className="lg:col-span-3">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <AttendanceStatsCard
                title="Present Today"
                value={stats.presentToday}
                icon={Users}
                color="green"
              />
              <AttendanceStatsCard
                title="Absent Today"
                value={stats.absentToday}
                icon={Users}
                color="red"
              />
              <AttendanceStatsCard
                title="Late Today"
                value={stats.lateToday}
                icon={Clock}
                color="yellow"
              />
              <AttendanceStatsCard
                title="Attendance Rate"
                value={`${stats.attendanceRate}%`}
                icon={TrendingUp}
                color="blue"
              />
            </div>
          </div>
        </div>
      )}

      {/* View Mode Toggle */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <h2 className="text-lg font-semibold text-gray-900">Attendance Records</h2>
          <span className="text-sm text-gray-500">
            ({attendance.length} records)
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant={viewMode === 'table' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('table')}
          >
            <List className="h-4 w-4 mr-2" />
            Table
          </Button>
          <Button
            variant={viewMode === 'calendar' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('calendar')}
          >
            <Grid className="h-4 w-4 mr-2" />
            Calendar
          </Button>
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
              <h3 className="text-sm font-medium text-red-800">Error loading attendance data</h3>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Attendance Records */}
      {viewMode === 'table' ? (
        <AttendanceTable
          attendance={attendance}
          onEdit={handleEditAttendance}
          onDelete={(id) => console.log('Delete attendance:', id)}
          loading={loading}
          showActions={true}
          showEmployee={true}
        />
      ) : (
        <AttendanceCalendar
          attendance={attendance}
          onDateClick={handleDateClick}
        />
      )}

      {/* Recent Attendance Cards (Alternative view) */}
      {attendance.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Recent Attendance</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {attendance.slice(0, 6).map((record) => (
              <AttendanceCard
                key={record.id}
                attendance={record}
                onEdit={handleEditAttendance}
                showActions={true}
              />
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default Attendance;
