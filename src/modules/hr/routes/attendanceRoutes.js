import { Router } from "express";
import * as controller from "../controllers/attendanceController.js";
import { 
  authenticateToken, 
  requirePermission, 
  requireAnyPermission,
  requireEmployeeAccess 
} from "../../../middlewares/authMiddleware.js";

const router = Router();

// Apply authentication to all routes
router.use(authenticateToken);

// Attendance records - require attendance permissions
router.get("/", requirePermission("attendance:read"), controller.listAttendance);
router.post("/", requirePermission("attendance:create"), controller.recordAttendance);
router.get("/employee/:employeeId", requireEmployeeAccess(), controller.listAttendanceByEmployee);

// Check-in/out endpoints - require attendance create permission or own data
router.post("/employee/:employeeId/check-in", requireAnyPermission(["attendance:create"]), requireEmployeeAccess(), controller.checkIn);
router.post("/employee/:employeeId/check-out", requireAnyPermission(["attendance:create"]), requireEmployeeAccess(), controller.checkOut);

// Leave requests - require attendance permissions
router.post("/leave", requirePermission("attendance:create"), controller.createLeaveRequest);
router.put("/leave/:id/status", requirePermission("attendance:update"), controller.updateLeaveStatus);
router.get("/leave", requirePermission("attendance:read"), controller.listLeaveRequests);

// Analytics - require attendance read permission
router.get("/analytics/summary", requirePermission("attendance:read"), controller.getAttendanceSummary);
router.get("/analytics/absence", requirePermission("attendance:read"), controller.getAbsenceAnalytics);

export default router;


