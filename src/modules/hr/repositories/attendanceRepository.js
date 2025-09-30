import { prisma } from "../../../config/db.js";
import { dateRange, startOfDay, endOfDay } from "../../../utils/dateUtils.js";

export function findAttendance({ employeeId, dateFrom, dateTo, status, take, skip } = {}) {
  const where = {
    AND: [
      employeeId ? { employeeId } : {},
      status ? { status } : {},
      dateFrom || dateTo ? { date: dateRange(dateFrom, dateTo) } : {},
    ],
  };
  return prisma.attendance.findMany({ where, take: Number(take) || 50, skip: Number(skip) || 0, orderBy: { date: "desc" } });
}

export function createAttendance(data) {
  return prisma.attendance.create({ data });
}

// Digital check-in/out with basic overtime calculation
export async function checkIn(employeeId, { timestamp }) {
  const now = timestamp ? new Date(timestamp) : new Date();
  const existing = await prisma.attendance.findFirst({ where: { employeeId, date: { gte: startOfDay(now), lte: endOfDay(now) } } });
  if (existing) {
    return prisma.attendance.update({ where: { id: existing.id }, data: { checkIn: now, status: "PRESENT" } });
  }
  return prisma.attendance.create({ data: { employeeId, date: now, checkIn: now, status: "PRESENT" } });
}

export async function checkOut(employeeId, { timestamp }) {
  const now = timestamp ? new Date(timestamp) : new Date();
  const today = await prisma.attendance.findFirst({ where: { employeeId, date: { gte: startOfDay(now), lte: endOfDay(now) } } });
  if (!today) throw new Error("No attendance record found for today");
  // naive overtime: anything beyond 8 hours
  let overtime = null;
  if (today.checkIn) {
    const diffMs = now.getTime() - new Date(today.checkIn).getTime();
    const hours = diffMs / 1000 / 60 / 60;
    overtime = Math.max(0, hours - 8);
  }
  return prisma.attendance.update({ where: { id: today.id }, data: { checkOut: now, overtime } });
}

// Leave management
export function createLeaveRequest({ employeeId, type, startDate, endDate }) {
  return prisma.leaveRequest.create({ data: { employeeId, type, startDate: new Date(startDate), endDate: new Date(endDate) } });
}

export function updateLeaveStatus(id, status, approvedById) {
  return prisma.leaveRequest.update({ where: { id }, data: { status, approvedById: approvedById || null } });
}

export function listLeaveRequests({ employeeId, status, from, to, take = 50, skip = 0 } = {}) {
  const where = {
    AND: [employeeId ? { employeeId } : {}, status ? { status } : {}, from || to ? { appliedAt: dateRange(from, to) } : {}],
  };
  return prisma.leaveRequest.findMany({ where, take, skip, orderBy: { appliedAt: "desc" } });
}

// Analytics
export async function getAttendanceSummary({ from, to, departmentId } = {}) {
  const where = { AND: [from || to ? { date: dateRange(from, to) } : {}] };
  const records = await prisma.attendance.findMany({ where, include: { employee: departmentId ? { select: { departmentId: true } } : false } });
  const total = records.length;
  const present = records.filter((r) => r.status === "PRESENT").length;
  const absent = records.filter((r) => r.status === "ABSENT").length;
  const late = records.filter((r) => r.status === "LATE").length;
  const onLeave = records.filter((r) => r.status === "ON_LEAVE").length;
  return { total, present, absent, late, onLeave };
}

export async function getAbsenceAnalytics({ from, to } = {}) {
  const where = { AND: [from || to ? { date: dateRange(from, to) } : {}] };
  const byEmployee = await prisma.attendance.groupBy({ by: ["employeeId"], where, _count: { _all: true } });
  return { byEmployee };
}


