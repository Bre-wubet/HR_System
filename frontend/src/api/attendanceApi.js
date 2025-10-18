import apiClient from './axiosClient';

// Attendance API Service
export const attendanceApi = {
  // Basic Attendance Operations
  listAttendance: (params = {}) => {
    return apiClient.get('/hr/attendance', { params });
  },

  recordAttendance: (data) => {
    return apiClient.post('/hr/attendance', data);
  },

  updateAttendance: (id, data) => {
    return apiClient.put(`/hr/attendance/${id}`, data);
  },

  getAttendanceByEmployee: (employeeId, params = {}) => {
    return apiClient.get(`/hr/attendance/employee/${employeeId}`, { params });
  },

  // Digital Check-in/out Operations
  checkIn: (employeeId, data = {}) => {
    return apiClient.post(`/hr/attendance/employee/${employeeId}/check-in`, data);
  },

  checkOut: (employeeId, data = {}) => {
    return apiClient.post(`/hr/attendance/employee/${employeeId}/check-out`, data);
  },

  // Leave Management Operations
  createLeaveRequest: (data) => {
    return apiClient.post('/hr/attendance/leave', data);
  },

  updateLeaveStatus: (leaveId, data) => {
    return apiClient.put(`/hr/attendance/leave/${leaveId}/status`, data);
  },

  listLeaveRequests: (params = {}) => {
    return apiClient.get('/hr/attendance/leave', { params });
  },

  // Analytics Operations
  getAttendanceSummary: (params = {}) => {
    return apiClient.get('/hr/attendance/analytics/summary', { params });
  },

  getAbsenceAnalytics: (params = {}) => {
    return apiClient.get('/hr/attendance/analytics/absence', { params });
  },
};

// Attendance Constants
export const ATTENDANCE_STATUS = {
  PRESENT: 'PRESENT',
  ABSENT: 'ABSENT',
  LATE: 'LATE',
  ON_LEAVE: 'ON_LEAVE',
};

export const LEAVE_TYPE = {
  SICK: 'SICK',
  VACATION: 'VACATION',
  UNPAID: 'UNPAID',
  MATERNITY: 'MATERNITY',
  PATERNITY: 'PATERNITY',
  OTHER: 'OTHER',
};

export const LEAVE_STATUS = {
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
};

// Utility Functions
export const getAttendanceStatusColor = (status) => {
  const colors = {
    [ATTENDANCE_STATUS.PRESENT]: 'bg-green-100 text-green-800',
    [ATTENDANCE_STATUS.ABSENT]: 'bg-red-100 text-red-800',
    [ATTENDANCE_STATUS.LATE]: 'bg-yellow-100 text-yellow-800',
    [ATTENDANCE_STATUS.ON_LEAVE]: 'bg-blue-100 text-blue-800',
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
};

export const getLeaveTypeColor = (type) => {
  const colors = {
    [LEAVE_TYPE.SICK]: 'bg-red-100 text-red-800',
    [LEAVE_TYPE.VACATION]: 'bg-green-100 text-green-800',
    [LEAVE_TYPE.UNPAID]: 'bg-gray-100 text-gray-800',
    [LEAVE_TYPE.MATERNITY]: 'bg-pink-100 text-pink-800',
    [LEAVE_TYPE.PATERNITY]: 'bg-blue-100 text-blue-800',
    [LEAVE_TYPE.OTHER]: 'bg-purple-100 text-purple-800',
  };
  return colors[type] || 'bg-gray-100 text-gray-800';
};

export const getLeaveStatusColor = (status) => {
  const colors = {
    [LEAVE_STATUS.PENDING]: 'bg-yellow-100 text-yellow-800',
    [LEAVE_STATUS.APPROVED]: 'bg-green-100 text-green-800',
    [LEAVE_STATUS.REJECTED]: 'bg-red-100 text-red-800',
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
};

export const formatTime = (time) => {
  if (!time) return '--:--';
  return new Date(time).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
};

export const formatDate = (date) => {
  if (!date) return '--';
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export const formatDateTime = (date) => {
  if (!date) return '--';
  return new Date(date).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
};

export const calculateWorkHours = (checkIn, checkOut) => {
  if (!checkIn || !checkOut) return 0;
  const start = new Date(checkIn);
  const end = new Date(checkOut);
  const diffMs = end.getTime() - start.getTime();
  return Math.round((diffMs / (1000 * 60 * 60)) * 100) / 100; // Round to 2 decimal places
};

export const calculateOvertime = (workHours, standardHours = 8) => {
  return Math.max(0, workHours - standardHours);
};

export const isLate = (checkIn, expectedTime = '09:00') => {
  if (!checkIn) return false;
  const checkInTime = new Date(checkIn);
  const [hours, minutes] = expectedTime.split(':').map(Number);
  const expectedDateTime = new Date(checkInTime);
  expectedDateTime.setHours(hours, minutes, 0, 0);
  
  return checkInTime > expectedDateTime;
};

export const getDaysBetween = (startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end - start);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 to include both start and end days
};

export const isToday = (date) => {
  if (!date) return false;
  const today = new Date();
  const checkDate = new Date(date);
  return today.toDateString() === checkDate.toDateString();
};

export const isCurrentWeek = (date) => {
  if (!date) return false;
  const today = new Date();
  const checkDate = new Date(date);
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay());
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);
  
  return checkDate >= startOfWeek && checkDate <= endOfWeek;
};

export const isCurrentMonth = (date) => {
  if (!date) return false;
  const today = new Date();
  const checkDate = new Date(date);
  return today.getMonth() === checkDate.getMonth() && 
         today.getFullYear() === checkDate.getFullYear();
};

export default attendanceApi;
