import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Edit, MoreVertical, Share2, Download } from 'lucide-react';
import { Button } from '../../../../../components/ui/Button';
import { cn } from '../../../../../lib/utils';

/**
 * Employee Detail Header Component
 * Displays employee name, title, and action buttons
 */
const EmployeeDetailHeader = ({ 
  employee, 
  onBack, 
  onEdit, 
  onShare, 
  onDownload,
  isLoading = false 
}) => {
  if (!employee) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center justify-between"
    >
      <div className="flex items-center space-x-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          disabled={isLoading}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Employees
        </Button>
        
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {employee.firstName} {employee.lastName}
          </h1>
          <p className="text-gray-600">
            {employee.jobTitle} • {employee.department?.name}
          </p>
        </div>
      </div>
      
      <div className="flex items-center space-x-3">
        <Button
          variant="outline"
          size="sm"
          onClick={onShare}
          disabled={isLoading}
        >
          <Share2 className="h-4 w-4 mr-2" />
          Share
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={onDownload}
          disabled={isLoading}
        >
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button>
        
        <Button
          size="sm"
          onClick={onEdit}
          disabled={isLoading}
        >
          <Edit className="h-4 w-4 mr-2" />
          Edit Employee
        </Button>
      </div>
    </motion.div>
  );
};

export default EmployeeDetailHeader;
