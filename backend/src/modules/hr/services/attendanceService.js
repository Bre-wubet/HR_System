import * as repo from "../repositories/attendanceRepository.js";
import * as employeeRepo from "../repositories/employeeRepository.js";

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

// Guards aligned with employee and recruitment modules
export async function recordAttendanceWithGuards(payload) {
  const employee = await employeeRepo.findById(payload.employeeId);
  if (!employee) {
    const error = new Error(`Employee with ID ${payload.employeeId} not found`);
    error.statusCode = 404;
    error.code = 'EMPLOYEE_NOT_FOUND';
    throw error;
  }
  if (employee.status === 'TERMINATED' || employee.status === 'INACTIVE') {
    const error = new Error(`Cannot record attendance for ${employee.status} employee`);
    error.statusCode = 400;
    error.code = 'EMPLOYEE_INACTIVE';
    throw error;
  }
  return repo.createAttendance(payload);
}

export async function checkInWithGuards(employeeId, data) {
  const employee = await employeeRepo.findById(employeeId);
  if (!employee) {
    const error = new Error(`Employee with ID ${employeeId} not found`);
    error.statusCode = 404;
    error.code = 'EMPLOYEE_NOT_FOUND';
    throw error;
  }
  if (employee.status === 'TERMINATED' || employee.status === 'INACTIVE') {
    const error = new Error(`Cannot check in ${employee.status} employee`);
    error.statusCode = 400;
    error.code = 'EMPLOYEE_INACTIVE';
    throw error;
  }
  return repo.checkIn(employeeId, data);
}

export async function checkOutWithGuards(employeeId, data) {
  const employee = await employeeRepo.findById(employeeId);
  if (!employee) {
    const error = new Error(`Employee with ID ${employeeId} not found`);
    error.statusCode = 404;
    error.code = 'EMPLOYEE_NOT_FOUND';
    throw error;
  }
  return repo.checkOut(employeeId, data);
}

export async function createLeaveRequestWithGuards(payload) {
  const employee = await employeeRepo.findById(payload.employeeId);
  if (!employee) {
    const error = new Error(`Employee with ID ${payload.employeeId} not found`);
    error.statusCode = 404;
    error.code = 'EMPLOYEE_NOT_FOUND';
    throw error;
  }
  if (payload.startDate > payload.endDate) {
    const error = new Error('startDate must be before endDate');
    error.statusCode = 400;
    error.code = 'INVALID_DATE_RANGE';
    throw error;
  }
  return repo.createLeaveRequest(payload);
}

export async function updateLeaveStatusWithGuards(id, status, approvedById) {
  if (status === 'APPROVED' && !approvedById) {
    const error = new Error('approvedById is required to approve');
    error.statusCode = 400;
    error.code = 'APPROVER_REQUIRED';
    throw error;
  }
  if (approvedById) {
    const approver = await employeeRepo.findById(approvedById);
    if (!approver) {
      const error = new Error(`Approver with ID ${approvedById} not found`);
      error.statusCode = 404;
      error.code = 'APPROVER_NOT_FOUND';
      throw error;
    }
  }
  return repo.updateLeaveStatus(id, status, approvedById);
}


