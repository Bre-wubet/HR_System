import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  FileText, Download, Briefcase, Users, Calendar, TrendingUp,
  RefreshCw, Filter, BarChart3, PieChart, Target, Clock,
  AlertCircle, CheckCircle, XCircle, UserPlus
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useReportsStore } from '../../stores/useReportsStore';
import useAuthStore from '../../stores/useAuthStore';

/**
 * RecruitmentReports Component
 * Comprehensive recruitment reports dashboard with real backend integration
 */
const RecruitmentReports = () => {
  const { user, permissions } = useAuthStore();
  const {
    recruitmentData,
    isLoading,
    errors,
    filters: storeFilters,
    fetchRecruitmentData,
    fetchRecruitmentKpis,
    exportReport,
    setFilters
  } = useReportsStore();

  const [filters, setLocalFilters] = useState({
    status: '',
    take: 100
  });
  const [dateRange, setDateRange] = useState({
    from: new Date(new Date().setMonth(new Date().getMonth() - 3)).toISOString().split('T')[0], // Last 3 months
    to: new Date().toISOString().split('T')[0] // Today
  });
  const [isExporting, setIsExporting] = useState(false);

  const hasRecruitmentPermission = permissions?.includes('recruitment:read');

  useEffect(() => {
    if (hasRecruitmentPermission) {
      loadRecruitmentData();
    }
  }, [hasRecruitmentPermission]);

  const loadRecruitmentData = async () => {
    try {
      const params = {
        take: filters.take,
        ...(filters.status && { status: filters.status }),
        ...(dateRange.from && { from: dateRange.from }),
        ...(dateRange.to && { to: dateRange.to })
      };

      await Promise.all([
        fetchRecruitmentData(params),
        fetchRecruitmentKpis(params)
      ]);
    } catch (error) {
      console.error('Error loading recruitment data:', error);
    }
  };

  const handleFilterChange = (field, value) => {
    const newFilters = { ...filters, [field]: value };
    setLocalFilters(newFilters);
    setFilters('recruitment', newFilters);
  };

  const handleDateRangeChange = (field, value) => {
    const newDateRange = { ...dateRange, [field]: value };
    setDateRange(newDateRange);
  };

  const handleExport = async (reportType) => {
    try {
      setIsExporting(true);
      const params = {
        take: filters.take,
        ...(filters.status && { status: filters.status }),
        ...(dateRange.from && { from: dateRange.from }),
        ...(dateRange.to && { to: dateRange.to })
      };

      const data = await exportReport(reportType, params);
      
      // Create and download file
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${reportType}-report-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting report:', error);
      alert('Failed to export report. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const reports = [
    {
      id: 'jobs',
      title: 'Job Postings Summary',
      description: 'Summary of all active and closed job postings',
      icon: Briefcase,
      data: recruitmentData?.jobPostings,
      loading: isLoading.recruitment,
      error: errors.recruitment
    },
    {
      id: 'candidates',
      title: 'Candidate Pipeline',
      description: 'Current status of all candidates in the pipeline',
      icon: Users,
      data: recruitmentData?.candidates,
      loading: isLoading.recruitment,
      error: errors.recruitment
    },
    {
      id: 'interviews',
      title: 'Interview Schedule',
      description: 'Upcoming and completed interview sessions',
      icon: Calendar,
      data: recruitmentData?.interviews,
      loading: isLoading.recruitment,
      error: errors.recruitment
    },
    {
      id: 'kpis',
      title: 'Recruitment KPIs',
      description: 'Key performance indicators and hiring metrics',
      icon: Target,
      data: recruitmentData?.kpis,
      loading: isLoading.recruitment,
      error: errors.recruitment
    }
  ];

  // Calculate recruitment statistics
  const recruitmentStats = recruitmentData ? {
    totalJobs: recruitmentData.jobPostings?.length || 0,
    activeJobs: recruitmentData.jobPostings?.filter(job => job.status === 'ACTIVE').length || 0,
    closedJobs: recruitmentData.jobPostings?.filter(job => job.status === 'CLOSED').length || 0,
    totalCandidates: recruitmentData.candidates?.length || 0,
    hiredCandidates: recruitmentData.candidates?.filter(candidate => candidate.stage === 'HIRED').length || 0,
    totalInterviews: recruitmentData.interviews?.length || 0
  } : null;

  // Calculate candidate stage distribution
  const candidateStages = recruitmentData?.candidates ? {
    applied: recruitmentData.candidates.filter(c => c.stage === 'APPLIED').length,
    screening: recruitmentData.candidates.filter(c => c.stage === 'SCREENING').length,
    interview: recruitmentData.candidates.filter(c => c.stage === 'INTERVIEW').length,
    offer: recruitmentData.candidates.filter(c => c.stage === 'OFFER').length,
    hired: recruitmentData.candidates.filter(c => c.stage === 'HIRED').length,
    rejected: recruitmentData.candidates.filter(c => c.stage === 'REJECTED').length
  } : null;

  if (!hasRecruitmentPermission) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Access Denied</h3>
          <p className="text-gray-600">You don't have permission to view recruitment reports.</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Recruitment Reports</h1>
          <p className="text-gray-600">Generate and download comprehensive recruitment reports</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            onClick={loadRecruitmentData}
            disabled={isLoading.recruitment}
            variant="outline"
            size="sm"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading.recruitment ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <FileText className="h-6 w-6 text-primary-600" />
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-soft p-6">
        <div className="flex items-center space-x-4 mb-4">
          <Filter className="h-5 w-5 text-gray-500" />
          <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Job Status</label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
            >
              <option value="">All Status</option>
              <option value="ACTIVE">Active</option>
              <option value="CLOSED">Closed</option>
              <option value="DRAFT">Draft</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">From Date</label>
            <Input
              type="date"
              value={dateRange.from}
              onChange={(e) => handleDateRangeChange('from', e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">To Date</label>
            <Input
              type="date"
              value={dateRange.to}
              onChange={(e) => handleDateRangeChange('to', e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      {recruitmentStats && (
        <div className="grid grid-cols-1 md:grid-cols-6 gap-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl shadow-soft p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Jobs</p>
                <p className="text-2xl font-bold text-gray-900">{recruitmentStats.totalJobs}</p>
              </div>
              <Briefcase className="h-8 w-8 text-blue-500" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl shadow-soft p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Jobs</p>
                <p className="text-2xl font-bold text-green-600">{recruitmentStats.activeJobs}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl shadow-soft p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Candidates</p>
                <p className="text-2xl font-bold text-purple-600">{recruitmentStats.totalCandidates}</p>
              </div>
              <Users className="h-8 w-8 text-purple-500" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl shadow-soft p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Hired</p>
                <p className="text-2xl font-bold text-green-600">{recruitmentStats.hiredCandidates}</p>
              </div>
              <UserPlus className="h-8 w-8 text-green-500" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl shadow-soft p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Interviews</p>
                <p className="text-2xl font-bold text-orange-600">{recruitmentStats.totalInterviews}</p>
              </div>
              <Calendar className="h-8 w-8 text-orange-500" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl shadow-soft p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Hire Rate</p>
                <p className="text-2xl font-bold text-blue-600">
                  {recruitmentStats.totalCandidates > 0 
                    ? Math.round((recruitmentStats.hiredCandidates / recruitmentStats.totalCandidates) * 100)
                    : 0}%
                </p>
              </div>
              <Target className="h-8 w-8 text-blue-500" />
            </div>
          </motion.div>
        </div>
      )}

      {/* Reports Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {reports.map((report, index) => (
          <motion.div
            key={report.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-xl shadow-soft p-6 hover:shadow-medium transition-shadow"
          >
            <div className="flex items-start space-x-4">
              <div className="p-3 bg-purple-50 rounded-lg">
                <report.icon className="h-6 w-6 text-purple-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{report.title}</h3>
                <p className="text-gray-600 text-sm mb-4">{report.description}</p>
                
                {report.loading && (
                  <div className="flex items-center text-sm text-gray-500 mb-4">
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Loading...
                  </div>
                )}

                {report.error && (
                  <div className="flex items-center text-sm text-red-500 mb-4">
                    <AlertCircle className="h-4 w-4 mr-2" />
                    {report.error}
                  </div>
                )}

                {report.data && !report.loading && !report.error && (
                  <div className="text-sm text-gray-500 mb-4">
                    {report.id === 'jobs' && `${report.data.length || 0} job postings`}
                    {report.id === 'candidates' && `${report.data.length || 0} candidates`}
                    {report.id === 'interviews' && `${report.data.length || 0} interviews`}
                    {report.id === 'kpis' && `KPI data available`}
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">
                    Last updated: {new Date().toLocaleDateString()}
                  </span>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handleExport(report.id)}
                    disabled={isExporting || report.loading || report.error}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    {isExporting ? 'Exporting...' : 'Export'}
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Candidate Pipeline Preview */}
      {candidateStages && (
        <div className="bg-white rounded-xl shadow-soft p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Candidate Pipeline</h3>
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <p className="text-2xl font-bold text-blue-600">{candidateStages.applied}</p>
              <p className="text-sm text-gray-600">Applied</p>
            </div>
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <p className="text-2xl font-bold text-yellow-600">{candidateStages.screening}</p>
              <p className="text-sm text-gray-600">Screening</p>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <p className="text-2xl font-bold text-orange-600">{candidateStages.interview}</p>
              <p className="text-sm text-gray-600">Interview</p>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <p className="text-2xl font-bold text-purple-600">{candidateStages.offer}</p>
              <p className="text-sm text-gray-600">Offer</p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <p className="text-2xl font-bold text-green-600">{candidateStages.hired}</p>
              <p className="text-sm text-gray-600">Hired</p>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <p className="text-2xl font-bold text-red-600">{candidateStages.rejected}</p>
              <p className="text-sm text-gray-600">Rejected</p>
            </div>
          </div>
        </div>
      )}

      {/* KPIs Preview */}
      {recruitmentData?.kpis && (
        <div className="bg-white rounded-xl shadow-soft p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recruitment KPIs</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <p className="text-2xl font-bold text-blue-600">{recruitmentData.kpis.totals?.jobs || 0}</p>
              <p className="text-sm text-gray-600">Total Jobs</p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <p className="text-2xl font-bold text-green-600">{recruitmentData.kpis.totals?.candidates || 0}</p>
              <p className="text-sm text-gray-600">Total Candidates</p>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <p className="text-2xl font-bold text-purple-600">{recruitmentData.kpis.totals?.hired || 0}</p>
              <p className="text-sm text-gray-600">Hired</p>
            </div>
          </div>
          {recruitmentData.kpis.metrics && (
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-lg font-bold text-gray-900">{recruitmentData.kpis.metrics.timeToHire || 0} days</p>
                <p className="text-sm text-gray-600">Average Time to Hire</p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-lg font-bold text-gray-900">${recruitmentData.kpis.metrics.costPerHire || 0}</p>
                <p className="text-sm text-gray-600">Cost per Hire</p>
              </div>
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
};

export default RecruitmentReports;
