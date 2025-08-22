"use client";

import { motion } from "framer-motion";
import {
    FaBolt,
    FaClock,
    FaTachometerAlt,
    FaLock,
    FaCheckCircle,
    FaHeadset,
} from "react-icons/fa";
import Image from "next/image";

const features = [
    {
        icon: <FaBolt className="text-3xl text-orange-500" />,
        title: "AUTO DEPOSIT FEATURE",
        desc: "App has Auto Deposit System in Wallet.",
    },
    {
        icon: <FaClock className="text-3xl text-blue-500" />,
        title: "24×7 HOURS WITHDRAWAL",
        desc: "Withdraw 24×7 within 30 minutes from raised request.",
    },
    {
        icon: <FaTachometerAlt className="text-3xl text-green-500" />,
        title: "FASTEST RESULT UPDATE",
        desc: "Very fast result updates like deposits.",
    },
    {
        icon: <FaLock className="text-3xl text-pink-500" />,
        title: "100% SAFE & SECURE",
        desc: "No data leak from the application.",
    },
    {
        icon: <FaCheckCircle className="text-3xl text-yellow-500" />,
        title: "100% TRUSTED APPLICATION",
        desc: "India's most trusted application.",
    },
    {
        icon: <FaHeadset className="text-3xl text-purple-500" />,
        title: "24×7 CUSTOMER SUPPORT",
        desc: "Admin support available 24×7 hours.",
    },
];

export default function FeatureSection() {
    return (
        <section className="py-16 ">
            <div className="max-w-7xl mx-auto px-6 lg:px-8">
                <motion.h2
                    className="text-4xl font-bold text-white text-center mb-14"
                    initial={{ opacity: 0, y: -30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    Application Features
                </motion.h2>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                    {/* Left Column - Features */}
                    <div className="space-y-8">
                        {features.map((feature, index) => (
                            <motion.div
                                key={index}
                                className="flex items-start gap-4"
                                initial={{ opacity: 0, x: -50 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.15, duration: 0.5 }}
                            >
                                <div className="flex-shrink-0">{feature.icon}</div>
                                <div>
                                    <h3 className="text-lg font-semibold text-white">
                                        {feature.title}
                                    </h3>
                                    <p className="text-white/80 text-sm">{feature.desc}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    {/* Right Column - Image */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.6 }}
                        className="flex justify-center"
                    >
                        <Image
                            src="/images/feature.png" // replace with your actual image path
                            alt="App Preview"
                            width={350}
                            height={600}
                            className="rounded-2xl shadow-2xl"
                        />
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
