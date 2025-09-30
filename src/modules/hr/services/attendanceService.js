import * as repo from "../repositories/attendanceRepository.js";

export function listAttendance(query) {
  return repo.findAttendance(query);
}

export function recordAttendance(data) {
  return repo.createAttendance(data);
}

export function checkIn(employeeId, data) {
  return repo.checkIn(employeeId, data);
}

export function checkOut(employeeId, data) {
  return repo.checkOut(employeeId, data);
}

// Leave
export function createLeaveRequest(data) {
  return repo.createLeaveRequest(data);
}

export function updateLeaveStatus(id, status, approvedById) {
  return repo.updateLeaveStatus(id, status, approvedById);
}

export function listLeaveRequests(query) {
  return repo.listLeaveRequests(query);
}

// Analytics
export function getAttendanceSummary(query) {
  return repo.getAttendanceSummary(query);
}

export function getAbsenceAnalytics(query) {
  return repo.getAbsenceAnalytics(query);
}


