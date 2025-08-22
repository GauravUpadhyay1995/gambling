'use client';

import ScratchCards from '@/components/dashboard/ScratchCards';
import WelcomeHeader from '@/components/dashboard/WelcomeHeader';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { User } from '@/types/User'; // import your User type
import {  useEffect } from 'react';

import { useAuth } from '@/context/AuthContext';
export default function RewardsPage() {
  const { user } = useAuth();
 
  useEffect(() => {
    document.title = user ? `Rewards - ${user?.customer} | WIN CoE` : 'Rewards | WIN CoE';
  }, [user]);
  return (
    <DashboardLayout>
     
      <main className="flex-1 flex flex-col">
          <div className="sticky top-0 z-20 bg-white dark:bg-gray-900 shadow-sm border-b border-gray-200 dark:border-gray-800">
            <WelcomeHeader user={user as unknown as User} />
          </div>
        <div className="pt-2 md:pt-4 p-2 md:p-4 lg:p-8">
          <ScratchCards />
        </div>
      </main>
      {/* <Footer /> */}
    </DashboardLayout>
  );
} 