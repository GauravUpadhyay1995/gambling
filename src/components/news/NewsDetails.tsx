'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

type NewsDetailsProps = {
  title: string;
  content: string;
  imageUrl?: string;
  publishedAt: string;
};

const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0 },
};

const NewsDetails: React.FC<NewsDetailsProps> = ({
  title,
  content,
  imageUrl,
  publishedAt,
}) => {
  const router = useRouter();
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
    window.scrollTo(0, 0);
  }, []);

  if (!hasMounted) return null;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 min-h-[80vh] rounded-2xl bg-white/80 dark:bg-gray-900/80 shadow-2xl backdrop-blur-md border border-gray-200 dark:border-gray-700"
        initial="hidden"
        animate="visible"
        exit="hidden"
        variants={{
          hidden: { opacity: 0, scale: 0.95 },
          visible: { opacity: 1, scale: 1 },
        }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        {/* Back Button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          className="mb-6 text-sm font-medium px-5 py-2 rounded-lg bg-orange-500 hover:bg-orange-600 transition text-white shadow-md"
          onClick={() => router.back()}
        >
          ← Back
        </motion.button>

        {/* News Image */}
        {/* {imageUrl && (
          <motion.div
            className="mb-8 rounded-2xl overflow-hidden shadow-lg"
            variants={fadeInUp}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Image
              src={imageUrl}
              alt={title}
              width={1200}
              height={600}
              className="w-full h-auto object-cover"
            />
          </motion.div>
        )} */}

        {/* Title */}
        <motion.h1
          className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white mb-4 leading-snug"
          variants={fadeInUp}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {/* {title} */}
          Under development..... please check back later
        </motion.h1>

        {/* Date */}
        {/* <motion.p
          className="text-sm text-gray-500 dark:text-gray-400 mb-6 italic"
          variants={fadeInUp}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          Published on: {new Date(publishedAt).toLocaleDateString()}
        </motion.p> */}

        {/* Content */}
        {/* <motion.div
          className="prose dark:prose-invert prose-lg max-w-none text-gray-800 dark:text-gray-100"
          variants={fadeInUp}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <p>{content}</p>
        </motion.div> */}
      </motion.div>
    </AnimatePresence>
  );
};

export default NewsDetails;
