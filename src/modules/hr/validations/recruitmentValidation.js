import Joi from "joi";

export const createJobSchema = Joi.object({
  body: Joi.object({
    title: Joi.string().min(3).required(),
    description: Joi.string().min(10).required(),
    departmentId: Joi.string().uuid().required(),
    isActive: Joi.boolean().optional(),
  }).required(),
});

export const createCandidateSchema = Joi.object({
  params: Joi.object({ id: Joi.string().uuid().required() }).required(),
  body: Joi.object({
    firstName: Joi.string().min(2).required(),
    lastName: Joi.string().min(2).required(),
    email: Joi.string().email().required(),
    phone: Joi.string().optional(),
    resumeUrl: Joi.string().uri().optional(),
  }).required(),
});


