import React from 'react';
import { motion } from 'framer-motion';

/**
 * Loading Skeleton Components
 * Provides skeleton loading states for different UI elements
 */

const SkeletonBox = ({ className = '', ...props }) => (
  <div
    className={`animate-pulse bg-gray-200 rounded ${className}`}
    {...props}
  />
);

export const EmployeeDetailSkeleton = () => (
  <div className="space-y-6">
    {/* Header Skeleton */}
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <SkeletonBox className="h-8 w-24" />
        <div>
          <SkeletonBox className="h-8 w-48 mb-2" />
          <SkeletonBox className="h-4 w-32" />
        </div>
      </div>
      <div className="flex items-center space-x-3">
        <SkeletonBox className="h-8 w-20" />
        <SkeletonBox className="h-8 w-20" />
        <SkeletonBox className="h-8 w-24" />
      </div>
    </div>

    {/* Tabs Skeleton */}
    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
      <div className="border-b border-gray-200">
        <div className="flex space-x-8 px-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <SkeletonBox key={i} className="h-12 w-20" />
          ))}
        </div>
      </div>
      
      <div className="p-6">
        {/* Overview Content Skeleton */}
        <div className="space-y-6">
          {/* Avatar and Basic Info */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-start space-x-6">
              <SkeletonBox className="h-20 w-20 rounded-full" />
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <SkeletonBox className="h-6 w-32" />
                  <SkeletonBox className="h-5 w-16 rounded-full" />
                  <SkeletonBox className="h-5 w-20 rounded-full" />
                </div>
                <SkeletonBox className="h-4 w-24 mb-1" />
                <SkeletonBox className="h-3 w-32" />
              </div>
            </div>
          </div>

          {/* Overview Sections */}
          <div className="grid gap-6 md:grid-cols-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center space-x-2 mb-4">
                  <SkeletonBox className="h-5 w-5" />
                  <SkeletonBox className="h-5 w-32" />
                </div>
                <div className="space-y-3">
                  {[1, 2, 3, 4].map((j) => (
                    <div key={j} className="flex items-start justify-between">
                      <SkeletonBox className="h-4 w-24" />
                      <SkeletonBox className="h-4 w-20" />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  </div>
);

export const TabContentSkeleton = () => (
  <div className="space-y-4">
    <div className="flex items-center justify-between">
      <SkeletonBox className="h-6 w-24" />
      <SkeletonBox className="h-8 w-24" />
    </div>
    
    <div className="grid gap-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-2">
                <SkeletonBox className="h-4 w-32" />
                <SkeletonBox className="h-4 w-16 rounded-full" />
              </div>
              <SkeletonBox className="h-3 w-48 mb-2" />
              <SkeletonBox className="h-3 w-32" />
            </div>
            <div className="flex items-center space-x-2">
              <SkeletonBox className="h-8 w-8" />
              <SkeletonBox className="h-8 w-8" />
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

export default {
  SkeletonBox,
  EmployeeDetailSkeleton,
  TabContentSkeleton,
};
