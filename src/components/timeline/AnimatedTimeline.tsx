'use client';

import { motion, useInView } from 'framer-motion';
import React, { useRef } from 'react';
import {
    UserIcon,
    CheckCircleIcon,
    CreditCardIcon,
    GiftIcon,
    CalendarIcon,
    StarIcon, ClockIcon

} from 'lucide-react';

interface TimelineItem {
   "_id": string,
    "customer_id": string,
    "action": string,
    "title": string,
    "description": string,
    "createdAt": string,
    "updatedAt": string,
}


interface TimelineProps {
    items: TimelineItem[];
}

const icons = [
    UserIcon,
    CheckCircleIcon,
    CreditCardIcon,
    GiftIcon,
    CalendarIcon,
    StarIcon, ClockIcon
];

const itemVariants = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0 },
};

const AnimatedTimeline: React.FC<TimelineProps> = ({ items }) => {
    return (
        <div className="relative border-l-2 border-gray-300 dark:border-gray-700 pl-6">
            {items.map((item, index) => {
                const Icon = icons[index % icons.length]; // Cycle through icons
                return <TimelineItemCard item={item} key={item._id} index={index} Icon={Icon} />;
            })}
        </div>
    );
};

const TimelineItemCard: React.FC<{
    item: TimelineItem;
    index: number;
    Icon: React.ComponentType<{ className?: string }>;
}> = ({ item, index, Icon }) => {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: '-100px' });

    return (
        <>
        <motion.div
            ref={ref}
            variants={itemVariants}
            initial="hidden"
            animate={isInView ? 'visible' : 'hidden'}
            transition={{ duration: 0.6, delay: index * 0.2 }}
            className="mb-10 last:mb-0 relative"
        >
            {/* Icon instead of dot */}
            <div className="absolute -left-[50px]  bg-white dark:bg-gray-900 p-3 rounded-full shadow-md">
                <Icon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>

            {/* Card */}
            <motion.div
                whileHover={{
                    y: -5,
                    scale: 1.02,
                    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)',
                }}
                transition={{ type: 'spring', stiffness: 300 }}
                className="bg-white dark:bg-gray-900 p-4 rounded-md shadow-md 
               border border-transparent hover:border-blue-500 
               hover:shadow-[0_0_10px_2px_rgba(59,130,246,0.7)] 
               transition-all duration-300 ease-in-out"
            >
                <div className="text-sm text-gray-500 dark:text-gray-400">{new Date(item.createdAt).toLocaleString()}</div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{item.title}</h3>
                {item.description && (
                    <p className="mt-1 text-sm text-gray-700 dark:text-gray-300">{item.description}</p>
                )}
            </motion.div>
        </motion.div>
        </>
    );
};

export default AnimatedTimeline;
