"use client";
import { motion } from 'framer-motion';
import {  FiCalendar, FiList, FiArrowRight } from 'react-icons/fi';
import { useRouter } from 'next/navigation';
const GrantCard = ({
  trl_id,

  title,
  amount,
  duration,
  requirements,
  trlRange,
  delay = 0,
  color = 'orange'
}) => {
  // Color variants
  const colorVariants = {
    orange: {
      bg: 'bg-orange-100',
      text: 'text-orange-800',
      border: 'border-orange-200',
      hover: 'hover:border-orange-400',
      darkBorder: 'dark:border-orange-600',
      darkHover: 'dark:hover:border-orange-500',
      gradient: 'from-orange-400 to-orange-500',
      darkGradient: 'from-orange-500 to-orange-600'
    },
    blue: {
      bg: 'bg-blue-100',
      text: 'text-blue-800',
      border: 'border-blue-200',
      hover: 'hover:border-blue-400',
      darkBorder: 'dark:border-blue-600',
      darkHover: 'dark:hover:border-blue-500',
      gradient: 'from-blue-400 to-blue-500',
      darkGradient: 'from-blue-500 to-blue-600'
    },
    emerald: {
      bg: 'bg-emerald-100',
      text: 'text-emerald-800',
      border: 'border-emerald-200',
      hover: 'hover:border-emerald-400',
      darkBorder: 'dark:border-emerald-600',
      darkHover: 'dark:hover:border-emerald-500',
      gradient: 'from-emerald-400 to-emerald-500',
      darkGradient: 'from-emerald-500 to-emerald-600'
    }
  };
  const router = useRouter();
  const colors = colorVariants[color] || colorVariants.orange;

  return (
    <motion.div

      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      whileHover={{ y: -5 }}
      transition={{
        delay: delay * 0.2,
        type: 'spring',
        stiffness: 200,
        damping: 15
      }}
      viewport={{ once: true, margin: "-50px" }}
      className={`relative h-full rounded-2xl shadow-lg overflow-hidden border ${colors.border} ${colors.hover} ${colors.darkBorder} ${colors.darkHover} transition-all duration-300 group`}
    >
      {/* Decorative gradient overlay */}
      <div className={`absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-10 ${colors.gradient} transition-opacity duration-500`}></div>

      {/* Card content */}
      <div className="relative z-10 h-full flex flex-col">
        {/* Header with TRL badge */}
        <div className="p-6 pb-4">
          <div className="flex justify-between items-start mb-4">
            <motion.h3
              className="text-xl md:text-2xl font-bold text-orange-600 dark:text-white "
              whileHover={{ x: 3 }}
              transition={{ type: 'spring' }}
            >
              {title}
            </motion.h3>
            <motion.span
              className={`${colors.bg} ${colors.text} text-xs font-semibold px-3 py-1 rounded-full`}
              whileHover={{ scale: 1.05 }}
            >
              {trlRange}
            </motion.span>
          </div>
        </div>

        {/* Card body */}
        <div className="px-6 pb-6 flex-grow">
          {/* Funding amount */}
          <motion.div
            className="mb-6 p-4 rounded-xl bg-gradient-to-r from-orange-100 to-cyan-50 dark:bg-gray-800 shadow-sm"
            whileHover={{ scale: 1.02 }}
          >
            <div className="flex items-center mb-2">
              
              <p className="text-gray-600 dark:text-gray-300 text-sm">Funding Amount</p>
            </div>
            <p className={`text-2xl md:text-3xl font-bold ${colors.text}`}>{amount}</p>
          </motion.div>

          {/* Duration */}
          <motion.div
            className="mb-6 p-4 rounded-xl bg-gradient-to-r from-orange-100 to-cyan-50 dark:bg-gray-800 shadow-sm"
            whileHover={{ scale: 1.02 }}
          >
            <div className="flex items-center mb-2">
              <FiCalendar className={`w-5 h-5 ${colors.text} mr-2`} />
              <p className="text-gray-600 dark:text-gray-300 text-sm">Duration</p>
            </div>
            <p className="font-medium text-gray-800 dark:text-gray-100">{duration}</p>
          </motion.div>

          {/* Requirements */}
          <motion.div
            className="p-4 rounded-xl bg-gradient-to-r from-orange-100 to-cyan-50 dark:bg-gray-800 shadow-sm"
            whileHover={{ scale: 1.02 }}
          >
            <div className="flex items-center mb-3">
              <FiList className={`w-5 h-5 ${colors.text} mr-2`} />
              <p className="text-gray-600 dark:text-gray-300 text-sm">Requirements</p>
            </div>
            <div>
              {requirements}
            </div>
            {/* <ul className="space-y-2">
              {requirements.map((req, index) => (
                <motion.li 
                  key={index}
                  className="flex items-start text-gray-700 dark:text-gray-300 text-sm"
                  initial={{ x: -10 }}
                  whileInView={{ x: 0 }}
                  transition={{ delay: 0.1 * index }}
                  viewport={{ once: true }}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${colors.bg} mt-2 mr-2`}></span>
                  {req}
                </motion.li>
              ))}
            </ul> */}
          </motion.div>
        </div>

        {/* Footer with CTA */}
        <motion.div
          className="px-6 pb-6"
          whileHover={{ x: 5 }}
        >
          <button className={`flex items-center text-sm font-medium ${colors.text} group`} onClick={() => router.push(`/what-we-do/${trl_id}`)}
          >
            Learn more about this grant
            <FiArrowRight className="ml-2 transition-transform duration-300 group-hover:translate-x-1" />
          </button>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default GrantCard;