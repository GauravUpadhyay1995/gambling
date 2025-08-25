'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
// Assuming MOBILE_WHATSAPP is correctly configured in your .env
const MOBILE_WHATSAPP = process.env.NEXT_PUBLIC_COMPANY_MOBILE_WHATSAPP;

import { useTheme } from '@/context/ThemeContext'; // Ensure this path is correct

const Footer = () => {
  const { theme } = useTheme();

  const [isVisible, setIsVisible] = useState(false);
  const [isPulsing, setIsPulsing] = useState(false);
  const [hoveredLink, setHoveredLink] = useState<string | null>(null);

  // Animate footer on load and set up WhatsApp pulse effect
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100);
    const pulseInterval = setInterval(() => {
      setIsPulsing(true);
      setTimeout(() => setIsPulsing(false), 1000); // Pulse duration
    }, 5000); // Interval between pulses

    return () => {
      clearTimeout(timer);
      clearInterval(pulseInterval);
    };
  }, []);

  // Framer Motion variants
  const containerVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
        duration: 0.5,
        ease: 'easeOut',
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 100,
        damping: 12, // Slightly increased damping for smoother bounce
      },
    },
  };

  const linkVariants = {
    rest: { scale: 1, color: theme === 'dark' ? '#d1d5db' : '#4b5563' }, // Default text color
    hover: {
      scale: 1.05,
      color: theme === 'dark' ? '#fb923c' : '#ea580c', // Orange-300 dark, Orange-600 light
      transition: { duration: 0.2 },
    },
  };

  const iconLinkVariants = {
    rest: { scale: 1 },
    hover: { scale: 1.2, transition: { type: 'spring', stiffness: 300, damping: 10 } },
  };

  return (
    <motion.footer
      initial="hidden"
      animate={isVisible ? 'visible' : 'hidden'}
      variants={containerVariants}
      className={`bg-gradient-to-br from-gray-900 via-gray-950 to-black dark:from-gray-900 dark:via-gray-950 dark:to-black
                  border-t border-orange-200/50 dark:border-gray-800/50 mt-auto pt-16 pb-8 shadow-inner`} // Enhanced gradient and shadow
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* WhatsApp Floating Button */}
        <motion.div
          className="fixed bottom-6 right-6 z-[100]"
          initial={{ scale: 0, x: 50, y: 50 }}
          animate={{
            scale: 1,
            x: 0,
            y: 0,
            transition: { type: 'spring', stiffness: 200, damping: 15, delay: 0.8 },
          }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <a
            href={`https://wa.me/${MOBILE_WHATSAPP}`}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Chat with us on WhatsApp"
            className="inline-block"
          >
            <motion.div
              className="relative"
              animate={{
                y: [0, -8, 0], // Slightly less aggressive bounce
                transition: {
                  repeat: Infinity,
                  repeatType: 'loop',
                  duration: 4, // Slower bounce
                  ease: 'easeInOut',
                },
              }}
            >
              <motion.div
                animate={{
                  scale: isPulsing ? [1, 1.15, 1] : 1, // Slightly smaller pulse
                  boxShadow: isPulsing
                    ? `0 0 0 10px ${theme === 'dark' ? 'rgba(251, 146, 60, 0.3)' : 'rgba(234, 88, 12, 0.3)'}` // Thinner, color-aware pulse
                    : 'none',
                  transition: {
                    duration: 0.8, // Faster pulse fade
                    ease: 'easeOut',
                  },
                }}
              >
                <Image
                  src="/images/whatsapp-512.png" // Ensure this path is correct
                  alt="WhatsApp chat"
                  width={60} // Slightly larger button
                  height={60}
                  className="rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
                />
              </motion.div>
            </motion.div>
          </a>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-x-8 gap-y-12 text-white text-center md:text-left" // Increased gap-y for mobile
          variants={containerVariants}
        >
          {/* Column 1: College/Org Info */}
          <motion.div variants={itemVariants} className="flex flex-col items-center md:items-start  text-white">
            <Link href="/" className="inline-block mb-4 focus:outline-none focus:ring-2 focus:ring-orange-500 rounded-md">
              <motion.span
                className="font-bold text-3xl gradient-text dark:gradient-text"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                <div className="flex items-center gap-2 sm:gap-3">
                  <Image src={process.env.NEXT_PUBLIC_COMPANY_LOGO || "/images/logo/logo.png"} alt="WIN CoE Logo" width={100} height={10} priority />
                </div>
              </motion.span>
            </Link>
            <motion.p
              className="text-sm  text-white dark:text-gray-300 leading-relaxed max-w-sm" // Added max-width for better readability
              variants={{
                hidden: { opacity: 0 },
                visible: { opacity: 1, transition: { delay: 0.3 } },
              }}
            >
              Our main aim is to take Matka game to the next level by taking it online. We are making a change in the industry by making {process.env.NEXT_PUBLIC_COMPANY_NAME} Game available on the internet.
            </motion.p>
            {/* Social Media Icons */}
            {/* <div className="flex space-x-4 mt-6">

              <motion.a href="https://www.linkedin.com/company/wadhwanifoundation/" target="_blank" rel="noopener noreferrer" aria-label="WIN CoE on LinkedIn" variants={iconLinkVariants} initial="rest" whileHover="hover">
                <Image src="/images/linkedIn.svg" alt="LinkedIn" width={24} height={24} className="filter  hover:grayscale-0 transition-all duration-300" />
              </motion.a>

            </div> */}
          </motion.div>
          <motion.div variants={itemVariants} className="hidden lg:block" />
          {/* Column 2: Contact Details */}
          <motion.div variants={itemVariants}>
            <motion.h3
              className="text-lg font-bold  text-white dark:text-white mb-5 relative inline-block after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-orange-500"
              whileHover={{ scale: 1.02 }}
            >
              Get in Touch
            </motion.h3>
            <ul className="space-y-3 text-base">
              {[
                {
                  icon: 'M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z',
                 text: `${process.env.NEXT_PUBLIC_COMPANY_MOBILE_HELPLINE}`,
                  href: `tel:${process.env.NEXT_PUBLIC_COMPANY_MOBILE_HELPLINE}`,
                },
                {
                  icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
                  text: 'Mon-Fri: 9:00 AM - 6:00 PM', // More detailed time
                },
                {
                  icon: 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z',
                  text: `${process.env.NEXT_PUBLIC_COMPANY_EMAIL}`, // Changed to a more generic info email
                  href: `mailto:${process.env.NEXT_PUBLIC_COMPANY_EMAIL}`,
                },
              ].map((item, index) => (
                <motion.li key={index} variants={itemVariants} whileHover={{ x: 5 }}>
                  {item.href ? (
                    <a
                      href={item.href}
                      className=" text-white dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400 transition-colors duration-300 flex items-center justify-center md:justify-start gap-2 py-1"
                    >
                      <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={item.icon} />
                      </svg>
                      {item.text}
                    </a>
                  ) : (
                    <span className=" text-white dark:text-gray-300 flex items-center justify-center md:justify-start gap-2 py-1">
                      <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={item.icon} />
                      </svg>
                      {item.text}
                    </span>
                  )}
                </motion.li>
              ))}
            </ul>
          </motion.div>

        
          {/* Column 4: Address & Map Link */}
          <motion.div variants={itemVariants}>
            <motion.h3
              className="text-lg font-bold  text-white dark:text-white mb-5 relative inline-block after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-orange-500"
              whileHover={{ scale: 1.02 }}
            >
              Quick Links
            </motion.h3>
            <ul className="space-y-3 text-base">
              {[
                { href: '/', text: 'Home' },
                { href: '/about', text: 'About Us' },

            
              ].map((item, index) => (
                <motion.li key={index} variants={itemVariants} whileHover={{ x: 5 }}>
                  {item.href ? (
                    <a
                      href={item.href}
                      className=" text-white dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400 transition-colors duration-300 flex items-center justify-center md:justify-start gap-2 py-1"
                    >

                      {item.text}
                    </a>
                  ) : (
                    <span className=" text-white dark:text-gray-300 flex items-center justify-center md:justify-start gap-2 py-1">

                      {item.text}
                    </span>
                  )}
                </motion.li>
              ))}
            </ul>
          </motion.div>

        </motion.div>

        <motion.div
          className="border-t border-gray-200 dark:border-gray-700 mt-12 pt-8 text-center" // More padding for separator
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, transition: { delay: 0.8 } }} // Increased delay
        >
          <motion.p
            className="text-sm  text-white dark:text-gray-400"
            whileHover={{ scale: 1.01 }} // Subtle hover for copyright
          >
            © {new Date().getFullYear()} {process.env.NEXT_PUBLIC_COMPANY_NAME}. All rights reserved.
          </motion.p>
        </motion.div>
      </div>
    </motion.footer>
  );
};

export default Footer;