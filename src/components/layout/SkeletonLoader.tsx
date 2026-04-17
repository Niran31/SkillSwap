import React from 'react';

export const SkeletonCard = () => (
  <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 w-full">
    <div className="flex items-start mb-4">
      <div className="w-14 h-14 rounded-full shimmer-bg mr-4 flex-shrink-0"></div>
      <div className="flex-grow">
        <div className="flex justify-between items-start mb-2">
          <div className="h-4 w-3/4 shimmer-bg rounded"></div>
          <div className="h-5 w-16 shimmer-bg rounded-full"></div>
        </div>
        <div className="h-3 w-1/2 shimmer-bg rounded mb-3"></div>
        <div className="h-3 w-2/3 shimmer-bg rounded mb-3"></div>
        <div className="flex gap-2 mb-3">
          <div className="h-5 w-16 shimmer-bg rounded-full"></div>
          <div className="h-5 w-16 shimmer-bg rounded-full"></div>
        </div>
      </div>
    </div>
  </div>
);

export const SkeletonProfile = () => (
  <div className="space-y-8">
    <div className="bg-white rounded-xl shadow-md overflow-hidden">
      <div className="h-48 shimmer-bg w-full"></div>
      <div className="px-6 py-8 relative">
        <div className="w-32 h-32 rounded-full border-4 border-white shimmer-bg absolute -top-16 left-6 flex items-center justify-center"></div>
        <div className="ml-40">
          <div className="flex justify-between items-start">
            <div>
              <div className="h-6 w-48 shimmer-bg rounded mb-2"></div>
              <div className="h-4 w-32 shimmer-bg rounded mb-4"></div>
            </div>
            <div className="flex space-x-3">
              <div className="h-10 w-24 shimmer-bg rounded-lg"></div>
              <div className="h-10 w-32 shimmer-bg rounded-lg"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

export const SkeletonSimple = ({ count = 3 }: { count?: number }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {Array.from({ length: count }).map((_, i) => (
      <SkeletonCard key={i} />
    ))}
  </div>
);

export default SkeletonSimple;
