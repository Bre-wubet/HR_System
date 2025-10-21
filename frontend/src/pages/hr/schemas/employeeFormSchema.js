import { z } from 'zod';

/**
 * Employee Form Validation Schema
 * Comprehensive validation rules for employee form fields
 */

// Personal Information Schema
export const personalInfoSchema = z.object({
  firstName: z.string()
    .min(2, 'First name must be at least 2 characters')
    .max(50, 'First name must be less than 50 characters')
    .regex(/^[a-zA-Z\s]+$/, 'First name can only contain letters and spaces'),
  
  lastName: z.string()
    .min(2, 'Last name must be at least 2 characters')
    .max(50, 'Last name must be less than 50 characters')
    .regex(/^[a-zA-Z\s]+$/, 'Last name can only contain letters and spaces'),
  
  email: z.string()
    .email('Please enter a valid email address')
    .min(5, 'Email must be at least 5 characters')
    .max(100, 'Email must be less than 100 characters'),
  
  phone: z.string()
    .optional()
    .refine((val) => !val || /^[\+]?[1-9][\d]{0,15}$/.test(val), {
      message: 'Please enter a valid phone number'
    }),
  
  gender: z.enum(['MALE', 'FEMALE', 'OTHER'], {
    errorMap: () => ({ message: 'Please select a valid gender' })
  }).optional(),
  
  dob: z.string()
    .optional()
    .refine((val) => {
      if (!val) return true;
      const today = new Date();
      const birthDate = new Date(val);
      const age = today.getFullYear() - birthDate.getFullYear();
      return age >= 16 && age <= 100;
    }, {
      message: 'Employee must be between 16 and 100 years old'
    })
});

// Employment Information Schema
export const employmentInfoSchema = z.object({
  jobTitle: z.string()
    .min(1, 'Job title is required')
    .max(100, 'Job title must be less than 100 characters'),
  
  jobType: z.enum(['FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERN'], {
    errorMap: () => ({ message: 'Please select a valid job type' })
  }),
  
  departmentId: z.string()
    .min(1, 'Department is required'),
  
  managerId: z.string()
    .optional(),
  
  salary: z.number()
    .positive('Salary must be a positive number')
    .max(10000000, 'Salary seems too high')
    .optional()
    .or(z.string().optional().transform((val) => val ? Number(val) : undefined)),
  
  payFrequency: z.string()
    .optional(),
  
  benefitsPackage: z.string()
    .optional(),
  
  status: z.enum(['ACTIVE', 'INACTIVE', 'PROBATION', 'TERMINATED', 'RESIGNED'], {
    errorMap: () => ({ message: 'Please select a valid employment status' })
  }).optional()
});

// Contact Information Schema
export const contactInfoSchema = z.object({
  address: z.string()
    .optional(),
  
  city: z.string()
    .optional(),
  
  state: z.string()
    .optional(),
  
  postalCode: z.string()
    .optional(),
  
  country: z.string()
    .optional(),
  
  emergencyContact: z.object({
    name: z.string().min(1, 'Emergency contact name is required'),
    relationship: z.string().min(1, 'Relationship is required'),
    phone: z.string().min(1, 'Emergency contact phone is required')
  }).optional(),
  
  notes: z.string()
    .optional()
});

// Complete Employee Schema
export const employeeSchema = personalInfoSchema.merge(employmentInfoSchema).merge(contactInfoSchema);

// Form Default Values
export const defaultFormValues = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  gender: '',
  dob: '',
  jobTitle: '',
  jobType: 'FULL_TIME',
  departmentId: '',
  managerId: '',
  salary: '',
  payFrequency: '',
  benefitsPackage: '',
  address: '',
  city: '',
  state: '',
  postalCode: '',
  country: '',
  emergencyContact: {
    name: '',
    relationship: '',
    phone: ''
  },
  notes: '',
  status: 'ACTIVE'
};

// Field Validation Rules
export const fieldValidationRules = {
  firstName: {
    required: true,
    minLength: 2,
    maxLength: 50,
    pattern: /^[a-zA-Z\s]+$/
  },
  lastName: {
    required: true,
    minLength: 2,
    maxLength: 50,
    pattern: /^[a-zA-Z\s]+$/
  },
  email: {
    required: true,
    type: 'email',
    minLength: 5,
    maxLength: 100
  },
  phone: {
    required: false,
    pattern: /^[\+]?[1-9][\d]{0,15}$/
  },
  jobTitle: {
    required: true,
    minLength: 1,
    maxLength: 100
  },
  jobType: {
    required: true,
    options: ['FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERN']
  },
  departmentId: {
    required: true
  },
  managerId: {
    required: false
  },
  salary: {
    required: false,
    type: 'number',
    min: 0,
    max: 10000000
  },
  status: {
    required: false,
    options: ['ACTIVE', 'INACTIVE', 'PROBATION', 'TERMINATED', 'RESIGNED']
  }
};

// Validation Messages
export const validationMessages = {
  required: 'This field is required',
  email: 'Please enter a valid email address',
  phone: 'Please enter a valid phone number',
  minLength: (min) => `Must be at least ${min} characters`,
  maxLength: (max) => `Must be less than ${max} characters`,
  min: (min) => `Must be at least ${min}`,
  max: (max) => `Must be less than ${max}`,
  pattern: 'Please enter a valid format',
  age: 'Employee must be between 16 and 100 years old'
};

export default employeeSchema;
