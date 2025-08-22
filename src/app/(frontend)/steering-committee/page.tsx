'use client';

import { motion } from 'framer-motion';

import { useEffect, useState } from 'react';
import SteeringCommittee from '@/components/common/SteeringCommittee';
const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0 },
};

const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.2,
        },
    },
};

const staggerItem = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.6,
        },
    },
};

type Particle = {
    width: number;
    height: number;
    left: string;
    top: string;
    x: number;
    y: number;
    duration: number;
};

export default function About() {
    const [particles, setParticles] = useState<Particle[]>([]);

    useEffect(() => {
        const generated = [...Array(8)].map(() => ({
            width: Math.random() * 10 + 5,
            height: Math.random() * 10 + 5,
            left: Math.random() * 100 + '%',
            top: Math.random() * 100 + '%',
            x: (Math.random() - 0.5) * 50,
            y: (Math.random() - 0.5) * 100,
            duration: Math.random() * 10 + 10,
        }));
        setParticles(generated);
    }, []);

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50/70 via-cyan-50/70 to-blue-50/70">
            <main className="overflow-hidden">
                <section className="relative h-[70vh] min-h-[610px] overflow-hidden">
                    <motion.div
                        className="absolute inset-0 bg-[url('/images/about/about.jpg')] bg-cover bg-center"
                        initial={{ scale: 1.2 }}
                        animate={{ scale: 1 }}
                        transition={{ duration: 1.5, ease: [0.33, 1, 0.68, 1] }}
                    >
                        <motion.div
                            className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/60 to-black/80"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 1 }}
                        />
                    </motion.div>

                    {particles.map((p, i) => (
                        <motion.div
                            key={i}
                            className="absolute rounded-full bg-white/10"
                            style={{
                                width: `${p.width}px`,
                                height: `${p.height}px`,
                                left: p.left,
                                top: p.top,
                            }}
                            animate={{
                                y: [0, p.y],
                                x: [0, p.x],
                                opacity: [0.5, 0.8, 0.5],
                            }}
                            transition={{
                                duration: p.duration,
                                repeat: Infinity,
                                repeatType: 'reverse',
                                ease: 'linear',
                            }}
                        />
                    ))}

                    <div className="relative z-10 h-full flex items-center justify-center px-4">
                        <motion.div
                            initial="hidden"
                            animate="visible"
                            variants={staggerContainer}
                            className="text-center max-w-6xl mx-auto"
                        >
                            <div className="overflow-hidden">
                                <motion.h1
                                    className="text-5xl md:text-7xl lg:text-8xl font-extrabold text-white mb-6"
                                    initial={{ y: 100 }}
                                    animate={{ y: 0 }}
                                    transition={{
                                        duration: 1,
                                        ease: [0.33, 1, 0.68, 1],
                                    }}
                                >
                                   
                                    <span className="inline-block">Meet Our </span>
                                    <span className="inline-block bg-gradient-to-r from-orange-400 to-cyan-300 text-transparent bg-clip-text">
                                      Leadership
                                    </span>
                                </motion.h1>
                            </div>

                            <motion.div
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4, duration: 0.8, ease: [0.33, 1, 0.68, 1] }}
                            >
                                <p className="text-xl md:text-2xl lg:text-3xl text-gray-200 max-w-3xl mx-auto font-medium">
                                     and   <span className="text-orange-300">Steering</span> {' '}
                                    <span className="text-cyan-300">Committee</span>.
                                </p>
                            </motion.div>

                           
                        </motion.div>
                    </div>

                    <motion.div
                        className="absolute bottom-10 left-1/2 -translate-x-1/2"
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: [0, 1, 0], y: [0, 15, 0] }}
                        transition={{
                            duration: 2.5,
                            repeat: Infinity,
                            ease: 'easeInOut',
                        }}
                    >
                        <svg
                            className="w-8 h-8 text-orange-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                        </svg>
                    </motion.div>
                </section>

               
                    <motion.div
                        className=" max-w-5xl mx-auto"
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, margin: "-100px" }}
                        variants={staggerContainer}
                    >
                        <SteeringCommittee />
                    </motion.div>

               

            </main>
        </div>
    );
}
