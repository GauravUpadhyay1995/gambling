'use client';

import DashboardLayout from '@/components/layout/DashboardLayout';
import WelcomeHeader from '@/components/dashboard/WelcomeHeader';
import PaymentBreakdown from '@/components/dashboard/PaymentBreakdown';
// import Header from '@/components/home/Header';
// import Footer from '@/components/home/Footer';
import { useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import Head from 'next/head';
import { User } from '@/types/User';
// import { formatDistanceToNow } from 'date-fns';

export default function DashboardPage() {
  const { user, loading, checkAuth } = useAuth();
  // console.log(user)

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  if (loading) {
    return (
      <DashboardLayout>
        <main className="flex-1 flex flex-col">
          <Head>
            <title>User Dashboard</title>
          </Head>
          <div className="relative">
            <div className="sticky top-0 z-20"><div className="bg-white dark:bg-gray-800"><div className="h-0 md:h-0" /></div></div>
            {/* Simulate WelcomeHeader */}
            <div className="h-8 w-1/3 bg-gray-200 dark:bg-gray-700 rounded mt-4" />
            <div className="h-6 w-1/4 bg-gray-200 dark:bg-gray-700 rounded" />
            {/* Simulate PaymentBreakdown cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-48 bg-gray-200 dark:bg-gray-700 rounded-lg" />
              ))}
            </div>
            {/* Simulate footer note */}
            <div className="h-4 w-1/2 bg-gray-200 dark:bg-gray-700 rounded mt-6" />
          </div>
        </main>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <main className="flex-1 flex flex-col">
        <Head>
          <title>User Dashboard</title>
        </Head>
        {user && (
          <div className="sticky top-0 z-20 bg-white dark:bg-gray-900 shadow-sm border-b border-gray-200 dark:border-gray-800">
            <WelcomeHeader user={user as unknown as User} />
          </div>

        )}
        <div className="pt-2 md:pt-4 flex-1 flex flex-col">
          <PaymentBreakdown user={user} loading={loading} />
          <div className="mt-6 text-sm text-gray-500 dark:text-gray-400 text-center p-4 md:p-8">
            <p>Please upload a screenshot of your pending loan to get started.</p>
            <p className="mt-6">Click &apos;Upload Screenshot&apos; in the sidebar to upload.</p>
          </div>
        </div>
      </main>
    </DashboardLayout>
  );
}
