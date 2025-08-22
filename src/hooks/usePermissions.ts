import { useAuth } from '@/context/AuthContext';
import { useEffect, useState } from 'react';

export const usePermissions = () => {
  const { admin } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [permissions, setPermissions] = useState(admin?.permissions || []);
// console.log('>>>>>>>>',admin);

  useEffect(() => {
    if (admin?.permissions) {
      setPermissions(admin.permissions);
      setIsLoading(false);
    }
  }, [admin?.permissions]);

  const hasPermission = (module: string, action: string | string[]): boolean => {
    if (isLoading || !permissions.length) return false;

    const modulePermission = permissions.find(perm => perm.module === module);
    if (!modulePermission) return false;

    if (Array.isArray(action)) {
      return action.every(act => modulePermission.actions.includes(act));
    }

    return modulePermission.actions.includes(action);
  };

  const canAccess = (module: string, action: string | string[]): boolean => {
    return hasPermission(module, action);
  };

  return {
    hasPermission,
    canAccess,
    permissions,
    isLoading
  };
}; 