import React from 'react';
import { motion } from 'framer-motion';
import { BarChart3, Briefcase, Users, TrendingUp, Clock } from 'lucide-react';

/**
 * RecruitmentAnalytics Component
 * Analytics dashboard for recruitment data
 */
const RecruitmentAnalytics = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Recruitment Analytics</h1>
          <p className="text-gray-600">Insights and trends for recruitment data</p>
        </div>
        <div className="flex items-center space-x-2">
          <BarChart3 className="h-6 w-6 text-primary-600" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-soft p-6">
          <div className="flex items-center space-x-3">
            <Briefcase className="h-8 w-8 text-blue-600" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Open Positions</h3>
              <p className="text-2xl font-bold text-blue-600">0</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-soft p-6">
          <div className="flex items-center space-x-3">
            <Users className="h-8 w-8 text-green-600" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Total Candidates</h3>
              <p className="text-2xl font-bold text-green-600">0</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-soft p-6">
          <div className="flex items-center space-x-3">
            <TrendingUp className="h-8 w-8 text-purple-600" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Hire Rate</h3>
              <p className="text-2xl font-bold text-purple-600">0%</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-soft p-6">
          <div className="flex items-center space-x-3">
            <Clock className="h-8 w-8 text-orange-600" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Avg. Time to Hire</h3>
              <p className="text-2xl font-bold text-orange-600">0 days</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-soft p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recruitment Pipeline</h3>
        <div className="text-center py-12">
          <BarChart3 className="h-12 w-12 mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500">Recruitment charts will be implemented here</p>
        </div>
      </div>
    </motion.div>
  );
};

export default RecruitmentAnalytics;
