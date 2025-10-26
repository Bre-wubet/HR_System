import { Router } from "express";
import * as controller from "../controllers/attendanceController.js";
import { 
  authenticateToken, 
  requirePermission, 
  requireAnyPermission,
  requireEmployeeAccess,
  requireOwnLeaveAccess 
} from "../../../middlewares/authMiddleware.js";
import { validate } from "../../../middlewares/validationMiddleware.js";
import * as v from "../validations/attendanceValidation.js";

const router = Router();

// Apply authentication to all routes
router.use(authenticateToken);

// Attendance records - require attendance permissions
router.get("/", requirePermission("attendance:read"), validate(v.listAttendanceSchema), controller.listAttendance);
router.post("/", requirePermission("attendance:create"), validate(v.recordAttendanceSchema), controller.recordAttendance);
router.put("/:id", requirePermission("attendance:update"), validate(v.updateAttendanceSchema), controller.updateAttendance);
router.get("/employee/:employeeId", requireEmployeeAccess(), validate(v.listAttendanceByEmployeeSchema), controller.listAttendanceByEmployee);

// Check-in/out endpoints - allow employees to check-in/out for themselves or require attendance create permission
router.post("/employee/:employeeId/check-in", requireEmployeeAccess(), validate(v.checkInSchema), controller.checkIn);
router.post("/employee/:employeeId/check-out", requireEmployeeAccess(), validate(v.checkOutSchema), controller.checkOut);

// Leave requests - allow employees to create leave requests for themselves or require attendance create permission
router.post("/leave", requireOwnLeaveAccess(), validate(v.createLeaveSchema), controller.createLeaveRequest);
router.put("/leave/:id/status", requireAnyPermission(["admin:manage_users", "admin:manage_system"]), validate(v.updateLeaveStatusSchema), controller.updateLeaveStatus);
router.get("/leave", requirePermission("attendance:read"), validate(v.listLeaveRequestsSchema), controller.listLeaveRequests);

// Analytics - require attendance read permission
router.get("/analytics/summary", requirePermission("attendance:read"), validate(v.attendanceSummarySchema), controller.getAttendanceSummary);
router.get("/analytics/absence", requirePermission("attendance:read"), validate(v.absenceAnalyticsSchema), controller.getAbsenceAnalytics);

export default router;


