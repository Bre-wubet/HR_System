import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Camera, Save, User as UserIcon, Mail, Phone, Briefcase, Building, Shield, Calendar } from 'lucide-react';
import apiClient from '../../api/axiosClient';
import { queryKeys } from '../../lib/react-query';
import useAuthStore from '../../stores/useAuthStore';
import { getInitials } from '../../lib/utils';

const Profile = () => {
  const { user: currentUser, roles, permissions, updateUser } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  // Fetch user profile
  const { data: user, isLoading, error, refetch } = useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const response = await apiClient.get('/auth/profile');
      return response.data.data;
    },
  });

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (data) => {
      const response = await apiClient.put('/auth/profile', data);
      return response.data.data;
    },
    onSuccess: (updatedUser) => {
      updateUser(updatedUser);
      setIsEditing(false);
      setEditData(null);
      refetch();
    },
  });

  const handleEdit = () => {
    setEditData({
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
    });
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditData(null);
    setImagePreview(null);
  };

  const handleSave = () => {
    if (editData) {
      updateProfileMutation.mutate(editData);
    }
  };

  const handleInputChange = (field, value) => {
    setEditData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-600">Error loading profile</p>
        </div>
      </div>
    );
  }

  const displayUser = user || currentUser;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
          <p className="mt-2 text-gray-600">View and manage your profile information</p>
        </div>

        {/* Profile Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {/* Avatar Section */}
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-8 py-12 flex items-center space-x-6">
            <div className="relative">
              <div className="h-32 w-32 bg-white rounded-full flex items-center justify-center ring-4 ring-white shadow-lg">
                {imagePreview ? (
                  <img 
                    src={imagePreview} 
                    alt="Profile" 
                    className="h-32 w-32 rounded-full object-cover"
                  />
                ) : (
                  <span className="text-4xl font-bold text-blue-600">
                    {getInitials(`${displayUser?.firstName || ''} ${displayUser?.lastName || ''}`)}
                  </span>
                )}
              </div>
              <button
                className="absolute bottom-0 right-0 bg-gray-700 hover:bg-gray-800 text-white p-2 rounded-full shadow-lg transition-colors"
              >
                <Camera className="h-4 w-4" />
              </button>
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-white">
                {displayUser?.firstName || ''} {displayUser?.lastName || ''}
              </h2>
              <p className="text-blue-100 mt-1">{displayUser?.email}</p>
              <div className="flex items-center space-x-4 mt-3">
                {roles?.map((role) => (
                  <span
                    key={role}
                    className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-white bg-opacity-20 text-white"
                  >
                    {role.replace('_', ' ')}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Profile Information */}
          <div className="px-8 py-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Personal Information</h3>
              {!isEditing ? (
                <button
                  onClick={handleEdit}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                >
                  Edit Profile
                </button>
              ) : (
                <div className="flex space-x-3">
                  <button
                    onClick={handleCancel}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={updateProfileMutation.isPending}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 transition-colors disabled:opacity-50"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {updateProfileMutation.isPending ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              )}
            </div>

            <div className="space-y-4">
              {/* Email */}
              <div className="flex items-center space-x-3 py-3 border-b border-gray-100">
                <Mail className="h-5 w-5 text-gray-400" />
                <div className="flex-1">
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="text-sm font-medium text-gray-900">{displayUser?.email}</p>
                </div>
              </div>

              {/* Name */}
              {isEditing ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-3 border-b border-gray-100">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                    <input
                      type="text"
                      value={editData?.firstName}
                      onChange={(e) => handleInputChange('firstName', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                    <input
                      type="text"
                      value={editData?.lastName}
                      onChange={(e) => handleInputChange('lastName', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                </div>
              ) : (
                <div className="flex items-center space-x-3 py-3 border-b border-gray-100">
                  <UserIcon className="h-5 w-5 text-gray-400" />
                  <div className="flex-1">
                    <p className="text-sm text-gray-500">Full Name</p>
                    <p className="text-sm font-medium text-gray-900">
                      {displayUser?.firstName} {displayUser?.lastName}
                    </p>
                  </div>
                </div>
              )}

              {/* Employee ID */}
              {displayUser?.employeeId && (
                <div className="flex items-center space-x-3 py-3 border-b border-gray-100">
                  <Briefcase className="h-5 w-5 text-gray-400" />
                  <div className="flex-1">
                    <p className="text-sm text-gray-500">Employee ID</p>
                    <p className="text-sm font-medium text-gray-900">{displayUser.employeeId}</p>
                  </div>
                </div>
              )}

              {/* Account Status */}
              <div className="flex items-center space-x-3 py-3 border-b border-gray-100">
                <Shield className="h-5 w-5 text-gray-400" />
                <div className="flex-1">
                  <p className="text-sm text-gray-500">Account Status</p>
                  <div className="flex items-center space-x-2">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      displayUser?.isActive 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {displayUser?.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Email Verification */}
              <div className="flex items-center space-x-3 py-3 border-b border-gray-100">
                <Mail className="h-5 w-5 text-gray-400" />
                <div className="flex-1">
                  <p className="text-sm text-gray-500">Email Verification</p>
                  <div className="flex items-center space-x-2">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      displayUser?.emailVerified 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {displayUser?.emailVerified ? 'Verified' : 'Not Verified'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Member Since */}
              {displayUser?.createdAt && (
                <div className="flex items-center space-x-3 py-3 border-b border-gray-100">
                  <Calendar className="h-5 w-5 text-gray-400" />
                  <div className="flex-1">
                    <p className="text-sm text-gray-500">Member Since</p>
                    <p className="text-sm font-medium text-gray-900">
                      {new Date(displayUser.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                </div>
              )}

              {/* Last Login */}
              {displayUser?.lastLoginAt && (
                <div className="flex items-center space-x-3 py-3">
                  <Calendar className="h-5 w-5 text-gray-400" />
                  <div className="flex-1">
                    <p className="text-sm text-gray-500">Last Login</p>
                    <p className="text-sm font-medium text-gray-900">
                      {new Date(displayUser.lastLoginAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Permissions Section */}
        {permissions && permissions.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 mt-6">
            <div className="px-8 py-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Permissions</h3>
              <p className="mt-1 text-sm text-gray-500">
                You have {permissions.length} permission{permissions.length !== 1 ? 's' : ''}
              </p>
            </div>
            <div className="px-8 py-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {permissions.map((permission) => (
                  <div
                    key={permission}
                    className="flex items-center px-3 py-2 bg-blue-50 rounded-lg"
                  >
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{permission}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
