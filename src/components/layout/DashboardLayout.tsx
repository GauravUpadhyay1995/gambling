'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'react-hot-toast';
// import { TrashIcon } from '@heroicons/react/24/outline';
import ThemeTogglerTwo from "@/components/common/ThemeTogglerTwo";
import { useTheme } from '@/context/ThemeContext';

import Image from "next/image";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const { theme } = useTheme();

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const pathname = usePathname();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout('user');
  };




  const menuItems = [
    {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      ),
      label: 'Dashboard',
      href: '/user/dashboard',
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      label: 'Rewards',
      href: '/user/rewards',
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      label: 'Payment Status',
      href: '/user/timeline',
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
        </svg>
      ),
      label: 'Logout',
      onClick: handleLogout,
    },
  ];

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-950 relative">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-900 transform transition-all duration-300 ease-in-out md:relative md:translate-x-0  flex flex-col pt-4 pb-8 dark:border-gray-800  border-r border-gray-200  overflow-y-auto ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between h-16 px-6 mb-4">
            <Link href="/" className="inline-block">
              <span className="font-bold text-3xl gradient-text text-purple-600 dark:text-purple-400 transition-colors duration-300">
                <Image
                  src={theme === "dark" ? "/images/logo/wincoe-logo.png" : "/images/logo/wincoe-logo.png"}
                  alt="WIN CoE"
                  width={100}
                  height={10}
                  className="mb-0 opacity-100 ml-0"
                />
              </span>
            </Link>
          </div>

          <nav className="flex-1 px-4 mt-6 space-y-2">
            {menuItems.map((item) => (
              item.onClick ? (
                <button
                  key={item.label}
                  onClick={item.onClick}
                  className="flex items-center w-full px-4 py-3 text-gray-700 dark:text-white rounded-2xl hover:bg-purple-50 hover:text-purple-600 dark:hover:bg-purple-900/20 dark:hover:text-purple-400 transition-colors duration-200"
                >
                  {item.icon}
                  <span className="ml-3 font-medium">{item.label}</span>
                </button>
              ) : (
                <Link
                  key={item.label}
                  href={item.href!}
                  className={`flex items-center px-4 py-3 text-gray-700 dark:text-white rounded-2xl hover:bg-purple-50 hover:text-purple-600 dark:hover:bg-purple-900/20 dark:hover:text-purple-400 transition-colors duration-200 ${pathname === item.href ? 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400 shadow-lg' : ''
                    }`}
                >
                  {item.icon}
                  <span className="ml-3 font-medium">{item.label}</span>
                </Link>
              )
            ))}
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col shadow-2xl bg-gray-100 dark:bg-gray-800">
        {/* Mobile Header */}
        <header className="md:hidden bg-white dark:bg-gray-900 shadow-xl  p-4 flex-shrink-0">
          <div className="flex items-center justify-between h-16">
            <button
              className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200"
              onClick={() => setIsSidebarOpen(true)}
            >
              <svg
                className="w-6 h-6 text-gray-600 dark:text-gray-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
            <Link href="/" className="inline-block">
              <span className="font-bold text-xl text-purple-600 dark:text-purple-400">
                <Image
                  src={theme === "dark" ? "/images/logo/wincoe-logo.png" : "/images/logo/wincoe-logo.png"}
                  alt="WIN CoE"
                  width={150}
                  height={200}

                />
              </span>
            </Link>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1  overflow-y-auto max-h-screen">
          {children}
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Theme Toggle Button */}
      <div className="fixed bottom-4 right-4 z-[100]">
        <ThemeTogglerTwo />
      </div>

    </div>
  );
};

export default DashboardLayout; 