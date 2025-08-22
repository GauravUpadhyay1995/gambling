"use client";
import GrantCard from '@/app/(frontend)/GrantCard';
import { motion } from 'framer-motion';
import useSWR from 'swr';
import Link from 'next/link';
const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function WhatWeDo({ customLimit = 0 }: { customLimit?: number }) {
    const { data, error, isLoading } = useSWR(
        `${process.env.NEXT_PUBLIC_API_URL}/trl/list?customLimit=${customLimit}&from=frontend`,
        fetcher
    );

    if (isLoading) return <LoadingState />;

    if (error) return <ErrorState />;
    if (!data?.data?.trls?.length) return <EmptyState />;
    return (
        <div className="min-h-screen bg-gray-50 ">
            <>
                {/* Hero Section */}
                <section className="relative py-32 bg-blue-900 rounded-b-2xl">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-900/90 to-blue-800/90 rounded-b-2xl"></div>
                    <div className="relative z-10 container mx-auto px-4 text-center">
                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-4xl md:text-6xl font-bold text-white mb-6"
                        >
                            What <span className="text-blue-300">We Do</span>
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.3 }}
                            className="text-xl text-blue-100 max-w-3xl mx-auto"
                        >
                            Supporting innovation across Technology Readiness Levels (TRLs)
                        </motion.p>
                    </div>
                </section>

                {/* Grants Section */}
                <section className="py-16 container mx-auto px-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        className="max-w-4xl mx-auto text-center mb-16"
                    >
                        <h2 className="text-3xl font-bold text-orange-600  mb-4">Grant Schemes</h2>
                        <p className="text-lg text-gray-600">
                            Through regular calls for proposals, WIN CoE nurtures cutting-edge bioengineering research at IIT Delhi by offering funding, mentorship and support services in areas like diagnostics, therapeutics, MedTech and Personalized healthcare. WinCoE offer two targeted grant schemes to accelerate innovation across Technology readiness levels (TRL’s):
                        </p>
                    </motion.div>
                    {(customLimit <= 2 && customLimit > 0) && (
                        <div className="flex items-center justify-end mb-4">
                            <Link
                                href="/what-we-do"
                                className="text-sm font-medium text-orange-600 hover:text-orange-800 transition-colors"
                            >
                                View All →
                            </Link>
                        </div>
                    )}


                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
                        {data.data.trls.map((trl: any, index: number) => (
                            <GrantCard
                                key={trl._id}
                                trl_id={trl._id}
                                title={trl.title}
                                amount={trl.amount}
                                duration={trl.duration}
                                requirements={trl.requirement}
                                trlRange={trl.tag}
                                delay={index * 0.1}
                                color='orange'
                            />
                        ))}

                        {/* <GrantCard

                            title="Translational Grant (T-Grant)"
                            amount="Up to ₹75 Lakhs/year"
                            duration="Maximum 2 years"
                            requirements={[
                                "TRL 5 → TRL 7 (Validation to clinical trial)",
                                "Clinical partner and preferably industry partner required"
                            ]}
                            trlRange="TRL 5-7"
                            delay={0.2}

                        /> */}

                    </div>

                    <motion.div
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ delay: 0.6, duration: 0.8 }}
                        className=" max-w-6xl mx-auto mt-16 bg-gradient-to-r from-orange-50 to-cyan-50 dark:from-gray-700 dark:to-gray-800 p-8 rounded-3xl shadow-lg border border-gray-200 dark:border-gray-700"
                    >
                        <div className="flex flex-col md:flex-row items-center">
                            <div className="md:w-2/3 mb-6 md:mb-0 md:pr-8">
                                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Our Comprehensive Support</h3>
                                <p className="text-gray-700 dark:text-gray-300">
                                    Beyond funding, WIN CoE provides comprehensive support including mentorship from industry experts, access to state-of-the-art facilities, IP guidance, and connections to potential investors and industry partners.
                                </p>
                            </div>
                            {/* <div className="md:w-1/3 flex justify-center">
                                <button className="px-8 py-3 bg-gradient-to-r from-orange-500 to-cyan-500 text-white rounded-full font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                                    View Current RFPs
                                </button>
                            </div> */}
                        </div>
                    </motion.div>
                </section>
            </>

        </div>
    );
}

function ErrorState() {
    return (
        <section className="py-10">
            <div className="container mx-auto px-4 text-center">
                <div className="text-red-500 mb-4">Failed to load TRL</div>
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
                <div className="text-gray-500">No TRL available</div>
            </div>
        </section>
    );
}
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
