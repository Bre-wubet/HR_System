import React from 'react';
import { motion } from 'framer-motion';
import { XCircle } from 'lucide-react';

/**
 * AttendanceErrorState Component
 * Displays error messages
 */
export const AttendanceErrorState = ({ error }) => {
  if (!error) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-red-50 border border-red-200 rounded-lg p-4"
    >
      <div className="flex items-center">
        <div className="flex-shrink-0">
          <XCircle className="h-5 w-5 text-red-400" />
        </div>
        <div className="ml-3">
          <h3 className="text-sm font-medium text-red-800">Error loading attendance data</h3>
          <p className="text-sm text-red-700 mt-1">{error}</p>
        </div>
      </div>
    </motion.div>
  );
};

export default AttendanceErrorState;
