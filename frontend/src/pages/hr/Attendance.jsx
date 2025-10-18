import React from 'react';
import { motion } from 'framer-motion';
import { 
  AttendanceHeader,
  NetworkStatusAlert,
  AttendanceStats,
  AttendanceViewToggle,
  AttendanceErrorState,
  AttendanceContent,
  RecentAttendanceCards,
  AttendanceModals
} from './components/attendanceComponents';
import { useAttendanceLogic } from './hooks/useAttendanceLogic';

/**
 * Refactored Attendance Component
 * Modular attendance management dashboard with separated concerns
 */
const Attendance = () => {
  const {
    // State
    viewMode,
    selectedDate,
    isRefreshing,
    showRecordModal,
    showAnalyticsModal,
    showEditModal,
    editingRecord,
    isEditing,
    isOnline,
    lastUpdate,
    
    // Data
    user,
    attendance,
    currentEmployeeAttendance,
    attendanceSummary,
    absenceAnalytics,
    loading,
    error,
    stats,
    
    // Actions
    setViewMode,
    setShowRecordModal,
    setShowAnalyticsModal,
    loadAttendanceData,
    handleCheckIn,
    handleCheckOut,
    handleEditAttendance,
    handleOpenEditModal,
    handleCloseEditModal,
    handleDateClick,
  } = useAttendanceLogic();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header */}
      <AttendanceHeader
        isOnline={isOnline}
        lastUpdate={lastUpdate}
        isRefreshing={isRefreshing}
        onRefresh={loadAttendanceData}
        onShowRecordModal={() => setShowRecordModal(true)}
        onShowAnalyticsModal={() => setShowAnalyticsModal(true)}
      />

      {/* Network Status Alert */}
      <NetworkStatusAlert isOnline={isOnline} />

      {/* Statistics */}
      <AttendanceStats
        user={user}
        currentEmployeeAttendance={currentEmployeeAttendance}
        onCheckIn={handleCheckIn}
        onCheckOut={handleCheckOut}
        loading={loading}
        stats={stats}
      />

      {/* View Toggle */}
      <AttendanceViewToggle
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        attendanceCount={attendance.length}
      />

      {/* Error State */}
      <AttendanceErrorState error={error} />

      {/* Main Content */}
      <AttendanceContent
        viewMode={viewMode}
        attendance={attendance}
        attendanceSummary={attendanceSummary}
        absenceAnalytics={absenceAnalytics}
        onEditAttendance={handleOpenEditModal}
        onDateClick={handleDateClick}
        loading={loading}
      />

      {/* Recent Attendance Cards */}
      <RecentAttendanceCards
        attendance={attendance}
        viewMode={viewMode}
        onEditAttendance={handleOpenEditModal}
      />

      {/* Modals */}
      <AttendanceModals
        showRecordModal={showRecordModal}
        showAnalyticsModal={showAnalyticsModal}
        showEditModal={showEditModal}
        editingRecord={editingRecord}
        onCloseRecordModal={() => setShowRecordModal(false)}
        onCloseAnalyticsModal={() => setShowAnalyticsModal(false)}
        onCloseEditModal={handleCloseEditModal}
        onEditAttendance={handleEditAttendance}
        isEditing={isEditing}
        stats={stats}
      />
    </motion.div>
  );
};

export default Attendance;