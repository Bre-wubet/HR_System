import React from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  Clock, 
  TrendingUp, 
  Activity, 
  Calendar 
} from 'lucide-react';
import { CheckInOutCard, AttendanceStatsCard } from './AttendanceCards';

/**
 * AttendanceStats Component
 * Displays check-in/out card and statistics cards
 */
export const AttendanceStats = ({ 
  user, 
  currentEmployeeAttendance, 
  onCheckIn, 
  onCheckOut, 
  loading, 
  stats 
}) => {
  return (
    <div className="space-y-6">
      {/* Quick Check-in/out for current user */}
      {user?.employeeId && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1">
            <CheckInOutCard
              employeeId={user.employeeId}
              currentAttendance={currentEmployeeAttendance?.find(a => 
                new Date(a.date).toDateString() === new Date().toDateString()
              )}
              onCheckIn={onCheckIn}
              onCheckOut={onCheckOut}
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
                trend={stats.attendanceRate > 80 ? 5 : -2}
              />
              <AttendanceStatsCard
                title="Absent Today"
                value={stats.absentToday}
                icon={Users}
                color="red"
                trend={stats.absentToday > 5 ? -3 : 1}
              />
              <AttendanceStatsCard
                title="Late Today"
                value={stats.lateToday}
                icon={Clock}
                color="yellow"
                trend={stats.lateToday > 3 ? -2 : 0}
              />
              <AttendanceStatsCard
                title="Attendance Rate"
                value={`${stats.attendanceRate}%`}
                icon={TrendingUp}
                color="blue"
                trend={stats.attendanceRate > 90 ? 3 : -1}
              />
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Statistics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <AttendanceStatsCard
          title="Punctuality Rate"
          value={`${stats.punctualityRate}%`}
          icon={Activity}
          color="purple"
          trend={stats.punctualityRate > 85 ? 2 : -1}
        />
        <AttendanceStatsCard
          title="Avg Work Hours"
          value={`${stats.avgWorkHours.toFixed(1)}h`}
          icon={Clock}
          color="blue"
        />
        <AttendanceStatsCard
          title="Overtime Hours"
          value={`${stats.overtimeHours.toFixed(1)}h`}
          icon={TrendingUp}
          color="orange"
        />
        <AttendanceStatsCard
          title="Work Days This Month"
          value={stats.totalWorkDays}
          icon={Calendar}
          color="green"
        />
      </div>
    </div>
  );
};

export default AttendanceStats;
