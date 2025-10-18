import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Clock, Calendar, CheckCircle, XCircle, AlertCircle, User } from 'lucide-react';
import { Button } from '../../../../components/ui/Button';
import { Input } from '../../../../components/ui/Input';
import { Modal } from '../../../../components/ui/Modal';
import { 
  ATTENDANCE_STATUS, 
  formatTime, 
  formatDate, 
  calculateWorkHours, 
  calculateOvertime,
  isLate 
} from '../../../../api/attendanceApi';

/**
 * AttendanceCard Component
 * Displays attendance information for a single day
 */
export const AttendanceCard = ({ attendance, onEdit, showActions = true }) => {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editData, setEditData] = useState({
    status: attendance.status,
    checkIn: attendance.checkIn ? new Date(attendance.checkIn).toISOString().slice(0, 16) : '',
    checkOut: attendance.checkOut ? new Date(attendance.checkOut).toISOString().slice(0, 16) : '',
  });

  const workHours = calculateWorkHours(attendance.checkIn, attendance.checkOut);
  const overtime = calculateOvertime(workHours);
  const isLateArrival = isLate(attendance.checkIn);

  const getStatusIcon = (status) => {
    switch (status) {
      case ATTENDANCE_STATUS.PRESENT:
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case ATTENDANCE_STATUS.ABSENT:
        return <XCircle className="h-4 w-4 text-red-600" />;
      case ATTENDANCE_STATUS.LATE:
        return <AlertCircle className="h-4 w-4 text-yellow-600" />;
      case ATTENDANCE_STATUS.ON_LEAVE:
        return <Calendar className="h-4 w-4 text-blue-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case ATTENDANCE_STATUS.PRESENT:
        return 'bg-green-100 text-green-800 border-green-200';
      case ATTENDANCE_STATUS.ABSENT:
        return 'bg-red-100 text-red-800 border-red-200';
      case ATTENDANCE_STATUS.LATE:
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case ATTENDANCE_STATUS.ON_LEAVE:
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const handleSave = () => {
    onEdit(attendance.id, editData);
    setIsEditModalOpen(false);
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-soft p-6 border border-gray-200 hover:shadow-medium transition-shadow"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            {getStatusIcon(attendance.status)}
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {formatDate(attendance.date)}
              </h3>
              <p className="text-sm text-gray-600">
                {attendance.employee?.firstName} {attendance.employee?.lastName}
              </p>
            </div>
          </div>
          <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(attendance.status)}`}>
            {attendance.status.replace('_', ' ')}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-gray-400" />
              <span className="text-sm text-gray-600">Check In:</span>
            </div>
            <p className="text-sm font-medium text-gray-900">
              {attendance.checkIn ? formatTime(attendance.checkIn) : '--:--'}
              {isLateArrival && (
                <span className="ml-2 text-xs text-yellow-600 font-medium">(Late)</span>
              )}
            </p>
          </div>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-gray-400" />
              <span className="text-sm text-gray-600">Check Out:</span>
            </div>
            <p className="text-sm font-medium text-gray-900">
              {attendance.checkOut ? formatTime(attendance.checkOut) : '--:--'}
            </p>
          </div>
        </div>

        {attendance.checkIn && attendance.checkOut && (
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-600">Work Hours:</span>
              </div>
              <p className="text-sm font-medium text-gray-900">
                {workHours.toFixed(2)}h
              </p>
            </div>
            {overtime > 0 && (
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <AlertCircle className="h-4 w-4 text-orange-400" />
                  <span className="text-sm text-gray-600">Overtime:</span>
                </div>
                <p className="text-sm font-medium text-orange-600">
                  {overtime.toFixed(2)}h
                </p>
              </div>
            )}
          </div>
        )}

        {showActions && (
          <div className="flex items-center justify-end space-x-2 pt-4 border-t border-gray-200">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setIsEditModalOpen(true)}
            >
              Edit
            </Button>
          </div>
        )}
      </motion.div>

      {/* Edit Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Attendance"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select
              value={editData.status}
              onChange={(e) => setEditData({ ...editData, status: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value={ATTENDANCE_STATUS.PRESENT}>Present</option>
              <option value={ATTENDANCE_STATUS.ABSENT}>Absent</option>
              <option value={ATTENDANCE_STATUS.LATE}>Late</option>
              <option value={ATTENDANCE_STATUS.ON_LEAVE}>On Leave</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Check In Time
            </label>
            <Input
              type="datetime-local"
              value={editData.checkIn}
              onChange={(e) => setEditData({ ...editData, checkIn: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Check Out Time
            </label>
            <Input
              type="datetime-local"
              value={editData.checkOut}
              onChange={(e) => setEditData({ ...editData, checkOut: e.target.value })}
            />
          </div>

          <div className="flex items-center justify-end space-x-3 pt-4">
            <Button
              variant="outline"
              onClick={() => setIsEditModalOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleSave}>
              Save Changes
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};

/**
 * CheckInOutCard Component
 * Quick check-in/out interface for current user
 */
export const CheckInOutCard = ({ employeeId, currentAttendance, onCheckIn, onCheckOut, loading }) => {
  const [isCheckingIn, setIsCheckingIn] = useState(false);
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  const handleCheckIn = async () => {
    setIsCheckingIn(true);
    try {
      await onCheckIn(employeeId, { timestamp: new Date().toISOString() });
    } finally {
      setIsCheckingIn(false);
    }
  };

  const handleCheckOut = async () => {
    setIsCheckingOut(true);
    try {
      await onCheckOut(employeeId, { timestamp: new Date().toISOString() });
    } finally {
      setIsCheckingOut(false);
    }
  };

  const isCheckedIn = currentAttendance?.checkIn && !currentAttendance?.checkOut;
  const isCheckedOut = currentAttendance?.checkOut;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl shadow-soft p-6 border border-gray-200"
    >
      <div className="text-center">
        <div className="mb-4">
          <Clock className="h-4 w-4 mx-auto text-blue-600 mb-2" />
          <h3 className="text-sm font-semibold text-gray-900">Today's Attendance</h3>
          <p className="text-sm text-gray-600">{formatDate(new Date())}</p>
        </div>

        <div className="space-y-3">
          {!isCheckedIn && !isCheckedOut && (
            <Button
              onClick={handleCheckIn}
              disabled={loading || isCheckingIn}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              {isCheckingIn ? 'Checking In...' : 'Check In'}
            </Button>
          )}

          {isCheckedIn && (
            <div className="space-y-3">
              <div className="p-3 bg-green-50 rounded-lg">
                <p className="text-sm text-green-800 font-medium">
                  Checked in at {formatTime(currentAttendance.checkIn)}
                </p>
              </div>
              <Button
                onClick={handleCheckOut}
                disabled={loading || isCheckingOut}
                className="w-full bg-red-600 hover:bg-red-700"
              >
                {isCheckingOut ? 'Checking Out...' : 'Check Out'}
              </Button>
            </div>
          )}

          {isCheckedOut && (
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-800 font-medium">
                Checked out at {formatTime(currentAttendance.checkOut)}
              </p>
              <p className="text-xs text-gray-600 mt-1">
                Work hours: {calculateWorkHours(currentAttendance.checkIn, currentAttendance.checkOut).toFixed(2)}h
              </p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

/**
 * AttendanceStatsCard Component
 * Displays attendance statistics
 */
export const AttendanceStatsCard = ({ title, value, icon: Icon, color = 'blue', trend = null }) => {
  const colorClasses = {
    blue: 'text-blue-600 bg-blue-50',
    green: 'text-green-600 bg-green-50',
    yellow: 'text-yellow-600 bg-yellow-50',
    red: 'text-red-600 bg-red-50',
    purple: 'text-purple-600 bg-purple-50',
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
          {trend && (
            <p className={`text-sm ${trend > 0 ? 'text-green-600' : trend < 0 ? 'text-red-600' : 'text-gray-600'}`}>
              {trend > 0 ? '+' : ''}{trend}% from last period
            </p>
          )}
        </div>
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </motion.div>
  );
};

export default {
  AttendanceCard,
  CheckInOutCard,
  AttendanceStatsCard,
};
