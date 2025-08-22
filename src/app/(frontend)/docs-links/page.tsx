'use client';
import { MdDateRange } from 'react-icons/md';
import { motion, useAnimation, AnimatePresence } from 'framer-motion';
import { useEffect } from 'react';
import { useInView } from 'react-intersection-observer';
import { FaFilePdf, FaFileAlt } from 'react-icons/fa';
import { BsFillFileEarmarkTextFill } from 'react-icons/bs';
import { MdOutlineDownload } from 'react-icons/md';
import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function ImportantDocuments() {
    const [ref, inView] = useInView({ threshold: 0, triggerOnce: false });
    const controls = useAnimation();
    const { data, error, isLoading } = useSWR(
        `${process.env.NEXT_PUBLIC_API_URL}/documents/list?from=frontend`,
        fetcher
    );

    function isNewlyPublished(publishDate: string): boolean {
        const now = new Date();
        const published = new Date(publishDate);
        const diffMs = Math.abs(now.getTime() - published.getTime());
        return diffMs <= 24 * 60 * 60 * 1000;
    }

    function isRecentlyUpdated(updateDate: string): boolean {
        const now = new Date();
        const updated = new Date(updateDate);
        const diffMs = Math.abs(now.getTime() - updated.getTime());
        return diffMs <= 7 * 24 * 60 * 60 * 1000; // Within 7 days
    }

    function formatTimeAgo(dateString: string): string {
        const now = new Date();
        const date = new Date(dateString);
        const diffMs = now.getTime() - date.getTime();
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

        if (diffHours < 24) {
            return `${diffHours}H AGO`;
        }
        const diffDays = Math.floor(diffHours / 24);
        return `${diffDays}D AGO`;
    }

    useEffect(() => {
        controls.start(inView ? 'visible' : 'hidden');
    }, [inView, controls]);

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.15,
                delayChildren: 0.2
            }
        }
    };

    const cardVariants = {
        hidden: { opacity: 0, y: 40, rotate: -5, scale: 0.95 },
        visible: {
            opacity: 1,
            y: 0,
            rotate: 0,
            scale: 1,
            transition: {
                duration: 0.7,
                ease: [0.33, 1, 0.68, 1]
            }
        },
        hover: {
            scale: 1.05,
            y: -10,
            rotate: 1,
            transition: {
                type: 'spring',
                stiffness: 300,
                damping: 10
            }
        }
    };

    const getFileType = (mimetype: string): 'pdf' | 'text' | 'doc' | 'image' => {
        if (mimetype.includes('pdf')) return 'pdf';
        if (mimetype.includes('plain')) return 'text';
        if (mimetype.includes('msword') || mimetype.includes('officedocument'))
            return 'doc';
        if (mimetype.includes('image')) return 'image';
        return 'doc';
    };

    const getFileIcon = (fileType: string) => {
        switch (fileType) {
            case 'pdf':
                return <FaFilePdf className="text-red-500 w-6 h-6" />;
            case 'text':
                return <BsFillFileEarmarkTextFill className="text-blue-500 w-6 h-6" />;
            case 'doc':
                return <FaFileAlt className="text-green-500 w-6 h-6" />;
            case 'image':
                return <FaFileAlt className="text-yellow-500 w-6 h-6" />;
            default:
                return <FaFileAlt className="text-gray-500 w-6 h-6" />;
        }
    };

    if (isLoading) return <LoadingState />;
    if (error) return <ErrorState />;
    if (!data?.data?.docs?.length) return <EmptyState />;

    return (
        <section className="py-10 px-4 sm:px-6" ref={ref}>
            <div className="container mx-auto text-center">
                <motion.h2
                    className="text-3xl sm:text-4xl font-bold mb-8 sm:mb-10 text-orange-600 flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4"
                    initial={{ opacity: 0, y: -30 }}
                    animate={controls}
                    variants={{
                        hidden: { opacity: 0, y: -30 },
                        visible: {
                            opacity: 1,
                            y: 0,
                            transition: { duration: 0.8, ease: 'easeOut' }
                        }
                    }}
                >
                    <motion.svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="#ec820aff"
                        viewBox="0 0 50 50"
                        className="w-8 h-8 sm:w-10 sm:h-10"
                        initial={{ scale: 0 }}
                        animate={controls}
                        variants={{
                            hidden: { scale: 0 },
                            visible: {
                                scale: 1,
                                transition: { delay: 0.3, type: 'spring', stiffness: 200 }
                            }
                        }}
                    >
                        <path d="M 30.398438 2 L 7 2 L 7 48 L 43 48 L 43 14.601563 Z M 15 28 L 31 28 L 31 30 L 15 30 Z M 35 36 L 15 36 L 15 34 L 35 34 Z M 35 24 L 15 24 L 15 22 L 35 22 Z M 30 15 L 30 4.398438 L 40.601563 15 Z" />
                    </motion.svg>
                    Links - Documents
                </motion.h2>

                <motion.div
                    className="space-y-12 max-w-6xl mx-auto"
                    initial="hidden"
                    animate={controls}
                    variants={containerVariants}
                    viewport={{ amount: 0.3 }}
                >
                    {data.data.docs.map((group: any, groupIndex: number) => (
                        <div key={group._id} className="mb-12">
                            {/* Title and Metadata Section */}
                            <div className="flex flex-col items-center mb-6">
                                <div className="flex items-center gap-2 mb-2">
                                    <h3 className="text-xl sm:text-2xl font-bold text-[#ec4a0a] text-center">
                                        {group.title}
                                    </h3>
                                    {isNewlyPublished(group.publishDate) && (
                                        <motion.img
                                            src="/images/new-badge.gif"
                                            alt="New Badge"
                                            className="w-6 h-6 sm:w-8 sm:h-8"
                                            initial={{ opacity: 1 }}
                                            animate={{ opacity: [1, 0, 1] }}
                                            transition={{
                                                duration: 1,
                                                repeat: Infinity,
                                                repeatType: 'loop'
                                            }}
                                        />
                                    )}
                                </div>

                                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                                    <div className="flex items-center gap-1">
                                        <MdDateRange className="w-4 h-4" />
                                        <span>
                                            {new Date(group.publishDate).toLocaleDateString('en-IN', {
                                                day: 'numeric',
                                                month: 'short',
                                                year: 'numeric'
                                            })}
                                        </span>
                                    </div>

                                    {group.updatedAt && isRecentlyUpdated(group.updatedAt) && (
                                        <span className="ml-2 px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full text-xs font-medium">
                                            UPDATED {formatTimeAgo(group.updatedAt)}
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Description Section */}
                            {group.description && (
                                <div className="mb-8 px-4 sm:px-0">
                                    <div
                                        className="text-sm sm:text-base text-gray-700 dark:text-gray-300 leading-relaxed text-center max-w-3xl mx-auto"
                                        dangerouslySetInnerHTML={{
                                            __html: group.description
                                                // Ensure Summernote's HTML has proper spacing between paragraphs
                                                .replace(/<p>/g, '<p class="mb-4">')
                                                .replace(/<br>/g, '<br><br>')
                                        }}
                                    />
                                </div>
                            )}

                            {/* Documents Grid */}
                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-6">
                                {group.documents.map((doc: any, index: number) => (
                                    <motion.div
                                        key={doc._id}
                                        className="bg-gradient-to-br from-orange-50 to-cyan-50 border border-gray-100 dark:border-gray-700 rounded-lg sm:rounded-xl p-4 sm:p-6 shadow-sm sm:shadow-md hover:shadow-lg cursor-pointer group relative overflow-hidden hover:border-2 sm:hover:border-4 hover:border-orange-600"
                                        variants={cardVariants}
                                        whileHover="hover"
                                        whileTap={{ scale: 0.98 }}
                                    >
                                        <AnimatePresence>
                                            <motion.div
                                                className="absolute -top-8 -right-8 sm:-top-10 sm:-right-10 w-16 h-16 sm:w-24 sm:h-24 rounded-full bg-orange-100 dark:bg-orange-900 opacity-10 group-hover:opacity-20"
                                                animate={{ rotate: 360 }}
                                                transition={{
                                                    repeat: Infinity,
                                                    duration: 20,
                                                    ease: 'linear',
                                                    repeatType: 'loop'
                                                }}
                                            />
                                        </AnimatePresence>

                                        <motion.div
                                            className="flex items-center justify-center mb-2 sm:mb-4"
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            transition={{
                                                delay: 0.3 + index * 0.1,
                                                type: 'spring',
                                                stiffness: 250
                                            }}
                                        >
                                            {getFileIcon(getFileType(doc.mimetype))}
                                        </motion.div>

                                        <motion.a
                                            href={doc.url}
                                            download
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-1 sm:gap-2 text-orange-600 dark:text-orange-400 hover:text-orange-800 dark:hover:text-orange-300 text-xs sm:text-sm font-medium transition-colors"
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.5 + index * 0.1 }}
                                        >
                                            <motion.span
                                                animate={{ y: [0, -3, 0] }}
                                                transition={{
                                                    duration: 1.5,
                                                    repeat: Infinity,
                                                    ease: 'easeInOut'
                                                }}
                                            >
                                                <MdOutlineDownload className="w-3 h-3 sm:w-4 sm:h-4" />
                                            </motion.span>
                                            Download
                                        </motion.a>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
}

// LoadingState, ErrorState, and EmptyState components remain the same as previous version

function LoadingState() {
    return (
        <section className="py-10">
            <div className="container mx-auto px-4 text-center">
                <div className="animate-pulse">
                    <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mx-auto mb-10"></div>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-10 max-w-6xl mx-auto">
                        {[...Array(3)].map((_, i) => (
                            <div
                                key={i}
                                className="bg-gray-100 dark:bg-gray-800 rounded-xl p-6 h-64"
                            >
                                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded-full w-8 mx-auto mb-4"></div>
                                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mx-auto mb-3"></div>
                                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mx-auto"></div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}

function ErrorState() {
    return (
        <section className="py-10">
            <div className="container mx-auto px-4 text-center">
                <div className="text-red-500 mb-4">Failed to load documents</div>
                <button
                    onClick={() => window.location.reload()}
                    className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600"
                >
                    Retry
                </button>
            </div>
        </section>
    );
}

function EmptyState() {
    return (
        <section className="py-10">
            <div className="container mx-auto px-4 text-center">
                <div className="text-gray-500">No documents available</div>
            </div>
        </section>
    );
}
