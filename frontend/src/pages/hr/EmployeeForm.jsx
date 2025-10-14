import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { 
  User, 
  Mail, 
  Phone, 
  Calendar, 
  MapPin, 
  Building, 
  Users, 
  DollarSign,
  Save,
  ArrowLeft,
  Upload,
  FileText,
  AlertCircle
} from 'lucide-react';

import useEmployeeStore from '../../stores/useEmployeeStore';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { 
  EMPLOYMENT_STATUS, 
  JOB_TYPE, 
  GENDER,
  getEmploymentStatusColor,
  getJobTypeColor,
  formatDate 
} from '../../api/employeeApi';

// Validation Schema
const employeeSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().optional(),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER']).optional(),
  dob: z.string().optional(),
  jobType: z.enum(['FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERN']),
  jobTitle: z.string().min(1, 'Job title is required'),
  departmentId: z.string().min(1, 'Department is required'),
  managerId: z.string().optional(),
  salary: z.number().positive().optional(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'PROBATION', 'TERMINATED', 'RESIGNED']).optional(),
});

const EmployeeForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  
  const {
    selectedEmployee,
    departments,
    managers,
    isLoading,
    fetchDepartments,
    fetchManagers,
    getEmployeeById,
    createEmployee,
    updateEmployee,
  } = useEmployeeStore();

  const [showSkillsModal, setShowSkillsModal] = useState(false);
  const [showCertificationsModal, setShowCertificationsModal] = useState(false);
  const [showDocumentsModal, setShowDocumentsModal] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm({
    resolver: zodResolver(employeeSchema),
    defaultValues: {
      jobType: 'FULL_TIME',
      status: 'ACTIVE',
    },
  });

  const watchedValues = watch();

  // Load data on component mount
  useEffect(() => {
    const loadData = async () => {
      await Promise.all([
        fetchDepartments(),
        fetchManagers(),
      ]);

      if (isEdit && id) {
        const result = await getEmployeeById(id);
        if (result.success) {
          const employee = result.data;
          reset({
            firstName: employee.firstName,
            lastName: employee.lastName,
            email: employee.email,
            phone: employee.phone || '',
            gender: employee.gender || '',
            dob: employee.dob ? employee.dob.split('T')[0] : '',
            jobType: employee.jobType,
            jobTitle: employee.jobTitle,
            departmentId: employee.departmentId,
            managerId: employee.managerId || '',
            salary: employee.salary || '',
            status: employee.status,
          });
        }
      }
    };

    loadData();
  }, [id, isEdit, fetchDepartments, fetchManagers, getEmployeeById, reset]);

  const onSubmit = async (data) => {
    console.log('Form data before processing:', data);
    
    // Convert salary to number if provided
    if (data.salary) {
      data.salary = Number(data.salary);
    }

    // Convert empty strings to null for optional fields
    Object.keys(data).forEach(key => {
      if (data[key] === '') {
        data[key] = null;
      }
    });

    console.log('Form data after processing:', data);

    if (isEdit) {
      const result = await updateEmployee(id, data);
      if (result.success) {
        navigate(`/employees/${id}`);
      }
    } else {
      const result = await createEmployee(data);
      if (result.success) {
        navigate('/employees');
      }
    }
  };

  const handleFileUpload = (event) => {
    const files = Array.from(event.target.files);
    const newFiles = files.map(file => ({
      id: Date.now() + Math.random(),
      name: file.name,
      size: file.size,
      type: file.type,
      file,
    }));
    setUploadedFiles(prev => [...prev, ...newFiles]);
  };

  const removeFile = (fileId) => {
    setUploadedFiles(prev => prev.filter(file => file.id !== fileId));
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {isEdit ? 'Edit Employee' : 'Add New Employee'}
            </h1>
            <p className="text-gray-600">
              {isEdit ? 'Update employee information' : 'Create a new employee record'}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            onClick={() => navigate('/employees')}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit(onSubmit)}
            loading={isLoading}
            disabled={isLoading}
          >
            <Save className="h-4 w-4 mr-2" />
            {isEdit ? 'Update Employee' : 'Create Employee'}
          </Button>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Personal Information */}
        <div className="bg-white rounded-xl shadow-soft p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
            <User className="h-5 w-5 mr-2" />
            Personal Information
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                First Name *
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Enter first name"
                  className="pl-10"
                  {...register('firstName')}
                  error={errors.firstName?.message}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Last Name *
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Enter last name"
                  className="pl-10"
                  {...register('lastName')}
                  error={errors.lastName?.message}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Address *
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="email"
                  placeholder="Enter email address"
                  className="pl-10"
                  {...register('email')}
                  error={errors.email?.message}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="tel"
                  placeholder="Enter phone number"
                  className="pl-10"
                  {...register('phone')}
                  error={errors.phone?.message}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Gender
              </label>
              <select
                {...register('gender')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="">Select gender</option>
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
                <option value="OTHER">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date of Birth
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="date"
                  className="pl-10"
                  {...register('dob')}
                  error={errors.dob?.message}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Employment Information */}
        <div className="bg-white rounded-xl shadow-soft p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
            <Building className="h-5 w-5 mr-2" />
            Employment Information
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Job Title *
              </label>
              <Input
                placeholder="Enter job title"
                {...register('jobTitle')}
                error={errors.jobTitle?.message}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Job Type *
              </label>
              <select
                {...register('jobType')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="FULL_TIME">Full Time</option>
                <option value="PART_TIME">Part Time</option>
                <option value="CONTRACT">Contract</option>
                <option value="INTERN">Intern</option>
              </select>
              {errors.jobType && (
                <p className="mt-1 text-sm text-error-600">{errors.jobType.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Department *
              </label>
              <select
                {...register('departmentId')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="">Select department</option>
                {departments.map((dept) => (
                  <option key={dept.id} value={dept.id}>
                    {dept.name}
                  </option>
                ))}
              </select>
              {errors.departmentId && (
                <p className="mt-1 text-sm text-error-600">{errors.departmentId.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Manager
              </label>
              <select
                {...register('managerId')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="">Select manager</option>
                {managers.map((manager) => (
                  <option key={manager.id} value={manager.id}>
                    {manager.firstName} {manager.lastName} - {manager.jobTitle}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Salary
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="number"
                  placeholder="Enter salary"
                  className="pl-10"
                  {...register('salary', { valueAsNumber: true })}
                  error={errors.salary?.message}
                />
              </div>
            </div>

            {isEdit && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Employment Status
                </label>
                <select
                  {...register('status')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="ACTIVE">Active</option>
                  <option value="INACTIVE">Inactive</option>
                  <option value="PROBATION">Probation</option>
                  <option value="TERMINATED">Terminated</option>
                  <option value="RESIGNED">Resigned</option>
                </select>
              </div>
            )}
          </div>
        </div>

        {/* Additional Information */}
        {isEdit && (
          <div className="bg-white rounded-xl shadow-soft p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
              <FileText className="h-5 w-5 mr-2" />
              Additional Information
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-2">Employee ID</h3>
                <p className="text-sm text-gray-600">{selectedEmployee?.id}</p>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-2">Hire Date</h3>
                <p className="text-sm text-gray-600">
                  {selectedEmployee?.hireDate ? formatDate(selectedEmployee.hireDate) : 'N/A'}
                </p>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-2">Years of Service</h3>
                <p className="text-sm text-gray-600">
                  {selectedEmployee?.hireDate 
                    ? Math.floor((new Date() - new Date(selectedEmployee.hireDate)) / (365.25 * 24 * 60 * 60 * 1000))
                    : 'N/A'
                  } years
                </p>
              </div>
            </div>
          </div>
        )}

        {/* File Upload Section */}
        <div className="bg-white rounded-xl shadow-soft p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
            <Upload className="h-5 w-5 mr-2" />
            Documents
          </h2>
          
          <div className="space-y-4">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <Upload className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <p className="text-sm text-gray-600 mb-4">
                Upload employee documents (contracts, certificates, etc.)
              </p>
              <input
                type="file"
                multiple
                onChange={handleFileUpload}
                className="hidden"
                id="file-upload"
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
              />
              <label
                htmlFor="file-upload"
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer"
              >
                <Upload className="h-4 w-4 mr-2" />
                Choose Files
              </label>
            </div>

            {uploadedFiles.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-gray-700">Uploaded Files:</h3>
                {uploadedFiles.map((file) => (
                  <div key={file.id} className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                    <div className="flex items-center space-x-3">
                      <FileText className="h-4 w-4 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">{file.name}</p>
                        <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFile(file.id)}
                    >
                      Remove
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </form>

      {/* Action Buttons */}
      <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
        <Button
          variant="outline"
          onClick={() => navigate('/employees')}
        >
          Cancel
        </Button>
        <Button
          onClick={handleSubmit(onSubmit)}
          loading={isLoading}
          disabled={isLoading}
        >
          <Save className="h-4 w-4 mr-2" />
          {isEdit ? 'Update Employee' : 'Create Employee'}
        </Button>
      </div>
    </motion.div>
  );
};

export default EmployeeForm;