import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, Home, Phone, User } from 'lucide-react';

// UI Components
import { FormField } from '../../../../components/ui/FormField';
import { SelectField } from '../../../../components/ui/SelectField';

/**
 * Contact Information Section
 * Handles address, emergency contact, and notes
 */
const ContactInfoSection = ({ register, errors, watch }) => {
  const emergencyContact = watch('emergencyContact') || {};

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
    >
      <div className="flex items-center space-x-2 mb-6">
        <MapPin className="h-5 w-5 text-blue-600" />
        <h2 className="text-lg font-semibold text-gray-900">Contact Information</h2>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Address Information */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-gray-700 flex items-center space-x-2">
            <Home className="h-4 w-4" />
            <span>Address</span>
          </h3>
          
          <FormField
            label="Street Address"
            error={errors.address?.message}
            className="md:col-span-2"
          >
            <input
              {...register('address')}
              type="text"
              placeholder="Enter street address"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </FormField>

          <div className="grid gap-4 md:grid-cols-2">
            <FormField
              label="City"
              error={errors.city?.message}
            >
              <input
                {...register('city')}
                type="text"
                placeholder="Enter city"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </FormField>

            <FormField
              label="State/Province"
              error={errors.state?.message}
            >
              <input
                {...register('state')}
                type="text"
                placeholder="Enter state/province"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </FormField>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <FormField
              label="Postal Code"
              error={errors.postalCode?.message}
            >
              <input
                {...register('postalCode')}
                type="text"
                placeholder="Enter postal code"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </FormField>

            <FormField
              label="Country"
              error={errors.country?.message}
            >
              <input
                {...register('country')}
                type="text"
                placeholder="Enter country"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </FormField>
          </div>
        </div>

        {/* Emergency Contact & Notes */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-gray-700 flex items-center space-x-2">
            <Phone className="h-4 w-4" />
            <span>Emergency Contact</span>
          </h3>

          <FormField
            label="Contact Name"
            error={errors.emergencyContact?.name?.message}
          >
            <input
              {...register('emergencyContact.name')}
              type="text"
              placeholder="Enter emergency contact name"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </FormField>

          <FormField
            label="Relationship"
            error={errors.emergencyContact?.relationship?.message}
          >
            <SelectField
              {...register('emergencyContact.relationship')}
              placeholder="Select relationship"
              options={[
                { value: '', label: 'Select relationship' },
                { value: 'SPOUSE', label: 'Spouse' },
                { value: 'PARENT', label: 'Parent' },
                { value: 'SIBLING', label: 'Sibling' },
                { value: 'CHILD', label: 'Child' },
                { value: 'FRIEND', label: 'Friend' },
                { value: 'OTHER', label: 'Other' }
              ]}
            />
          </FormField>

          <FormField
            label="Contact Phone"
            error={errors.emergencyContact?.phone?.message}
          >
            <input
              {...register('emergencyContact.phone')}
              type="tel"
              placeholder="Enter emergency contact phone"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </FormField>

          <FormField
            label="Notes"
            error={errors.notes?.message}
            className="md:col-span-2"
          >
            <textarea
              {...register('notes')}
              rows={3}
              placeholder="Enter any additional notes about the employee"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
          </FormField>
        </div>
      </div>
    </motion.div>
  );
};

export default ContactInfoSection;
