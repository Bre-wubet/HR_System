import * as service from "../services/attendanceService.js";
import { response } from "../../../utils/response.js";

export async function listAttendance(req, res, next) {
  try {
    const data = await service.listAttendance(req.query);
    res.json(response.success(data));
  } catch (err) {
    next(err);
  }
}

export async function listAttendanceByEmployee(req, res, next) {
  try {
    const data = await service.listAttendance({ employeeId: req.params.employeeId, ...req.query });
    res.json(response.success(data));
  } catch (err) {
    next(err);
  }
}

export async function recordAttendance(req, res, next) {
  try {
    const record = await service.recordAttendance(req.body);
    res.status(201).json(response.success(record));
  } catch (err) {
    next(err);
  }
}

// Check-in/out for digital/biometric readiness
export async function checkIn(req, res, next) {
  try {
    const record = await service.checkIn(req.params.employeeId, req.body);
    res.status(201).json(response.success(record));
  } catch (err) {
    next(err);
  }
}

export async function checkOut(req, res, next) {
  try {
    const record = await service.checkOut(req.params.employeeId, req.body);
    res.json(response.success(record));
  } catch (err) {
    next(err);
  }
}

// Leave management
export async function createLeaveRequest(req, res, next) {
  try {
    const created = await service.createLeaveRequest(req.body);
    res.status(201).json(response.success(created));
  } catch (err) {
    next(err);
  }
}

export async function updateLeaveStatus(req, res, next) {
  try {
    const updated = await service.updateLeaveStatus(req.params.id, req.body.status, req.body.approvedById);
    res.json(response.success(updated));
  } catch (err) {
    next(err);
  }
}

export async function listLeaveRequests(req, res, next) {
  try {
    const data = await service.listLeaveRequests(req.query);
    res.json(response.success(data));
  } catch (err) {
    next(err);
  }
}

// Analytics
export async function getAttendanceSummary(req, res, next) {
  try {
    const data = await service.getAttendanceSummary(req.query);
    res.json(response.success(data));
  } catch (err) {
    next(err);
  }
}

export async function getAbsenceAnalytics(req, res, next) {
  try {
    const data = await service.getAbsenceAnalytics(req.query);
    res.json(response.success(data));
  } catch (err) {
    next(err);
  }
}


