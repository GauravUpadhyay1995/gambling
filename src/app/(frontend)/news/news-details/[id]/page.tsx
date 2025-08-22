'use client';

import { useEffect, use, useState } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '@/context/ThemeContext';

interface NewsItem {
    _id: string;
    title: string;
    content: string;
    bannerImage: string;
    category: string;
    createdAt: string;
    readTime: string;
    description?: string; // Added this since your response has description
}

export default function NewsDetails({ params }: { params: { id: string } }) {

    const { theme } = useTheme();
    const [news, setNews] = useState<NewsItem | null>(null);
    const [loading, setLoading] = useState(true);

    // Unwrap the params promise
    const unwrappedParams = use(params);
    const { id } = unwrappedParams;
    useEffect(() => {
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/news/${id}`)
            .then(res => res.json())
            .then(data => {
                console.log("API Response:", data);
                // Fix: Access the news data directly from data.data
                setNews(data.data || null); // Changed from data?.data?.news to data.data
                setLoading(false);
            })
            .catch(error => {
                console.error("Error fetching news:", error);
                setLoading(false);
            });
    }, [id]);

    if (loading) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center text-lg">
                Loading news...
            </div>
        );
    }

    if (!news) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center text-lg">
                News not found
            </div>
        );
    }

    // Use description if content is empty
    const newsContent = news.content || news.description || '';

    return (
        <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className={`max-w-4xl mx-auto px-4 sm:px-6 py-12 ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}
        >
            <motion.h1
                className="text-3xl sm:text-5xl font-extrabold mb-6"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
            >
                {news.title}
            </motion.h1>

            <div className="flex justify-between items-center text-sm mb-4 text-gray-500 dark:text-gray-400">
                <span>{new Date(news.createdAt).toLocaleDateString()}</span>
                {/* <span>{news.readTime || '2 min'} read</span> */}
            </div>

            <motion.img
                src={news.bannerImage}
                alt={news.title}
                className="w-full h-auto object-cover rounded-lg mb-8 shadow-md"
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.4 }}
            />

            <motion.div
                className="prose dark:prose-invert max-w-none"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                dangerouslySetInnerHTML={{ __html: newsContent }}
            />
        </motion.div>
    );
}