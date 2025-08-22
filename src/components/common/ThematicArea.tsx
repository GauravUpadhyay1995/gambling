'use client';

import { motion } from 'framer-motion';
import { FaHeartbeat, FaMicroscope, FaBrain, FaWheelchair, FaMobileAlt } from 'react-icons/fa';

const areas = [
    {
        title: 'Personalized Medicine & Rehabilitation',
        icon: <FaHeartbeat className="text-orange-600 w-8 h-8" />,
    },
    {
        title: 'Diagnostic Tools',
        icon: <FaMicroscope className="text-orange-600 w-8 h-8" />,
    },
    {
        title: 'Bio-Imaging and AI as Diagnostic Tools',
        icon: <FaBrain className="text-orange-600 w-8 h-8" />,
    },
    {
        title: 'Assistive Technology for Elderly & Disabled',
        icon: <FaWheelchair className="text-orange-600 w-8 h-8" />,
    },
    {
        title: 'Low-cost Wearable Health Devices',
        icon: <FaMobileAlt className="text-orange-600 w-8 h-8" />,
    },
];

const cardVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: (i: number) => ({
        opacity: 1,
        y: 0,
        transition: { delay: i * 0.2, type: 'spring', stiffness: 100 },
    }),
};

export default function ThematicAreas() {
    return (
        <div className="py-16 px-4 md:px-8 bg-white text-center">
           <motion.h2
            className="text-3xl font-bold text-orange-600 flex items-center justify-center gap-4 mb-4"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ margin: '-100px' }}

          >
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" fill="#ec4a0a" viewBox="0 0 24 24">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5A2.5 2.5 0 1 1 12 6a2.5 2.5 0 0 1 0 5.5z" />
            </svg>

            Thematic Areas 
          </motion.h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                {areas.map((area, i) => (
                    <motion.div
                        key={area.title}
                        custom={i}
                        initial="hidden"
                        whileInView="visible"
                       
                        variants={cardVariants}
                        whileHover={{
                            scale: 1.05,
                            boxShadow: '0 10px 20px rgba(255, 102, 0, 0.2)',
                        }}
                        className="bg-gray-50 rounded-2xl shadow-md p-6 flex flex-col items-center justify-center transition-transform duration-300 hover:bg-orange-50"
                    >
                        {area.icon}
                        <h3 className="text-lg font-semibold mt-4 text-gray-800">{area.title}</h3>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
