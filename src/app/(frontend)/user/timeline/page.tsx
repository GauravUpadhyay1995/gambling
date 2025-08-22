'use client';
// import { motion } from 'framer-motion';
import AnimatedTimeline from '@/components/timeline/AnimatedTimeline';
import WelcomeHeader from '@/components/dashboard/WelcomeHeader';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useAuth } from '@/context/AuthContext';
import { useState, useEffect, useRef } from 'react';
// import {
//     UserIcon,
//     CheckCircleIcon,
//     CreditCardIcon,
//     GiftIcon,
//     CalendarIcon,
//     StarIcon, ClockIcon

// } from 'lucide-react';
import Head from 'next/head';
import { User } from '@/types/User';
import ScrollAnimation from '@/components/common/ScrollAnimation';

interface Timeline {
    _id: string;
    customer_id: string;
    action: string;
    title: string;
    description: string;
    createdAt: string;
    updatedAt: string;
}


export default function Home() {
    const { user } = useAuth();
    useEffect(() => {
        document.title = user ? `Activity - ${user?.customer} | WIN CoE` : 'Activity | WIN CoE';
    }, [user]);
    // const icons = [
    //     UserIcon,
    //     CheckCircleIcon,
    //     CreditCardIcon,
    //     GiftIcon,
    //     CalendarIcon,
    //     StarIcon, ClockIcon
    // ];
    const hasFetched = useRef(false);

    const [timeline, setTimeline] = useState<Timeline[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchTimeline = async () => {
        try {
            const response = await fetch('/api/v1/timeline', {
                credentials: 'include',
            });
            const data = await response.json();
            if (data.success) {
                setTimeline(data.data); // make sure your API returns { success, data: [...] }
            }
        } catch (error) {
            console.error('Error fetching timeline:', error);
        } finally {
            setLoading(false);
            hasFetched.current = true;
        }
    };

    useEffect(() => {
        if (hasFetched.current) return;
        fetchTimeline();
    }, []);

    return (
        <DashboardLayout>
            <Head>
                <title>Timeline</title>
            </Head>
            <main className="flex-1 flex flex-col">
                <div className="sticky top-0 z-20 bg-white dark:bg-gray-900 backdrop-blur dark:border-gray-800  border-r border-gray-200 shadow-sm  ">
                    {user && <WelcomeHeader user={user as unknown as User} />}
                </div>
                <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 flex flex-col items-center min-h-screen">
                    <ScrollAnimation animation="fade" delay={200}>
                        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2 text-center animate-fadeIn">
                            Your Activity Timeline
                        </h1>
                        <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 text-center animate-fadeIn" style={{ animationDelay: '0.3s' }}>
                            Track your recent actions, rewards, and important events here.
                        </p>
                    </ScrollAnimation>
                    <div className="w-full max-w-2xl mx-auto">
                        {loading ? (
                            <ScrollAnimation animation="slideUp" delay={300}>
                                <div className="p-6 rounded-2xl shadow-xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-700 flex flex-col gap-6 animate-fadeIn">
                                    {[1, 2, 3].map((_, i) => (
                                        <div key={i} className="flex items-center gap-4 animate-pulse-subtle">
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-purple-400 to-pink-400 opacity-30" />
                                            <div className="flex-1">
                                                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-2" />
                                                <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded w-1/3" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </ScrollAnimation>
                        ) : (
                            <ScrollAnimation animation="slideUp" delay={300}>
                                <AnimatedTimeline items={timeline} />
                            </ScrollAnimation>
                        )}
                    </div>
                </section>
            </main>
        </DashboardLayout>
    );
}
