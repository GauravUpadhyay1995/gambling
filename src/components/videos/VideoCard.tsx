'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';

const VideoCard = ({ title, speaker, description, thumbnail, delay = 0 }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40, scale: 0.95 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay, duration: 0.7, ease: [0.33, 1, 0.68, 1] }}
      viewport={{ once: true, margin: '-80px' }}
      whileHover={{
        scale: 1.03,
        rotate: 1,
        y: -8,
        transition: { type: 'spring', stiffness: 200 },
      }}
      className="relative bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 border border-gray-100 dark:border-gray-700 rounded-2xl shadow-md hover:shadow-2xl transition-shadow duration-300 overflow-hidden group"
    >
      {/* Animated Background Ripple */}
      <motion.div
        className="absolute -top-10 -right-10 w-28 h-28 rounded-full bg-blue-200 dark:bg-blue-900 opacity-10 group-hover:opacity-20"
        animate={{ rotate: 360 }}
        transition={{
          repeat: Infinity,
          duration: 18,
          ease: 'linear',
        }}
      />

      {/* Video Thumbnail */}
      <div className="relative aspect-video">
        <Image
          src={thumbnail}
          alt={title}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
        />
        <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
          <motion.div
            whileHover={{ scale: 1.1 }}
            className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center shadow-lg"
          >
            <svg
              className="w-8 h-8 text-blue-600"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M6.3 2.841A1.5 1.5 0 004 4.11v11.78a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
            </svg>
          </motion.div>
        </div>
      </div>

      {/* Video Text Content */}
      <div className="p-6">
        <div className="flex items-center mb-2">
          <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
            {speaker}
          </span>
        </div>
        <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">
          {title}
        </h3>
        <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
          {description}
        </p>
      </div>
    </motion.div>
  );
};

export default VideoCard;
