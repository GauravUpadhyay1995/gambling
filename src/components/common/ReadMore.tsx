'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

type ReadMoreProps = {
    itemId: string | number;
};

const ReadMoreButton = ({ itemId }: ReadMoreProps) => {
    const router = useRouter();
    const [scaleOnHover, setScaleOnHover] = useState(1);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            setScaleOnHover(window.innerWidth > 640 ? 1.05 : 1);
        }
    }, []);

    return (
        <motion.button
            whileHover={{ scale: scaleOnHover }}
            whileTap={{ scale: 0.95 }}
            onClick={() => router.push(`/news/news-details/${itemId}`)}
            className="text-xs sm:text-sm text-orange-600 font-medium hover:text-orange-800"
        >
            Read More →
        </motion.button>
    );
};

export default ReadMoreButton;
