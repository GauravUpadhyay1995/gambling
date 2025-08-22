import React from 'react';
import { motion } from 'framer-motion';

const PageLoader = () => {
  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 z-50 flex items-center justify-center bg-gradient-to-r from-orange-50 to-cyan-50 backdrop-blur-sm"
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent animate-spin"
        ></motion.div>
      </motion.div>
    </>
  );
};

export default PageLoader; 