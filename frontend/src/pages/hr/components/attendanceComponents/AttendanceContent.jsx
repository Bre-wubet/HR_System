import React from 'react';
import { motion } from 'framer-motion';
import { 
  AttendanceTable,
  AttendanceCalendar,
  AttendanceAnalytics,
  AttendanceCard
} from './index';

/**
 * AttendanceContent Component
 * Main content area that switches between different views
 */
export const AttendanceContent = ({ 
  viewMode, 
  attendance, 
  attendanceSummary, 
  absenceAnalytics, 
  onEditAttendance, 
  onDateClick, 
  loading 
}) => {
  const renderContent = () => {
    switch (viewMode) {
      case 'table':
        return (
          <AttendanceTable
            attendance={attendance}
            onEdit={onEditAttendance}
            onDelete={(id) => console.log('Delete attendance:', id)}
            loading={loading}
            showActions={true}
            showEmployee={true}
          />
        );
      case 'calendar':
        return (
          <AttendanceCalendar
            attendance={attendance}
            onDateClick={onDateClick}
          />
        );
      case 'analytics':
        return (
          <AttendanceAnalytics
            attendance={attendance}
            attendanceSummary={attendanceSummary}
            absenceAnalytics={absenceAnalytics}
          />
        );
      default:
        return null;
    }
  };

  return (
    <motion.div
      key={viewMode}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {renderContent()}
    </motion.div>
  );
};

/**
 * RecentAttendanceCards Component
 * Shows recent attendance records as cards
 */
export const RecentAttendanceCards = ({ 
  attendance, 
  viewMode, 
  onEditAttendance 
}) => {
  if (attendance.length === 0 || viewMode === 'analytics') return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      <h3 className="text-lg font-semibold text-gray-900">Recent Attendance</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {attendance.slice(0, 6).map((record) => (
          <AttendanceCard
            key={record.id}
            attendance={record}
            onEdit={onEditAttendance}
            showActions={true}
          />
        ))}
      </div>
    </motion.div>
  );
};

export default AttendanceContent;
