'use client';

import { useEffect, useState } from 'react';
import useSWR from 'swr';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '@/context/ThemeContext';
import ReadMoreButton from '@/components/common/ReadMore';
import ScrollAnimation from '@/components/common/ScrollAnimation';

const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function NewsDisplay({ customLimit = 0 }: { customLimit?: number }) {
  const { theme } = useTheme();
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const { data, error, isLoading } = useSWR(
    `${process.env.NEXT_PUBLIC_API_URL}/news/list?customLimit=${customLimit}&from=frontend`,
    fetcher
  );

  if (error) return (
    <div className="text-center py-12">
      <p className="text-red-500">Failed to load news</p>
      <button
        onClick={() => window.location.reload()}
        className="mt-4 px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 transition"
      >
        Retry
      </button>
    </div>
  );

  if (isLoading || !data) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden animate-pulse">
            <div className="h-48 bg-gray-200 dark:bg-gray-700"></div>
            <div className="p-4 space-y-4">
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  const newsItems = data?.data?.news || [];
  const categories = ['all', ...new Set(newsItems.map((item) => item.category))];
  const featuredNews = newsItems.find((item) => item.featured);
  const filteredNews =
    activeCategory === 'all'
      ? newsItems
      : newsItems.filter((item) => item.category === activeCategory);

  const cardVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { type: 'spring', stiffness: 100, damping: 12 }
    },
    hover: { scale: 1.03, boxShadow: '0 10px 20px rgba(0,0,0,0.1)' }
  };

  const mobileCardVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.4 } },
    tap: { scale: 0.98 }
  };

  const buttonVariants = {
    rest: {
      scale: 1,
      backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff',
      color: theme === 'dark' ? '#fde68a' : '#ea580c'
    },
    hover: {
      scale: 1.05,
      backgroundColor: theme === 'dark' ? '#fb923c' : '#fcd34d'
    },
    active: {
      scale: 1,
      backgroundColor: theme === 'dark' ? '#fb923c' : '#ea580c',
      color: theme === 'dark' ? '#1f2937' : '#ffffff'
    }
  };
const sectionBgClass =
  (customLimit > 3 || customLimit==0)? theme === 'dark'
      ? 'bg-gradient-to-r from-gray-900 via-gray-950 to-black text-gray-100'
      : 'bg-gradient-to-r from-orange-50 to-cyan-50 text-gray-800'
    : '';


  return (
    <section className={`py-4 sm:py-4 ${sectionBgClass}`}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        <ScrollAnimation animation="fade" delay={400}>
          {/* Header */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-center mb-12 sm:mb-16"
          >
            <motion.h1
              initial={{ y: -30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
              className={`text-4xl sm:text-5xl font-extrabold mb-4 ${theme === 'dark' ? 'text-orange-400' : 'text-orange-600'}`}
            >
              Our Latest News & Updates
            </motion.h1>
            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className={`text-lg sm:text-xl max-w-2xl mx-auto ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}
            >
              Stay informed with the newest breakthroughs, admissions, events, and achievements from our center.
            </motion.p>
          </motion.div>

          {/* Categories */}
          <motion.div
            className="flex overflow-x-auto pb-4 mb-12 gap-3 justify-start sm:justify-center scrollbar-hide"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            {categories.map((category) => (
              <motion.button
                key={category}
                variants={buttonVariants}
                initial="rest"
                whileHover="hover"
                animate={activeCategory === category ? 'active' : 'rest'}
                onClick={() => setActiveCategory(category)}
                className="flex-shrink-0 px-6 py-2 rounded-full text-base font-medium transition-all duration-300 ease-in-out whitespace-nowrap"
              >
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </motion.button>
            ))}
          </motion.div>

          {/* Featured */}
          {featuredNews && activeCategory === 'all' && (
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.4 }}
              className="mb-16"
            >
              <div className={`rounded-3xl overflow-hidden shadow-2xl transform hover:scale-[1.005] transition-all duration-500 ${theme === 'dark' ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-100'}`}>
                <div className="md:flex flex-col md:flex-row">
                  <div className="md:w-1/2">
                    <motion.img
                      whileHover={{ scale: 1.05 }}
                      transition={{ duration: 0.5 }}
                      className="h-64 sm:h-72 w-full object-cover md:h-full md:min-h-[350px]"
                      src={featuredNews.bannerImage}
                      alt={featuredNews.title}
                    />
                  </div>
                  <div className={`p-6 md:p-8 md:w-1/2 flex flex-col justify-center ${theme === 'dark' ? 'bg-gray-800 text-gray-100' : 'bg-white text-gray-800'}`}>
                    <div className="uppercase tracking-wide text-sm font-semibold mb-2">
                      <span className={`px-3 py-1 rounded-full ${theme === 'dark' ? 'bg-indigo-700 text-indigo-200' : 'bg-indigo-100 text-indigo-800'}`}>
                        Featured • {featuredNews.category}
                      </span>
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-extrabold mb-3 leading-tight">{featuredNews.title}</h2>
                    <p className="text-base mb-4 line-clamp-3">{featuredNews.excerpt}</p>
                    <div className="flex justify-between items-center mt-auto pt-4 border-t border-gray-200 dark:border-gray-700">
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {new Date(featuredNews.createdAt).toLocaleDateString()} •
                      
                      </span>
                      <ReadMoreButton itemId={featuredNews._id} />
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* News Grid */}
          <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            <AnimatePresence>
              {filteredNews
                .filter((item) => !item.featured || activeCategory !== 'all')
                .map((item, index) => (
                  <motion.div
                    key={item._id}
                    layout
                    initial="hidden"
                    animate="visible"
                    exit="hidden"
                    whileHover={!isMobile ? 'hover' : undefined}
                    whileTap={isMobile ? 'tap' : undefined}
                    variants={isMobile ? mobileCardVariants : cardVariants}
                    transition={{ duration: 0.4, delay: index * 0.05 }}
                    className={`rounded-2xl overflow-hidden shadow-lg transform ${theme === 'dark' ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-100'}`}
                  >
                    <div className="h-48 sm:h-56 overflow-hidden">
                      <motion.img
                        whileHover={!isMobile ? { scale: 1.1 } : {}}
                        transition={{ duration: 0.5 }}
                        className="w-full h-full object-cover"
                        src={item.bannerImage}
                        alt={item.title}
                      />
                    </div>
                    <div className="p-5 flex flex-col h-[calc(100%-15rem)]">
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-xs font-semibold px-3 py-1 rounded-full bg-purple-100 text-purple-800 dark:bg-purple-700 dark:text-purple-200">
                          {item.category}
                        </span>
                        {/* <span className="text-xs text-gray-500 dark:text-gray-400">
                          {item.readTime || '2 min'} read
                        </span> */}
                      </div>
                      <h3 className="text-lg sm:text-xl font-bold mb-2 leading-tight">{item.title}</h3>
                      <p className="text-sm mb-4 line-clamp-3 flex-grow">{item.excerpt}</p>
                      <div className="flex justify-between items-center mt-auto pt-3 border-t border-gray-200 dark:border-gray-700">
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {new Date(item.createdAt).toLocaleDateString()}
                        </span>
                        <ReadMoreButton itemId={item._id} />
                      </div>
                    </div>
                  </motion.div>
                ))}
            </AnimatePresence>
          </motion.div>
        </ScrollAnimation>
      </div>
    </section>
  );
}
