import { Router } from "express";
import * as controller from "../controllers/attendanceController.js";

const router = Router();

router.get("/", controller.listAttendance);
router.post("/", controller.recordAttendance);
router.get("/employee/:employeeId", controller.listAttendanceByEmployee);

// Check-in/out endpoints
router.post("/employee/:employeeId/check-in", controller.checkIn);
router.post("/employee/:employeeId/check-out", controller.checkOut);

// Leave requests
router.post("/leave", controller.createLeaveRequest);
router.put("/leave/:id/status", controller.updateLeaveStatus);
router.get("/leave", controller.listLeaveRequests);

// Analytics
router.get("/analytics/summary", controller.getAttendanceSummary);
router.get("/analytics/absence", controller.getAbsenceAnalytics);

export default router;


