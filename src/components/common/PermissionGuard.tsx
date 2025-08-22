import React from 'react';
import { usePermissions } from '@/hooks/usePermissions';

interface PermissionGuardProps {
  module: string;
  action: string | string[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const PermissionGuard: React.FC<PermissionGuardProps> = ({
  module,
  action,
  children,
  fallback = null
}) => {
  const { canAccess, isLoading } = usePermissions();

  if (isLoading) {
    return null;
  }

  return canAccess(module, action) ? <>{children}</> : <>{fallback}</>;
};

// Common permission checks
export const UserPermissionGuard: React.FC<{
  action: string | string[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
}> = ({ action, children, fallback }) => (
  <PermissionGuard module="User" action={action} fallback={fallback}>
    {children}
  </PermissionGuard>
);

export const CustomerPermissionGuard: React.FC<{
  action: string | string[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
}> = ({ action, children, fallback }) => (
  <PermissionGuard module="Customer" action={action} fallback={fallback}>
    {children}
  </PermissionGuard>
); 