'use client';

import { ShieldExclamationIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';

export default function UnauthorizedComponent() {
  return (
    <div className="min-h-[80vh] w-full flex items-center justify-center p-4 sm:p-8">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-2xl bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 sm:p-12 text-center"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ 
            type: "spring",
            stiffness: 260,
            damping: 20,
            delay: 0.2
          }}
          className="relative mb-8"
        >
          <div className="absolute inset-0 bg-red-100 dark:bg-red-900/20 rounded-full blur-2xl opacity-50"></div>
          <ShieldExclamationIcon className="w-24 h-24 text-red-500 mx-auto relative z-10" />
        </motion.div>

        <motion.h2 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-3xl sm:text-4xl font-bold text-gray-800 dark:text-white mb-4"
        >
          Access Denied
        </motion.h2>

        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-lg sm:text-xl text-gray-600 dark:text-gray-400 mb-8 max-w-xl mx-auto"
        >
          You don&apos;t have permission to access this page. Please contact your administrator for assistance.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <button
            onClick={() => window.history.back()}
            className="px-6 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-base font-medium"
          >
            Go Back
          </button>
          <button
            onClick={() => window.location.href = '/'}
            className="px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-base font-medium"
          >
            Return to Home
          </button>
        </motion.div>
      </motion.div>
    </div>
  );
} 