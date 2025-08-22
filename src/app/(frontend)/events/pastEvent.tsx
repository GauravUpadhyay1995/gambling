"use client";

import EventCard from "@/components/videos/EventCards";
import { useRef, useEffect } from "react";
import { motion, useAnimation } from "framer-motion";
import { useInView } from "react-intersection-observer";
import Link from 'next/link';
type Event = {
  title: string;
  date: string;
  description: string;
  image: string;
  eventID:string;
};
export default function PastEvents({ events = [] }: { events: Event[] }) {
  const containerRef = useRef(null);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3,
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 50, rotate: -4, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      rotate: 0,
      scale: 1,
      transition: {
        duration: 0.6,
        ease: [0.33, 1, 0.68, 1],
      },
    },
    hover: {
      scale: 1.03,
      y: -10,
      rotate: 1,
      transition: { type: "spring", stiffness: 300 },
    },
  };
  const controls = useAnimation();
  const [ref, inView] = useInView({
    threshold: 0.2,
    triggerOnce: false, // 🔁 allow repeat
  });

  useEffect(() => {
    if (inView) {
      controls.start("visible");
    } else {
      controls.start("hidden");
    }
  }, [inView, controls]);

  return (
    <section className="" ref={containerRef}>
      <div className="container mx-auto px-4">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ margin: "-100px" }}
          variants={containerVariants}
          className="max-w-7xl mx-auto"
        >
          <motion.h2
            className="text-3xl font-bold text-orange-600 flex items-center justify-center gap-4 mb-4"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ margin: '-100px' }}

          >
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" fill="#ec4a0a" viewBox="0 0 24 24">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5A2.5 2.5 0 1 1 12 6a2.5 2.5 0 0 1 0 5.5z" />
            </svg>

            Past Events
          </motion.h2>

          <motion.p

            className="text-lg text-gray-600 text-center mb-12 max-w-3xl mx-auto"
          >
            Highlights from our recent activities and gatherings
          </motion.p>



          {/* <div className="flex items-center justify-end mb-4">

            <Link
              href="/events"
              className="text-sm font-medium text-orange-600 hover:text-orange-800 transition-colors"
            >
              View All →
            </Link>
          </div> */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {events.map((event, index) => (
              <motion.div
                key={index}
                variants={cardVariants}
                whileHover="hover"
                className="relative bg-gradient-to-br from-orange-50 to-cyan-50 dark:from-gray-800 dark:to-gray-900  rounded-xl p-4 shadow-md overflow-hidden group"
              >
                {/* Decorative rotating circle */}
                <motion.div
                  className="absolute -top-10 -right-10 w-24 h-24 rounded-full bg-orange-200 dark:bg-orange-700 opacity-10 group-hover:opacity-20 "
                  animate={{ rotate: 360 }}
                  transition={{
                    repeat: Infinity,
                    duration: 20,
                    ease: "linear",
                  }}
                />

                <EventCard {...event} delay={index * 0.1} />
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
