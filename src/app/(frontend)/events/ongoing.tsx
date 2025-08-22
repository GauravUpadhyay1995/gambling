'use client';

import { motion, useAnimation, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useInView } from 'react-intersection-observer';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const OngoingEvent = ({
    title,
    startDate,
    endDate,
    description,
    image,
    ctaText = "Explore",
    delay = 0,
    eventID
}) => {
    const [timeLeft, setTimeLeft] = useState({
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0
    });
    const router = useRouter();
    const [imageRef, imageInView] = useInView({ threshold: 0.3, triggerOnce: false });
    const [contentRef, contentInView] = useInView({ threshold: 0.3, triggerOnce: false });

    const imageControls = useAnimation();
    const contentControls = useAnimation();

    useEffect(() => {
        const updateTimer = () => {
            const now = new Date().getTime();
            const future = new Date(endDate).getTime();
            const diff = future - now;

            if (diff > 0) {
                setTimeLeft({
                    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
                    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
                    minutes: Math.floor((diff / 1000 / 60) % 60),
                    seconds: Math.floor((diff / 1000) % 60),
                });
            }
        };

        updateTimer();
        const interval = setInterval(updateTimer, 1000);
        return () => clearInterval(interval);
    }, [endDate]);

    useEffect(() => {
        if (imageInView) imageControls.start('visible');
        else imageControls.start('hidden');
    }, [imageInView, imageControls]);

    useEffect(() => {
        if (contentInView) contentControls.start('visible');
        else contentControls.start('hidden');
    }, [contentInView, contentControls]);

    const formatTime = (val) => (val < 10 ? `0${val}` : val);

    return (
        <div className="px-4 md:px-0 max-w-7xl mx-auto">
            {/* Top Header with View All */}
            {/* <div className="flex items-center justify-end mb-4">

                <Link
                    href="/events"
                    className="text-sm font-medium text-orange-600 hover:text-orange-800 transition-colors"
                >
                    View All →
                </Link>
            </div> */}

            <div className="flex flex-col md:flex-row gap-4 bg-gradient-to-r from-orange-50 to-cyan-50 rounded-2xl p-4">
                {/* Image Section */}
                <motion.div
                    ref={imageRef}
                    initial="hidden"
                    animate={imageControls}
                    variants={{
                        hidden: { opacity: 0, scale: 0.95, x: -40 },
                        visible: {
                            opacity: 1,
                            scale: 1,
                            x: 0,
                            transition: {
                                delay: delay * 0.2,
                                duration: 0.8,
                                ease: 'easeOut'
                            }
                        }
                    }}
                    className="md:w-2/5 relative h-64 md:h-auto"
                >
                    <Image
                        src={image}
                        alt={title}
                        fill
                        className="object-cover rounded-2xl"
                        sizes="(max-width: 768px) 100vw, 40vw"
                    />
                    <motion.div
                        className="absolute bottom-4 left-4 bg-orange-600 text-white px-3 py-1 rounded-full text-sm font-medium shadow-lg shadow-orange-400 animate-bounce border border-white/30 backdrop-blur-sm"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6, duration: 0.5 }}
                    >
                        {new Date(startDate).toLocaleDateString('en-US', {
                            month: 'long',
                            day: 'numeric',
                            year: 'numeric',
                        })}
                    </motion.div>
                </motion.div>

                {/* Content Section */}
                <motion.div
                    ref={contentRef}
                    initial="hidden"
                    animate={contentControls}
                    variants={{
                        hidden: { opacity: 0, x: 40 },
                        visible: {
                            opacity: 1,
                            x: 0,
                            transition: {
                                delay: delay * 0.2,
                                duration: 0.8,
                                ease: 'easeOut'
                            }
                        }
                    }}
                    className="md:w-3/5 p-6 md:p-8"
                >
                    <motion.h3 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-3">
                        {title}
                    </motion.h3>

                    <motion.p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
                        {description.length > 180 ? description.slice(0, 180) + '...' : description}
                    </motion.p>

                    {/* Countdown Timer */}
                    <div className="mb-6">
                        <h4 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-2">
                            EVENT ENDS IN:
                        </h4>
                        <div className="flex space-x-2">
                            {Object.entries(timeLeft).map(([unit, value]) => (
                                <div
                                    key={unit}
                                    className="flex flex-col items-center bg-gray-100 dark:bg-gray-700 rounded-lg p-2 min-w-[60px] shadow-md shadow-orange-300 perspective-[600px]"
                                >
                                    <AnimatePresence mode="wait" initial={false}>
                                        <motion.span
                                            key={value}
                                            initial={{ rotateX: 90, opacity: 0 }}
                                            animate={{ rotateX: 0, opacity: 1 }}
                                            exit={{ rotateX: -90, opacity: 0 }}
                                            transition={{ duration: 0.5 }}
                                            className="text-2xl font-bold text-gray-900 dark:text-white block"
                                        >
                                            {formatTime(value)}
                                        </motion.span>
                                    </AnimatePresence>
                                    <span className="text-xs text-gray-500 dark:text-gray-400 uppercase">
                                        {unit}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* CTA Button */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4, duration: 0.5 }}
                    >
                        <button className="relative overflow-hidden group bg-gradient-to-r from-orange-400 to-orange-600 text-white px-6 py-3 rounded-full font-medium"
                        onClick={() => router.push(`/events/${eventID}`)}
                         >
                            <span className="absolute inset-0 translate-x-[-100%] group-hover:translate-x-full transition-transform duration-500 ease-in-out rotate-12 blur-sm" />
                            <span className="relative z-10">{ctaText}</span>
                        </button>
                    </motion.div>
                </motion.div>
            </div>
        </div>
    );
};

export default OngoingEvent;
