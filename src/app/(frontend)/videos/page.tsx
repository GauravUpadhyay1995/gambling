
"use client";

import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { useRef, useState } from 'react';
import { FiPlay, FiX } from 'react-icons/fi';
import Image from 'next/image';
 import Link from 'next/link';

export default function Videos() {
  const [selectedVideo, setSelectedVideo] = useState<{
    title: string;
    videoUrl: string;
    description: string;
    speaker: string;
  } | null>(null);

  const videos = [
    {
      title: "Director's Welcome Message",
      speaker: "Director",
      description: "Welcome message and about WIN-CoE IIT Delhi",
      videoUrl: "https://www.youtube.com/embed/0n3j4gK3QWM"
    },
    {
      title: "Director's Welcome Message",
      speaker: "Director",
      description: "Welcome message and about WIN-CoE IIT Delhi",
      videoUrl: "https://www.youtube.com/embed/0n3j4gK3QWM"
    },
    {
      title: "Director's Welcome Message",
      speaker: "Director",
      description: "Welcome message and about WIN-CoE IIT Delhi",
      videoUrl: "https://www.youtube.com/embed/0n3j4gK3QWM"
    },
    //  {
    //   title: "Director's Welcome Message",
    //   speaker: "Director",
    //   description: "Welcome message and about WIN-CoE IIT Delhi",
    //   videoUrl: "https://www.youtube.com/embed/0n3j4gK3QWM"
    // },
    //  {
    //   title: "Director's Welcome Message",
    //   speaker: "Director",
    //   description: "Welcome message and about WIN-CoE IIT Delhi",
    //   videoUrl: "https://www.youtube.com/embed/0n3j4gK3QWM"
    // },

    // {
    //   title: "Vision Behind WIN CoE",
    //   speaker: "Prof Neetu Singh",
    //   description: "What is the vision behind WIN CoE at IIT Delhi, and how does it support innovation through funding and mentorship?",
    //   videoUrl: "https://www.youtube.com/embed/LuhYda68hqc"
    // },
    // {
    //   title: "Objectives & Focus Areas",
    //   speaker: "Prof Neetu Singh",
    //   description: "What are objectives & focus areas of the grants",
    //   videoUrl: "https://www.youtube.com/embed/hUm5getofHo"
    // }
  ];



  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.05]);

  const openVideo = (video: typeof videos[0]) => {
    setSelectedVideo({
      title: video.title,
      videoUrl: video.videoUrl,
      description: video.description,
      speaker: video.speaker
    });
  };

  const closeVideo = () => {
    setSelectedVideo(null);
  };

  return (
    <div className=" " ref={containerRef}>

      {/* Video Modal */}
      <AnimatePresence>
        {selectedVideo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[999] flex items-end justify-center backdrop-blur-sm p-4"
            onClick={closeVideo}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", damping: 25 }}
              className="relative w-full max-w-4xl mx-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={closeVideo}
                className="absolute -top-12 right-0 z-10 w-10 h-10 flex items-center justify-center text-orange-300 hover:text-white bg-gray-900/90 hover:bg-orange-600 rounded-full transition-all duration-300 shadow-lg hover:shadow-orange-500/30 border border-orange-300/30 hover:border-orange-600"
                aria-label="Close video"
              >
                <FiX className="w-5 h-5" />
              </button>

              {/* Video Container */}
              <div className="aspect-video w-full bg-black rounded-lg overflow-hidden shadow-2xl">
                <iframe
                  src={`${selectedVideo.videoUrl}?autoplay=1&rel=0`}
                  className="w-full h-full"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  title={selectedVideo.title}
                />
              </div>


            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Video Bytes Section */}
      <section className="py-1 mb-4 container mx-auto px-4">
     
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ margin: "-100px" }}
          className="max-w-7xl mx-auto"
        >
          
          <motion.h2
            className="text-3xl font-bold text-orange-600 flex items-center justify-center gap-4 mb-4"
            initial={{ opacity: 0, y: -20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
           
          >
            <div className="w-16 h-16 bg-orange-600 rounded-full flex items-center justify-center transform transition-transform">
              <svg
                stroke="currentColor"
                fill="none"
                strokeWidth="2"
                viewBox="0 0 24 24"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-6 h-6 text-white ml-1"
                xmlns="http://www.w3.org/2000/svg"
              >
                <polygon points="5 3 19 12 5 21 5 3"></polygon>
              </svg>
            </div>
            Video Bytes
          </motion.h2>
          

          <motion.p className="text-lg text-gray-600 text-center mb-12 max-w-3xl mx-auto">
            Insights from our leadership and partners about WIN CoE&#39;s vision and opportunities
          </motion.p>
            
        <div className="flex items-center justify-end mb-4">
              
                <Link
                    href="/events"
                    className="text-sm font-medium text-orange-600 hover:text-orange-800 transition-colors"
                >
                    View All →
                </Link>
            </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {videos.map((video, index) => {
              // Extract YouTube video ID from URL
              const videoId = video.videoUrl.split('embed/')[1]?.split('?')[0] || '';
              const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;

              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.15, type: "spring", stiffness: 100 }}
                  viewport={{ margin: "-50px" }}
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow"
                >
                  <div className="flex flex-col h-full">
                    <div className="relative aspect-video bg-gray-200 dark:bg-gray-700 rounded-lg mb-4 overflow-hidden hover:border-4 hover:border-orange-600">
                      {/* YouTube Thumbnail */}
                      <Image
                        src={thumbnailUrl}
                        alt={video.title}
                        className="w-full h-full object-cover"
                        fill
                      />

                      {/* Play Button Overlay */}
                      <button
                        onClick={() => openVideo(video)}
                        className="absolute inset-0 flex items-center justify-center group"
                      >
                        <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-colors"></div>
                        <div className="relative z-10 w-16 h-16 bg-orange-600 rounded-full flex items-center justify-center transform group-hover:scale-110 transition-transform">
                          <FiPlay className="w-6 h-6 text-white ml-1" />
                        </div>
                      </button>

                      {/* Duration Badge */}
                      <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                        4:43
                      </div>
                    </div>

                    <div className="flex-grow">
                      <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-1">
                        {video.title}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-3 font-medium">
                        {video.speaker}
                      </p>
                      <p className="text-gray-600 dark:text-gray-300 text-sm">
                        {video.description}
                      </p>
                    </div>

                    <div className="mt-4 flex justify-between items-center">
                      <button
                        onClick={() => openVideo(video)}
                        className="inline-flex items-center text-sm font-medium text-orange-600 dark:text-orange-400 hover:text-orange-800 dark:hover:text-orange-300 transition-colors"
                      >
                        Watch Video
                        <FiPlay className="ml-1" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </section>


    </div>
  );
}