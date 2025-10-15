import React from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Phone, Calendar } from 'lucide-react';
import { FormField } from '../../../../../components/ui/FormField';
import { SelectField } from '../../../../../components/ui/FormField';

/**
 * Personal Information Section Component
 * Handles personal details form fields
 */
const PersonalInfoSection = ({ register, errors, watch }) => {
  const watchedValues = watch();

  const personalFields = [
    {
      name: 'firstName',
      label: 'First Name',
      placeholder: 'Enter first name',
      icon: User,
      required: true,
      validation: {
        minLength: { value: 2, message: 'First name must be at least 2 characters' }
      }
    },
    {
      name: 'lastName',
      label: 'Last Name',
      placeholder: 'Enter last name',
      icon: User,
      required: true,
      validation: {
        minLength: { value: 2, message: 'Last name must be at least 2 characters' }
      }
    },
    {
      name: 'email',
      label: 'Email Address',
      placeholder: 'Enter email address',
      icon: Mail,
      type: 'email',
      required: true,
      validation: {
        pattern: {
          value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
          message: 'Please enter a valid email address'
        }
      }
    },
    {
      name: 'phone',
      label: 'Phone Number',
      placeholder: 'Enter phone number',
      icon: Phone,
      type: 'tel',
      validation: {
        pattern: {
          value: /^[\+]?[1-9][\d]{0,15}$/,
          message: 'Please enter a valid phone number'
        }
      }
    },
    {
      name: 'gender',
      label: 'Gender',
      type: 'select',
      options: [
        { value: '', label: 'Select gender' },
        { value: 'MALE', label: 'Male' },
        { value: 'FEMALE', label: 'Female' },
        { value: 'OTHER', label: 'Other' }
      ]
    },
    {
      name: 'dob',
      label: 'Date of Birth',
      type: 'date',
      icon: Calendar,
      validation: {
        validate: (value) => {
          if (!value) return true;
          const today = new Date();
          const birthDate = new Date(value);
          const age = today.getFullYear() - birthDate.getFullYear();
          return age >= 16 || 'Employee must be at least 16 years old';
        }
      }
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl shadow-soft p-6"
    >
      <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
        <User className="h-5 w-5 mr-2 text-blue-600" />
        Personal Information
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {personalFields.map((field) => (
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

export default PersonalInfoSection;
