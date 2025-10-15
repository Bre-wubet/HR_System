import React from 'react';
import { motion } from 'framer-motion';
import { Building, DollarSign, Users } from 'lucide-react';
import { FormField } from '../../../../../components/ui/FormField';
import { SelectField } from '../../../../../components/ui/FormField';

/**
 * Employment Information Section Component
 * Handles employment-related form fields
 */
const EmploymentInfoSection = ({ 
  register, 
  errors, 
  departments = [], 
  managers = [], 
  isEdit = false 
}) => {
  const employmentFields = [
    {
      name: 'jobTitle',
      label: 'Job Title',
      placeholder: 'Enter job title',
      required: true,
      validation: {
        minLength: { value: 1, message: 'Job title is required' }
      }
    },
    {
      name: 'jobType',
      label: 'Job Type',
      type: 'select',
      required: true,
      options: [
        { value: 'FULL_TIME', label: 'Full Time' },
        { value: 'PART_TIME', label: 'Part Time' },
        { value: 'CONTRACT', label: 'Contract' },
        { value: 'INTERN', label: 'Intern' }
      ]
    },
    {
      name: 'departmentId',
      label: 'Department',
      type: 'select',
      required: true,
      options: [
        { value: '', label: 'Select department' },
        ...departments.map(dept => ({
          value: dept.id,
          label: dept.name
        }))
      ]
    },
    {
      name: 'managerId',
      label: 'Manager',
      type: 'select',
      options: [
        { value: '', label: 'Select manager' },
        ...managers.map(manager => ({
          value: manager.id,
          label: `${manager.firstName} ${manager.lastName} - ${manager.jobTitle}`
        }))
      ]
    },
    {
      name: 'salary',
      label: 'Salary',
      placeholder: 'Enter salary',
      type: 'number',
      icon: DollarSign,
      validation: {
        min: { value: 0, message: 'Salary must be positive' },
        validate: (value) => {
          if (!value) return true;
          return !isNaN(Number(value)) || 'Please enter a valid number';
        }
      }
    }
  ];

  // Add employment status field for edit mode
  if (isEdit) {
    employmentFields.push({
      name: 'status',
      label: 'Employment Status',
      type: 'select',
      options: [
        { value: 'ACTIVE', label: 'Active' },
        { value: 'INACTIVE', label: 'Inactive' },
        { value: 'PROBATION', label: 'Probation' },
        { value: 'TERMINATED', label: 'Terminated' },
        { value: 'RESIGNED', label: 'Resigned' }
      ]
    });
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="bg-white rounded-xl shadow-soft p-6"
    >
      <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
        <Building className="h-5 w-5 mr-2 text-blue-600" />
        Employment Information
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {employmentFields.map((field) => (
          <div key={field.name}>
            {field.type === 'select' ? (
              <SelectField
                {...field}
                register={register}
                error={errors[field.name]?.message}
              />
            ) : (
              <FormField
                {...field}
                register={register}
                error={errors[field.name]?.message}
              />
            )}
          </div>
        ))}
      </div>
    </motion.div>
  );
};

export default EmploymentInfoSection;
