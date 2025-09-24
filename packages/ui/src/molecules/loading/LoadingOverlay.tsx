"use client";

import React from 'react';
import { useLoadingStore } from '../../store/loading';

export const LoadingOverlay = () => {
  const { isLoading, message } = useLoadingStore();

  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 shadow-lg max-w-sm mx-4">
        <div className="flex items-center space-x-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="text-lg font-medium">
            {message || 'Cargando...'}
          </span>
        </div>
      </div>
    </div>
  );
};