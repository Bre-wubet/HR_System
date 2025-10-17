import React from 'react';
import { Calendar, Clock, CheckCircle, XCircle } from 'lucide-react';

/**
 * Interview Statistics Component
 * Displays key metrics for interview management
 */
const InterviewStatistics = ({ stats }) => {
  const statistics = [
    {
      label: 'Total Interviews',
      value: stats.total,
      icon: Calendar,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      label: 'Scheduled',
      value: stats.scheduled,
      icon: Clock,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
    },
    {
      label: 'Completed',
      value: stats.completed,
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      label: 'Cancelled',
      value: stats.cancelled,
      icon: XCircle,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      {statistics.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <div key={index} className="bg-white rounded-xl shadow-soft p-6">
            <div className="flex items-center space-x-3">
              <div className={`p-2 ${stat.bgColor} rounded-lg`}>
                <Icon className={`h-4 w-4 ${stat.color}`} />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-900">{stat.label}</h3>
                <p className={`text-xl font-bold ${stat.color}`}>{stat.value}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default InterviewStatistics;
