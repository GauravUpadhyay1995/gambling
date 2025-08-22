// components/skeletons/SkeletonCard.tsx
'use client';

import React from 'react';

const SkeletonCard: React.FC = () => (
  <div className="animate-pulse bg-white rounded-xl shadow p-4 space-y-4">
    <div className="w-full h-48 bg-gray-200 rounded-lg" />
    <div className="h-4 w-3/4 bg-gray-300 rounded" />
    <div className="h-4 w-1/2 bg-gray-300 rounded" />
    <div className="h-3 w-full bg-gray-200 rounded" />
    <div className="h-3 w-5/6 bg-gray-200 rounded" />
  </div>
);

export default SkeletonCard;
