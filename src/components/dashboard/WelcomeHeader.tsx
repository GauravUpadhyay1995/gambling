import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { PhoneIcon } from "@heroicons/react/24/outline";
import type { Variants } from 'framer-motion';


interface User {
  customer: string;
  isPaid: boolean;
  fore_closure: number;
  lender_name: string;
  phone: string;
}

interface WelcomeHeaderProps {
  user: User;
  className?: string;
}

const WelcomeHeader = ({ user, className = '' }: WelcomeHeaderProps) => {
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

const itemVariants: Variants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 24
    }
  }
};


  return (
    <motion.div
      className={`bg-gradient-to-r from-white to-blue-50 dark:from-gray-900 dark:to-gray-800 px-4 py-6 md:px-8 md:py-8 w-full flex flex-col items-start  shadow-sm ${className}`}
      style={{ zIndex: 20 }}
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <motion.h1 
        className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-white flex flex-wrap items-baseline justify-between w-full gap-3"
        variants={itemVariants}
      >
        <span className="flex items-center gap-3">
          <motion.div
            whileHover={{ rotate: 10 }}
            whileTap={{ scale: 0.95 }}
          >
            <Image
              src="/images/namaste.svg"
              alt="Namaste gesture"
              width={28}
              height={28}
              className="inline-block"
            />
          </motion.div>
          <span>
            Welcome, <span className="text-blue-600 dark:text-blue-400">{user?.customer}</span> !
          </span>
        </span>
        
        {user?.phone && (
          <motion.span 
            className="text-sm md:text-base font-medium flex items-center gap-2 text-gray-700 dark:text-gray-300 bg-blue-100 dark:bg-gray-700 px-3 py-1.5 rounded-full"
            variants={itemVariants}
            whileHover={{ scale: 1.03 }}
          >
            <PhoneIcon className="h-4 w-4 flex-shrink-0 text-blue-500" />
            {user?.phone}
          </motion.span>
        )}
      </motion.h1>

      <motion.p 
        className="text-gray-600 dark:text-gray-300 mt-3 text-base md:text-lg"
        variants={itemVariants}
      >
        Your <span className="font-semibold text-gray-800 dark:text-gray-200">{user?.lender_name}</span> loan outstanding {user?.isPaid ? 'was' : 'is'} 
        <span className="ml-1.5 px-2.5 py-1 bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 font-medium rounded-full">
          ₹{user?.fore_closure?.toLocaleString()}
        </span>
      </motion.p>

      
    </motion.div>
  );
};

export default WelcomeHeader;