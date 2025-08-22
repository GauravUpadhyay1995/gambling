'use client';

import { useParams } from 'next/navigation';
import useSWR from 'swr';
import { motion } from 'framer-motion';
import { FiArrowLeft, FiClock,  FiList, FiFileText } from 'react-icons/fi';
import Link from 'next/link';

const fetcher = (url: string) => fetch(url).then(res => res.json());

// Animation variants
const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
            delayChildren: 0.2,
        }
    }
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            type: 'spring',
            stiffness: 100,
            damping: 12
        }
    }
};

const cardVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1 }
};

// Custom Skeleton Loader Component
const SkeletonLoader = ({ className = '', lines = 1 }: { className?: string, lines?: number }) => (
    <div className={className}>
        {[...Array(lines)].map((_, i) => (
            <div key={i} className="relative overflow-hidden h-4 bg-gray-200 rounded mb-2">
                <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-shimmer" />
            </div>
        ))}
    </div>
);

export default function TrlDetailsPage() {
    const { id } = useParams();
    const { data, error, isLoading } = useSWR(`${process.env.NEXT_PUBLIC_API_URL}/trl/${id}`, fetcher);

    const trl = data?.data;

    if (error) return (
        <div className="max-w-4xl mx-auto p-6 md:p-10">
            <div className="bg-red-50 border-l-4 border-red-500 p-4">
                <div className="flex">
                    <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                    </div>
                    <div className="ml-3">
                        <p className="text-sm text-red-700">Failed to load TRL details. Please try again later.</p>
                    </div>
                </div>
            </div>
            <Link href="/trl" className="mt-6 inline-flex items-center text-orange-600 hover:text-orange-800 transition-colors">
                <FiArrowLeft className="mr-2" /> Back to TRL List
            </Link>
        </div>
    );

    return (
        <motion.div
            className="max-w-4xl mx-auto p-6 md:p-10"
            initial="hidden"
            animate="visible"
            variants={containerVariants}
        >
            <motion.div variants={itemVariants}>
                <Link href="/what-we-do" className="inline-flex items-center text-orange-600 hover:text-orange-800 transition-colors mb-6">
                    <FiArrowLeft className="mr-2" /> Back to TRL List
                </Link>
            </motion.div>

            {isLoading ? (
                <div className="space-y-8">
                    {/* Title Skeleton */}
                    <div className="space-y-4">
                        <div className="w-24 h-6 bg-gray-200 rounded-full animate-pulse"></div>
                        <div className="w-3/4 h-10 bg-gray-200 rounded-lg animate-pulse"></div>
                    </div>

                    {/* Badges Skeleton */}
                    <div className="flex gap-4">
                        <div className="w-24 h-8 bg-gray-200 rounded-full animate-pulse"></div>
                        <div className="w-24 h-8 bg-gray-200 rounded-full animate-pulse"></div>
                    </div>

                    {/* Description Skeleton */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4">
                        <div className="w-32 h-6 bg-gray-200 rounded-lg animate-pulse"></div>
                        <SkeletonLoader lines={5} />
                    </div>

                    {/* Requirements Skeleton */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4">
                        <div className="w-32 h-6 bg-gray-200 rounded-lg animate-pulse"></div>
                        <div className="space-y-3">
                            {[...Array(4)].map((_, i) => (
                                <div key={i} className="flex items-center">
                                    <div className="w-5 h-5 bg-gray-200 rounded-full mr-3 animate-pulse"></div>
                                    <div className="flex-1">
                                        <SkeletonLoader />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Button Skeleton */}
                    <div className="w-40 h-10 bg-gray-200 rounded-lg animate-pulse ml-auto"></div>
                </div>
            ) : (
                <>
                    <motion.div
                        variants={itemVariants}
                        className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4"
                    >
                        <div>
                            <span className="inline-block bg-orange-100 text-orange-800 text-xs font-semibold px-2.5 py-0.5 rounded-full mb-2">
                                {trl.tag}
                            </span>
                            <motion.h1
                                className="text-3xl md:text-4xl font-bold text-gray-900"
                            >
                                {trl.title}
                            </motion.h1>
                        </div>
                        <div className="flex gap-2">
                            <motion.span
                                whileHover={{ scale: 1.05 }}
                                className="inline-flex items-center bg-orange-100 text-orange-800 text-sm font-medium px-3 py-1 rounded-full"
                            >
                                <FiClock className="mr-1" /> {trl.duration}
                            </motion.span>
                            <motion.span
                                whileHover={{ scale: 1.05 }}
                                className="inline-flex items-center bg-green-100 text-green-800 text-sm font-medium px-3 py-1 rounded-full"
                            >
                                {trl.amount}
                            </motion.span>
                        </div>
                    </motion.div>
                    <motion.img
                        src={trl.banner}
                        alt="TRL Banner"
                        className="w-full  h-auto rounded-xl mb-6 shadow-lg"
                        initial={{ opacity: 1 }}
                        animate={{ opacity: [1, 0, 1] }}
                        // transition={{
                        //     duration: 1,
                        //     repeat: Infinity,
                        //     repeatType: 'loop',
                        //     ease: 'easeInOut'
                        // }}
                    />



                    <motion.div
                        variants={cardVariants}
                        className="bg-gradient-to-r from-orange-100 to-cyan-50 dark:bg-gray-800  rounded-xl shadow-sm border border-gray-100 p-6 mb-8"
                    >
                        <h3 className="flex items-center text-lg font-semibold text-gray-900 mb-4">
                            <FiFileText className="mr-2 text-orange-500" />
                            Description
                        </h3>
                        <p className="text-gray-700 whitespace-pre-line leading-relaxed">
                            {trl.description}
                        </p>
                    </motion.div>

                    <motion.div
                        variants={cardVariants}
                        className="bg-gradient-to-r from-orange-100 to-cyan-50 dark:bg-gray-800  rounded-xl shadow-sm border border-gray-100 p-6"
                    >
                        <h3 className="flex items-center text-lg font-semibold text-gray-900 mb-4">
                            <FiList className="mr-2 text-orange-500" />
                            Requirements
                        </h3>
                        <ul className="space-y-3">
                            {trl.requirement.split('\n').map((req: string, i: number) => (
                                <motion.li
                                    key={i}
                                    className="flex items-start"
                                    variants={itemVariants}
                                >
                                    <span className="flex-shrink-0 bg-orange-100 text-orange-600 rounded-full p-1 mr-3 mt-0.5">
                                        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                        </svg>
                                    </span>
                                    <span className="text-gray-700">{req}</span>
                                </motion.li>
                            ))}
                        </ul>
                    </motion.div>

                    <motion.div
                        variants={itemVariants}
                        className="mt-8 pt-6 border-t border-gray-100 flex justify-end"
                    >
                        <button className="px-6 py-2 bg-orange-600 hover:bg-orange-700 text-white font-medium rounded-lg transition-colors shadow-sm">
                            Apply for Funding
                        </button>
                    </motion.div>
                </>
            )}
        </motion.div>
    );
}