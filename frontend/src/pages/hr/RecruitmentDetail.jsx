import React from 'react';
import { motion } from 'framer-motion';

const RecruitmentDetail = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Recruitment Detail</h1>
        <p className="text-gray-600">View job posting and candidate details</p>
      </div>
      
      <div className="bg-white rounded-xl shadow-soft p-6">
        <p className="text-gray-500">Recruitment detail page coming soon...</p>
      </div>
    </motion.div>
  );
};

export default RecruitmentDetail;
