import React from 'react';
import { motion } from 'framer-motion';
import { FileText, Download, Briefcase, Users, Calendar } from 'lucide-react';
import { Button } from '../../components/ui/Button';

/**
 * RecruitmentReports Component
 * Reports dashboard for recruitment data
 */
const RecruitmentReports = () => {
  const reports = [
    {
      id: 1,
      title: 'Job Postings Summary',
      description: 'Summary of all active and closed job postings',
      icon: Briefcase,
      lastGenerated: '2024-01-15',
    },
    {
      id: 2,
      title: 'Candidate Pipeline',
      description: 'Current status of all candidates in the pipeline',
      icon: Users,
      lastGenerated: '2024-01-14',
    },
    {
      id: 3,
      title: 'Hiring Statistics',
      description: 'Analysis of hiring metrics and success rates',
      icon: Calendar,
      lastGenerated: '2024-01-13',
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Recruitment Reports</h1>
          <p className="text-gray-600">Generate and download recruitment reports</p>
        </div>
        <div className="flex items-center space-x-2">
          <FileText className="h-6 w-6 text-primary-600" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reports.map((report) => (
          <motion.div
            key={report.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-soft p-6 hover:shadow-medium transition-shadow"
          >
            <div className="flex items-start space-x-4">
              <div className="p-3 bg-purple-50 rounded-lg">
                <report.icon className="h-6 w-6 text-purple-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{report.title}</h3>
                <p className="text-gray-600 text-sm mb-4">{report.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">Last generated: {report.lastGenerated}</span>
                  <Button size="sm" variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Generate
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default RecruitmentReports;
