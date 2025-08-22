'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export function useProtected(role: 'user' | 'admin') {
  const { isAuthenticatedAdmin, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;
    if (role == 'admin' && !isAuthenticatedAdmin) {
      router.push('/login');
    }
  }, [isLoading, isAuthenticatedAdmin, role, router]);
}
