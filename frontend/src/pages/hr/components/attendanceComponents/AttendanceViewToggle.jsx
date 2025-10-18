import React from 'react';
import { motion } from 'framer-motion';
import { List, Grid, PieChart } from 'lucide-react';
import { Button } from '../../../../components/ui/Button';

/**
 * AttendanceViewToggle Component
 * Toggle between different view modes
 */
export const AttendanceViewToggle = ({ 
  viewMode, 
  onViewModeChange, 
  attendanceCount 
}) => {
  const viewModes = [
    { key: 'table', label: 'Table', icon: List },
    { key: 'calendar', label: 'Calendar', icon: Grid },
    { key: 'analytics', label: 'Analytics', icon: PieChart }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center justify-between"
    >
      <div className="flex items-center space-x-2">
        <h2 className="text-lg font-semibold text-gray-900">Attendance Records</h2>
        <span className="text-sm text-gray-500">
          ({attendanceCount} records)
        </span>
      </div>
      <div className="flex items-center space-x-2">
        {viewModes.map(({ key, label, icon: Icon }) => (
          <Button
            key={key}
            variant={viewMode === key ? 'default' : 'outline'}
            size="sm"
            onClick={() => onViewModeChange(key)}
          >
            <Icon className="h-4 w-4 mr-2" />
            {label}
          </Button>
        ))}
      </div>
    </motion.div>
  );
};

export default AttendanceViewToggle;
