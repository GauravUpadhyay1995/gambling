"use client";

import { useEffect, useState } from 'react';
import Header from '@/components/home/Header';
import Footer from '@/components/home/Footer';
import ScrollAnimation from '@/components/common/ScrollAnimation';
import Carousel from '@/components/carousel/carousel';
import ScrollLinked from '@/components/wave/scrollLinked';
// import ImportantDocuments from './(frontend)/docs-links/page';
import { motion } from "framer-motion";
// import NewsDisplay from './(frontend)/news/page';
import Feature from '@/components/common/Feature';
import Review from '@/components/common/Review';
import Market from '@/components/common/Market';
import Rating from '@/components/common/Rating';

export default function HomePage() {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    const images = [
        {
            title: "AUTO DEPOSIT FEATURE",
            subtitle: `${process.env.NEXT_PUBLIC_COMPANY_NAME} App Have Auto Deposit System In Wallet.`,
            bgImage: "/images/gambling/g-1.jpg",
            // cta: "Learn More",
            // ctaLink: "/programs/rehabilitation"
        },
        {
            title: "24×7 HOURS WITHDRAWAL",
            subtitle: `${process.env.NEXT_PUBLIC_COMPANY_NAME} App Have Automatically Withdrawal 24×7 Hours In 30 Minutes From Raise Withdrawal Request By Players`,
            bgImage: "/images/gambling/g-2.jpg",
            // cta: "Explore Campus",
            // ctaLink: "/infrastructure"
        },
        {
            title: "FASTEST RESULT UPDATE",
            subtitle: "Very Fast Result Update Like Dpboss.",
            bgImage: "/images/gambling/g-3.jpg",
            // cta: "See Our Tech",
            // ctaLink: "/facilities/diagnostics"
        },
        {
            title: "100% SAFE & SECURE",
            subtitle: "No Data Leak From Application",
            bgImage: "/images/gambling/g-4.jpg",
            // cta: "See How It Works",
            // ctaLink: "/research/bio-imaging-ai"
        },
        {
            title: "100% TRUSTED APPLICATION",
            subtitle: `${process.env.NEXT_PUBLIC_COMPANY_NAME} APP Is India's Most Trusted Application`,
            bgImage: "/images/gambling/g-5.jpg",
            // cta: "Explore Solutions",
            // ctaLink: "/research/assistive-tech"
        },
        {
            title: "24×7 CUSTOMER SUPPORT",
            subtitle: "Admin Support Available 24×7 Hours",
            bgImage: "/images/gambling/g-6.jpg",
            // cta: "Discover Devices",
            // ctaLink: "/projects/wearables"
        },
        {

            bgImage: "/images/gambling/g-7.jpg",

        }
        ,
        {

            bgImage: "/images/gambling/g-8.jpg",

        }
    ];



    return (
        <div className="min-h-screen flex flex-col  text-gray-800 dark:text-white dark:from-gray-900 dark:to-gray-800">
            <Header />

            <main className="flex-grow bg-gradient-to-br from-orange-400 to-blue-900">
                <ScrollLinked />

                {/* Hero Section */}
                <section className=" relative min-h-screen pt-24 overflow-hidden shadow-xl">
                    <Carousel images={images} />
                </section>
                <Feature />
                <Rating />
                <Review />
                <Market />
            </main>
            <Footer />
        </div>
    );
}

// environment variables
// JWT_SECRET=your_super_secret_key_here
// NEXT_PUBLIC_API_URL=http://localhost:3000/api
// MONGODB_URI="mongodb://localhost:27017"
// MONGODB_DB="db_wincoe"
