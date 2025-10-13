import Joi from "joi";

export const listAttendanceSchema = Joi.object({
  query: Joi.object({
    employeeId: Joi.string().uuid().optional(),
    dateFrom: Joi.date().optional(),
    dateTo: Joi.date().optional(),
    status: Joi.string().valid("PRESENT", "ABSENT", "LATE", "ON_LEAVE").optional(),
    take: Joi.number().integer().min(1).max(200).optional(),
    skip: Joi.number().integer().min(0).optional(),
  }).required(),
});

export const listAttendanceByEmployeeSchema = Joi.object({
  params: Joi.object({ employeeId: Joi.string().uuid().required() }).required(),
  query: Joi.object({
    dateFrom: Joi.date().optional(),
    dateTo: Joi.date().optional(),
    status: Joi.string().valid("PRESENT", "ABSENT", "LATE", "ON_LEAVE").optional(),
    take: Joi.number().integer().min(1).max(200).optional(),
    skip: Joi.number().integer().min(0).optional(),
  }).required(),
});

export const recordAttendanceSchema = Joi.object({
  body: Joi.object({
    employeeId: Joi.string().uuid().required(),
    date: Joi.date().required(),
    status: Joi.string().valid("PRESENT", "ABSENT", "LATE", "ON_LEAVE").required(),
    checkIn: Joi.date().optional(),
    checkOut: Joi.date().optional(),
  }).required(),
});

export const checkInSchema = Joi.object({
  params: Joi.object({ employeeId: Joi.string().uuid().required() }).required(),
  body: Joi.object({ timestamp: Joi.date().optional() }).required(),
});

export const checkOutSchema = Joi.object({
  params: Joi.object({ employeeId: Joi.string().uuid().required() }).required(),
  body: Joi.object({ timestamp: Joi.date().optional() }).required(),
});

export const createLeaveSchema = Joi.object({
  body: Joi.object({
    employeeId: Joi.string().uuid().required(),
    type: Joi.string().valid("SICK", "VACATION", "UNPAID", "MATERNITY", "PATERNITY", "OTHER").required(),
    startDate: Joi.date().required(),
    endDate: Joi.date().required(),
  }).required(),
});

export const updateLeaveStatusSchema = Joi.object({
  params: Joi.object({ id: Joi.string().uuid().required() }).required(),
  body: Joi.object({
    status: Joi.string().valid("PENDING", "APPROVED", "REJECTED").required(),
    approvedById: Joi.string().uuid().optional(),
  }).required(),
});

export const listLeaveRequestsSchema = Joi.object({
  query: Joi.object({
    employeeId: Joi.string().uuid().optional(),
    status: Joi.string().valid("PENDING", "APPROVED", "REJECTED").optional(),
    from: Joi.date().optional(),
    to: Joi.date().optional(),
    take: Joi.number().integer().min(1).max(200).optional(),
    skip: Joi.number().integer().min(0).optional(),
  }).required(),
});

export const attendanceSummarySchema = Joi.object({
  query: Joi.object({
    from: Joi.date().optional(),
    to: Joi.date().optional(),
    departmentId: Joi.string().uuid().optional(),
  }).required(),
});

export const absenceAnalyticsSchema = Joi.object({
  query: Joi.object({
    from: Joi.date().optional(),
    to: Joi.date().optional(),
  }).required(),
});


