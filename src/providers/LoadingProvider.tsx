'use client';

import React, { createContext, useContext, useState } from 'react';
import PageLoader from '@/components/ui/loading/PageLoader';

interface LoadingContextType {
  setLoading: (loading: boolean) => void;
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

export const useLoading = () => {
  const context = useContext(LoadingContext);
  if (!context) {
    throw new Error('useLoading must be used within a LoadingProvider');
  }
  return context;
};

export function LoadingProvider({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(false);

  return (
    <LoadingContext.Provider value={{ setLoading: setIsLoading }}>
      {isLoading && <PageLoader />}
      {children}
    </LoadingContext.Provider>
  );
} 