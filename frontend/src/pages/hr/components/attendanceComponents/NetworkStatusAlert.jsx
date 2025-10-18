import React from 'react';
import { motion } from 'framer-motion';
import { WifiOff } from 'lucide-react';

/**
 * NetworkStatusAlert Component
 * Shows offline status warning
 */
export const NetworkStatusAlert = ({ isOnline }) => {
  if (isOnline) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-yellow-50 border border-yellow-200 rounded-lg p-4"
    >
      <div className="flex items-center">
        <WifiOff className="h-5 w-5 text-yellow-600 mr-3" />
        <div>
          <h3 className="text-sm font-medium text-yellow-800">Offline Mode</h3>
          <p className="text-sm text-yellow-700">You're currently offline. Some features may be limited.</p>
        </div>
      </div>
    </motion.div>
  );
};

export default NetworkStatusAlert;
