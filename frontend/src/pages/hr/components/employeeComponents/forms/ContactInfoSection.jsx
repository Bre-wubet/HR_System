import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, Home, Phone, User } from 'lucide-react';

// UI Components
import { FormField } from '../../../../../components/ui/FormField';
import { SelectField } from '../../../../../components/ui/FormField';

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
            name="address"
            label="Street Address"
            placeholder="Enter street address"
            register={register}
            error={errors.address?.message}
            className="md:col-span-2"
          />

          <div className="grid gap-4 md:grid-cols-2">
            <FormField
              name="city"
              label="City"
              placeholder="Enter city"
              register={register}
              error={errors.city?.message}
            />

            <FormField
              name="state"
              label="State/Province"
              placeholder="Enter state/province"
              register={register}
              error={errors.state?.message}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <FormField
              name="postalCode"
              label="Postal Code"
              placeholder="Enter postal code"
              register={register}
              error={errors.postalCode?.message}
            />

            <FormField
              name="country"
              label="Country"
              placeholder="Enter country"
              register={register}
              error={errors.country?.message}
            />
          </div>
        </div>

        {/* Emergency Contact & Notes */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-gray-700 flex items-center space-x-2">
            <Phone className="h-4 w-4" />
            <span>Emergency Contact</span>
          </h3>

          <FormField
            name="emergencyContact.name"
            label="Contact Name"
            placeholder="Enter emergency contact name"
            register={register}
            error={errors.emergencyContact?.name?.message}
          />

          <SelectField
            name="emergencyContact.relationship"
            label="Relationship"
            placeholder="Select relationship"
            register={register}
            error={errors.emergencyContact?.relationship?.message}
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

          <FormField
            name="emergencyContact.phone"
            label="Contact Phone"
            placeholder="Enter emergency contact phone"
            type="tel"
            register={register}
            error={errors.emergencyContact?.phone?.message}
          />

          <FormField
            name="notes"
            label="Notes"
            placeholder="Enter any additional notes about the employee"
            type="textarea"
            rows={3}
            register={register}
            error={errors.notes?.message}
            className="md:col-span-2"
          />
        </div>
      </div>
    </motion.div>
  );
};

export default ContactInfoSection;
