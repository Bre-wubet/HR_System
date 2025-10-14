import React from 'react';
import { motion } from 'framer-motion';

const RecruitmentList = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Recruitment</h1>
        <p className="text-gray-600">Manage job postings and candidate applications</p>
      </div>
      
      <div className="bg-white rounded-xl shadow-soft p-6">
        <p className="text-gray-500">Recruitment list page coming soon...</p>
      </div>
    </motion.div>
  );
};

export default RecruitmentList;
