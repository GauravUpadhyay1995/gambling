'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';

const dotVariants = {
    animate: {
        y: [0, -8, 0],
        transition: {
            duration: 1,
            repeat: Infinity,
            ease: 'easeInOut'
        }
    }
};

export default function UnderDevelopment() {
    return (
       <div
  className="flex flex-col items-center justify-center h-screen text-white px-4 text-center"
  style={{ backgroundColor: '#003147' }}
>
      <h1 className="text-4xl md:text-5xl font-bold mb-4">
                Under Development...
            </h1>
            <p className="text-lg md:text-xl text-gray-400 mb-6">
                Please check back later...
            </p>
<Image
  src="/images/dev.gif"
  alt="Under Development"
  width={540} // 15rem = 240px (1rem = 16px)
  height={540}
/>          
            

            <div className="flex space-x-2 mt-2">
                <motion.span
                    className="w-3 h-3 bg-orange-500 rounded-full"
                    variants={dotVariants}
                    animate="animate"
                />
                <motion.span
                    className="w-3 h-3 bg-orange-500 rounded-full"
                    variants={dotVariants}
                    animate="animate"
                    transition={{ delay: 0.2, repeat: Infinity, duration: 1 }}
                />
                <motion.span
                    className="w-3 h-3 bg-orange-500 rounded-full"
                    variants={dotVariants}
                    animate="animate"
                    transition={{ delay: 0.4, repeat: Infinity, duration: 1 }}
                />
            </div>
        </div>
    );
}
