import Joi from "joi";

export const createEmployeeSchema = Joi.object({
  body: Joi.object({
    firstName: Joi.string().min(2).required(),
    lastName: Joi.string().min(2).required(),
    email: Joi.string().email().required(),
    phone: Joi.string().optional(),
    gender: Joi.string().valid("MALE", "FEMALE", "OTHER").optional(),
    dob: Joi.date().optional(),
    jobType: Joi.string().valid("FULL_TIME", "PART_TIME", "CONTRACT", "INTERN").required(),
    jobTitle: Joi.string().required(),
    departmentId: Joi.string().uuid().required(),
    managerId: Joi.string().uuid().allow(null).optional(),
  }).required(),
});

export const updateEmployeeSchema = Joi.object({
  params: Joi.object({ id: Joi.string().uuid().required() }).required(),
  body: Joi.object({
    firstName: Joi.string().min(2).optional(),
    lastName: Joi.string().min(2).optional(),
    phone: Joi.string().optional(),
    gender: Joi.string().valid("MALE", "FEMALE", "OTHER").optional(),
    dob: Joi.date().optional(),
    status: Joi.string().valid("ACTIVE", "INACTIVE", "PROBATION", "TERMINATED", "RESIGNED").optional(),
    jobType: Joi.string().valid("FULL_TIME", "PART_TIME", "CONTRACT", "INTERN").optional(),
    jobTitle: Joi.string().optional(),
    departmentId: Joi.string().uuid().optional(),
    managerId: Joi.string().uuid().allow(null).optional(),
  })
    .min(1)
    .required(),
});

// Additional schemas
export const addSkillSchema = Joi.object({
  params: Joi.object({ id: Joi.string().uuid().required() }).required(),
  body: Joi.object({ skillId: Joi.string().uuid().required(), level: Joi.number().integer().min(1).max(5).required() }).required(),
});

export const updateSkillSchema = Joi.object({
  params: Joi.object({ id: Joi.string().uuid().required(), assignmentId: Joi.string().uuid().required() }).required(),
  body: Joi.object({ level: Joi.number().integer().min(1).max(5).required() }).required(),
});

export const addCertificationSchema = Joi.object({
  params: Joi.object({ id: Joi.string().uuid().required() }).required(),
  body: Joi.object({
    name: Joi.string().required(),
    issuer: Joi.string().optional(),
    issuedAt: Joi.date().required(),
    expiresAt: Joi.date().optional(),
  }).required(),
});

export const addDocumentSchema = Joi.object({
  params: Joi.object({ id: Joi.string().uuid().required() }).required(),
  body: Joi.object({ name: Joi.string().required(), fileUrl: Joi.string().uri().required() }).required(),
});

export const addEvaluationSchema = Joi.object({
  params: Joi.object({ id: Joi.string().uuid().required() }).required(),
  body: Joi.object({ evaluatorId: Joi.string().uuid().optional(), date: Joi.date().optional(), score: Joi.number().integer().min(1).max(10).required(), feedback: Joi.string().allow("").optional(), probation: Joi.boolean().optional() }).required(),
});

export const promotionSchema = Joi.object({
  params: Joi.object({ id: Joi.string().uuid().required() }).required(),
  body: Joi.object({ jobTitle: Joi.string().required() }).required(),
});

export const transferSchema = Joi.object({
  params: Joi.object({ id: Joi.string().uuid().required() }).required(),
  body: Joi.object({ departmentId: Joi.string().uuid().required(), managerId: Joi.string().uuid().allow(null).optional() }).required(),
});

export const startProbationSchema = Joi.object({
  params: Joi.object({ id: Joi.string().uuid().required() }).required(),
  body: Joi.object({ evaluatorId: Joi.string().uuid().optional(), score: Joi.number().integer().min(1).max(10).required(), feedback: Joi.string().allow("").optional() }).required(),
});

export const endProbationSchema = Joi.object({
  params: Joi.object({ id: Joi.string().uuid().required() }).required(),
  body: Joi.object({ status: Joi.string().valid("ACTIVE", "INACTIVE", "TERMINATED", "RESIGNED").optional(), evaluatorId: Joi.string().uuid().optional(), score: Joi.number().integer().min(1).max(10).optional(), feedback: Joi.string().allow("").optional() }).required(),
});

export const offboardSchema = Joi.object({
  params: Joi.object({ id: Joi.string().uuid().required() }).required(),
  body: Joi.object({ reason: Joi.string().allow("").optional(), approvedById: Joi.string().uuid().optional() }).required(),
});


