'use client';

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from 'react';
import { useRouter } from 'next/navigation';
import { jwtDecode } from 'jwt-decode';

interface Permission {
  module: string;
  actions: string[];
}

interface DecodedToken {
  id: string;
  email: string;
  role: string;
  name: string;
  permissions: Permission[];
  exp: number;
}

interface Admin {
  id: string;
  email: string;
  name: string;
  permissions: Permission[];
}

interface AuthContextType {
  admin: Admin | null;
  isLoading: boolean;
  isAuthenticatedAdmin: boolean;
  login: (token: string) => void;
  logout: () => void;
  checkAuth: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticatedAdmin, setIsAuthenticatedAdmin] = useState(false);

  const clearCookies = useCallback(() => {
    // Try to remove all cookies (non-HttpOnly)
    document.cookie
      .split(';')
      .forEach((cookie) => {
        document.cookie = cookie
          .replace(/^ +/, '')
          .replace(/=.*/, '=;expires=' + new Date(0).toUTCString() + ';path=/');
      });

    // Explicitly try to remove admin_token (if accessible)
    document.cookie =
      'admin_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
  }, []);

  const clearAuthData = useCallback(async () => {
    try {
      // Call logout API to clear HttpOnly cookies from the server
      await fetch('/api/v1/admin/logout', {
        method: 'POST',
        credentials: 'include',
      });
    } catch (error) {
      console.error('Logout API call failed:', error);
    }
    // Clear client-side state
    localStorage.removeItem('adminToken');
    localStorage.removeItem('admin');
    setAdmin(null);
    setIsAuthenticatedAdmin(false);
    clearCookies();
    if (typeof window !== 'undefined' && window.location.pathname.includes('/admin')) {
      // console.log('>>>>>>>>');
      router.push('/login');
    }
  }, [router, clearCookies]);

  const login = useCallback(
    (token: string) => {
      if (!token) {
        console.error('Login failed: Token is null or undefined.');
        clearAuthData();
        return;
      }

      try {
        const decoded: DecodedToken = jwtDecode(token);
        const currentTime = Date.now() / 1000;

        if (decoded.exp < currentTime) {
          console.warn('Token expired at login.');
          clearAuthData();
          return;
        }

        const adminData: Admin = {
          id: decoded.id,
          email: decoded.email,
          name: decoded.name,
          permissions: decoded.permissions,
        };

        setAdmin(adminData);
        setIsAuthenticatedAdmin(true);
        localStorage.setItem('adminToken', token);
        localStorage.setItem('admin', JSON.stringify(adminData));
      } catch (error) {
        console.error('Login failed: Invalid token', error);
        clearAuthData();
      }
    },
    [clearAuthData]
  );

  const logout = useCallback(() => {
    clearAuthData();
  }, [clearAuthData]);

  const checkAuth = useCallback(() => {
    setIsLoading(true);

    try {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        clearAuthData();
        return;
      }

      const decoded: DecodedToken = jwtDecode(token);
      const currentTime = Date.now() / 1000;

      if (decoded.exp < currentTime) {
        console.warn('Token expired. Logging out.');
        clearAuthData();
        return;
      }

      const adminData: Admin = {
        id: decoded.id,
        email: decoded.email,
        name: decoded.name,
        permissions: decoded.permissions,
      };

      setAdmin(adminData);
      setIsAuthenticatedAdmin(true);
      localStorage.setItem('admin', JSON.stringify(adminData));
    } catch (error) {
      console.error('Invalid or modified token. Logging out.', error);
      clearAuthData();
    } finally {
      setIsLoading(false);
    }
  }, [clearAuthData]);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return (
    <AuthContext.Provider
      value={{
        admin,
        isLoading,
        isAuthenticatedAdmin,
        login,
        logout,
        checkAuth,
      }}
    >
      {!isLoading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
