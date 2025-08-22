'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { FiPlay, FiX } from 'react-icons/fi';
import {
  XMarkIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ArrowPathIcon,
  PlayIcon,
  PauseIcon
} from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';
import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then(res => res.json());

type GalleryImage = {
  url: string;
  mimetype: string;
  size: number;
  _id: string;
};

type GalleryVideo = {
  url: string;
  _id: string;
  thumbnail?: string;
};

type GalleryItem = {
  _id: string;
  title: string;
  images: GalleryImage[];
  video_url: GalleryVideo[];
  isActive: boolean;
  createdAt: string;
};

const sectionVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8 }
  }
};

const imageVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 300 : -300,
    rotate: direction > 0 ? 360 : -360,
    opacity: 0
  }),
  center: {
    x: 0,
    rotate: 0,
    opacity: 1
  },
  exit: (direction: number) => ({
    x: direction < 0 ? 300 : -300,
    rotate: direction < 0 ? 360 : -360,
    opacity: 0
  })
};
export default function Gallery({ customLimit = 0 }: { customLimit?: number }) {
  // export default function Gallery() {
  // console.log("customLimit", customLimit)
  const [zoom, setZoom] = useState(1);
  // const modalVideoRef = useRef(null);
  const [isModalVideoPlaying, setIsModalVideoPlaying] = useState(false);



  const router = useRouter();
  const containerRef = useRef(null);
  const videoRefs = useRef<{ [key: string]: HTMLVideoElement | null }>({});
  const modalVideoRef = useRef<HTMLVideoElement>(null);
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<GalleryVideo | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const [hasMounted, setHasMounted] = useState(false);
  const [selectedGallery, setSelectedGallery] = useState<GalleryItem | 'all' | null>(null);
  const [activeTab, setActiveTab] = useState<'images' | 'videos'>('images');
  const [playingVideoId, setPlayingVideoId] = useState<string | null>(null);

  const { data, error, isLoading } = useSWR(
    `${process.env.NEXT_PUBLIC_API_URL}/gallery/list?customLimit=${customLimit}&from=frontend&perPage=10000&page=1`,
    fetcher
  );
  useEffect(() => {
    setHasMounted(true);
    if (data?.data?.galleries?.length) {
      setSelectedGallery('all');
    }
  }, [data]);

  // Get all media based on selection
  const currentImages = selectedGallery === 'all'
    ? data?.data?.galleries?.flatMap(gallery => gallery.images) || []
    : selectedGallery?.images || [];

  const currentVideos =
    selectedGallery === 'all'
      ? data?.data?.galleries?.flatMap((gallery) =>
        gallery.video_url.map((video) => ({
          ...video,
          Title: video.title
        }))
      ) || []
      : selectedGallery?.video_url.map((video) => ({
        ...video,
        Title: video.title
      })) || [];


  const openModal = (index: number) => {
    if (activeTab === 'images') {
      setSelectedImage(currentImages[index]);
      setSelectedVideo(null);
      setCurrentIndex(index);
    } else {
      setSelectedVideo(currentVideos[index]);
      setSelectedImage(null);
      setCurrentIndex(index);
      setIsModalVideoPlaying(true);
    }
  };

  const closeModal = () => {
    setSelectedImage(null);
    setSelectedVideo(null);
    setPlayingVideoId(null);
    setIsModalVideoPlaying(false);
  };

  const navigate = (dir: 'prev' | 'next') => {
    const isNext = dir === 'next';
    setDirection(isNext ? 1 : -1);

    const items = activeTab === 'images' ? currentImages : currentVideos;
    const newIndex = isNext
      ? (currentIndex + 1) % items.length
      : (currentIndex - 1 + items.length) % items.length;

    if (activeTab === 'images') {
      setSelectedImage(currentImages[newIndex]);
      setSelectedVideo(null);
    } else {
      setSelectedVideo(currentVideos[newIndex]);
      setSelectedImage(null);
      setIsModalVideoPlaying(true);
    }
    setCurrentIndex(newIndex);
  };

  const resetGallerySelection = () => {
    setSelectedGallery('all');
    setActiveTab('images');
  };

  const toggleVideoPlay = (videoId: string) => {
    const video = videoRefs.current[videoId];
    if (video) {
      if (video.paused) {
        video.play();
        setPlayingVideoId(videoId);
      } else {
        video.pause();
        setPlayingVideoId(null);
      }
    }
  };

  const handleVideoHover = (videoId: string, isHovering: boolean) => {
    const video = videoRefs.current[videoId];
    if (video) {
      if (isHovering) {
        video.play();
        setPlayingVideoId(videoId);
      } else {
        video.pause();
        video.currentTime = 0;
        setPlayingVideoId(null);
      }
    }
  };

  const toggleModalVideoPlay = () => {
    if (modalVideoRef.current) {
      if (modalVideoRef.current.paused) {
        modalVideoRef.current.play();
        setIsModalVideoPlaying(true);
      } else {
        modalVideoRef.current.pause();
        setIsModalVideoPlaying(false);
      }
    }
  };
  function extractYouTubeVideoId(url: string): string | null {
    const regex = /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=))([\w-]+)/;
    const match = url.match(regex);
    return match ? match[1] : null;
  }

  function extractGoogleDriveFileId(url: string): string | null {
    const match = url.match(/\/d\/([a-zA-Z0-9_-]+)\//);
    return match ? match[1] : null;
  }

  function getVideoThumbnail(videoUrl: string): string {
    if (videoUrl.includes("youtube.com") || videoUrl.includes("youtu.be")) {
      const id = extractYouTubeVideoId(videoUrl);
      return id ? `https://img.youtube.com/vi/${id}/hqdefault.jpg` : '';
    }
    if (videoUrl.includes("drive.google.com")) {
      const id = extractGoogleDriveFileId(videoUrl);
      return id ? `https://drive.google.com/thumbnail?id=${id}` : '';
    }
    return ''; // fallback
  }

  return (
    <div className="relative" ref={containerRef}>
      <section className="container mx-auto px-4 mb-4 mt-4">
        <motion.div
          variants={sectionVariants}
          initial="hidden"
          animate={hasMounted ? 'visible' : 'hidden'}
          className="max-w-7xl mx-auto"
        >
          <motion.h2
            className="text-3xl font-bold text-orange-600 flex items-center justify-center gap-4 mb-4"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ margin: '-100px' }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64" fill="none" stroke="#ec4a0a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="6" y="10" width="40" height="30" rx="2" ry="2" />
              <rect x="14" y="16" width="40" height="30" rx="2" ry="2" transform="rotate(8 34 31)" />
              <rect x="10" y="22" width="40" height="30" rx="2" ry="2" transform="rotate(-10 30 37)" />
              <circle cx="22" cy="20" r="2" fill="#ec4a0a" />
              <path d="M12 36l6-6 8 10 6-8 10 12" />
            </svg>
            Gallery &
            {/* <div className="w-16 h-16 bg-orange-600 rounded-full flex items-center justify-center transform transition-transform">
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
            </div> */}
            Video
          </motion.h2>

          <div className="flex justify-center gap-4 mb-4">
            {data?.data?.galleries?.length > 0 && (
              <>
                <select
                  value={selectedGallery === 'all' ? 'all' : selectedGallery?._id || ''}
                  onChange={(e) => {
                    if (e.target.value === 'all') {
                      setSelectedGallery('all');
                    } else {
                      const selected = data.data.galleries.find(
                        (g: GalleryItem) => g._id === e.target.value
                      );
                      setSelectedGallery(selected || null);
                    }
                  }}
                  className="px-4 py-2 border border-orange-400 rounded-md text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                >
                  <option value="all">All Images & Videos</option>
                  {data.data.galleries.map((gallery: GalleryItem) => (
                    <option key={gallery._id} value={gallery._id}>
                      {gallery.title}
                    </option>
                  ))}
                </select>
                <button
                  onClick={resetGallerySelection}
                  className="px-4 py-2 bg-orange-100 text-orange-600 rounded-md hover:bg-orange-200 transition-colors flex items-center gap-2"
                >
                  <ArrowPathIcon className="h-5 w-5" />
                  Reset
                </button>
              </>
            )}
          </div>

          {/* Tabs for Images/Videos */}
          <div className="flex justify-center mb-6">
            <div className="inline-flex rounded-md shadow-sm">
              <button
                onClick={() => setActiveTab('images')}
                className={`px-4 py-2 text-sm font-medium rounded-l-lg ${activeTab === 'images'
                  ? 'bg-orange-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
              >
                Images
              </button>
              <button
                onClick={() => setActiveTab('videos')}
                className={`px-4 py-2 text-sm font-medium rounded-r-lg ${activeTab === 'videos'
                  ? 'bg-orange-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
              >
                Videos
              </button>
            </div>
          </div>

          {selectedGallery && selectedGallery !== 'all' && (
            <motion.h3 className="text-xl font-semibold text-gray-800 text-center mb-2">
              {selectedGallery.title}
            </motion.h3>
          )}

          {/* <motion.p className="text-lg text-gray-600 text-center mb-12 max-w-3xl mx-auto">
            Moments captured from WIN CoE events and activities
          </motion.p> */}

          {isLoading && (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-600"></div>
            </div>
          )}

          {error && (
            <div className="text-center py-8">
              <p className="text-red-500 mb-2">Failed to load media</p>
              <button
                onClick={() => router.refresh()}
                className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors"
              >
                Retry
              </button>
            </div>
          )}

          {!isLoading && !error && (
            <>
              {activeTab === 'images' ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {currentImages.length > 0 ? (
                    // Apply slice() if customLimit > 0, otherwise use all images
                    (customLimit > 0 ? currentImages.slice(0, customLimit) : currentImages).map((image, index) => (
                      <motion.div
                        key={image._id || index}
                        initial={{ opacity: 0, y: 50 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.15, type: "spring", stiffness: 100 }}
                        viewport={{ margin: "-50px" }}
                        className="rounded-2xl overflow-hidden hover:border-4 hover:border-orange-600"
                        whileHover={{ scale: 1.03, zIndex: 10, transition: { duration: 0.3 } }}
                        onClick={() => openModal(index)}
                      >
                        <div className="relative aspect-square">
                          <motion.img
                            src={image.url}
                            alt={`Gallery image ${index + 1}`}
                            className="w-full h-full object-cover"
                            initial={{ scale: 1 }}
                            whileHover={{ scale: 1.05, transition: { duration: 0.5 } }}
                          />
                          <motion.div
                            className="absolute inset-0 bg-orange/20 opacity-0 hover:opacity-100 transition-opacity duration-300 flex items-center justify-center"
                            whileHover={{ opacity: 1 }}
                          >
                            <motion.div
                              initial={{ scale: 0 }}
                              whileHover={{ scale: 1 }}
                              className="p-3 bg-white/90 rounded-full"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                              </svg>
                            </motion.div>
                          </motion.div>
                        </div>
                      </motion.div>
                    ))

                  ) : (
                    <div className="col-span-full text-center py-12">
                      <p className="text-gray-500 text-lg">No images found in this gallery</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {currentVideos.length > 0 ? (
                    <>
                      {(customLimit > 0 ? currentVideos.slice(0, customLimit) : currentVideos).map((video, index) => (
                        <motion.div
                          key={video._id || index}
                          initial={{ opacity: 0, y: 50 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.15, type: "spring", stiffness: 100 }}
                          viewport={{ margin: "-50px" }}
                          className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow"
                          whileHover={{ scale: 1.03, zIndex: 10, transition: { duration: 0.3 } }}
                          onClick={() => openModal(index)}
                          onHoverStart={() => handleVideoHover(video._id, true)}
                          onHoverEnd={() => handleVideoHover(video._id, false)}
                        >
                          <div className="relative aspect-video bg-gray-200 dark:bg-gray-700 rounded-lg mb-4 overflow-hidden hover:border-4 hover:border-orange-600">
                            {video.url.includes('youtube.com') || video.url.includes('youtu.be') || video.url.includes('drive.google.com') ? (
                              <img
                                src={getVideoThumbnail(video.url)}
                                alt="Video Thumbnail"
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <video
                                src={video.url}
                                className="w-full h-full object-cover"
                                controls
                                playsInline
                              />
                            )}
                            <motion.div
                              className="absolute inset-0 bg-orange/20 opacity-0 hover:opacity-100 transition-opacity duration-300 flex items-center justify-center"
                              whileHover={{ opacity: 1 }}
                            >
                              <motion.div
                                initial={{ scale: 0 }}
                                whileHover={{ scale: 1 }}
                                className="p-3 bg-white/90 rounded-full"
                              >
                                <FiPlay className="h-8 w-8 text-blue-600" />
                              </motion.div>
                            </motion.div>
                          </div>


                          <div className="flex-grow">
                            <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-1 break-words overflow-hidden">
                              {video.Title}
                            </h3>
                            <p className="text-gray-600 dark:text-gray-300 text-sm">
                              {video.description}
                            </p>
                          </div>

                          <div className="mt-4 flex justify-between items-center">
                            <button className="inline-flex items-center text-sm font-medium text-orange-600 dark:text-orange-400 hover:text-orange-800 dark:hover:text-orange-300 transition-colors">
                              Watch Video
                              <FiPlay className="ml-1" />
                            </button>
                          </div>
                        </motion.div>
                      ))}


                    </>
                  ) : (
                    <div className="col-span-full text-center py-12">
                      <p className="text-gray-500 text-lg">No videos found in this gallery</p>
                    </div>
                  )}
                </div>
              )}
              {customLimit > 0 && (currentVideos.length > customLimit || currentImages.length > customLimit) && (
                <motion.div
                  variants={sectionVariants}
                  className="text-center mt-16 col-span-full"
                >
                  <motion.button
                    whileHover={{
                      scale: 1.05,
                      backgroundColor: '#e87638ff',
                      boxShadow: '0 10px 25px -5px rgba(78, 33, 3, 0.4)'
                    }}
                    whileTap={{ scale: 0.95 }}
                    className="px-8 py-3 bg-orange-600 text-white font-medium rounded-full shadow-lg transition-all"
                    onClick={() => router.push('/gallery')}
                  >
                    View All
                  </motion.button>
                </motion.div>
              )}
            </>
          )}


        </motion.div>
      </section>

      {/* Modal Viewer */}
      <AnimatePresence>
        {(selectedImage || selectedVideo) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.1 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-2 md:p-4 backdrop-blur-sm"
            onClick={closeModal}
            id="media-modal"
          >
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              transition={{ type: 'spring', stiffness: 100, damping: 15 }}
              className="relative w-full max-w-4xl mx-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Controls - Top Right */}
              <div className="absolute -top-2 -right-2 md:top-2 md:right-2 z-20 flex flex-row-reverse md:flex-row flex-wrap justify-end gap-1 md:gap-2">
                <button
                  onClick={closeModal}
                  className="p-2 bg-white/90 hover:bg-white rounded-full shadow-lg"
                  aria-label="Close"
                >
                  <XMarkIcon className="h-5 w-5 text-orange-700" />
                </button>





                <button
                  onClick={() => {
                    const el = document.fullscreenElement
                      ? document.exitFullscreen()
                      : document.querySelector('#media-modal')?.requestFullscreen();
                  }}
                  className="p-2 bg-white/90 hover:bg-white rounded-full shadow-lg hidden md:block"
                  aria-label="Fullscreen"
                >
                  ⛶
                </button>

                {selectedImage && (
                  <>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setZoom(z => Math.min(z + 0.25, 3));
                      }}
                      className="p-2 bg-white/90 hover:bg-white rounded-full shadow-lg"
                      aria-label="Zoom in"
                    >
                      🔍+
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setZoom(z => Math.max(z - 0.25, 1));
                      }}
                      className="p-2 bg-white/90 hover:bg-white rounded-full shadow-lg"
                      aria-label="Zoom out"
                    >
                      🔍−
                    </button>
                  </>
                )}
              </div>

              {/* Content */}
              <div className="relative w-full h-[60vh] md:h-[70vh] rounded-xl overflow-hidden bg-black/10">
                <AnimatePresence custom={direction} mode="wait">
                  {selectedImage ? (
                    <motion.div
                      className="flex items-center justify-center w-full h-full"
                      style={{ transform: `scale(${zoom})`, transition: 'transform 0.3s ease' }}
                    >
                      <motion.img
                        key={selectedImage.url}
                        src={selectedImage.url}
                        alt="Gallery image"
                        className="max-w-full max-h-full object-contain mx-auto rounded-xl"
                        custom={direction}
                        variants={imageVariants}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        transition={{
                          x: { type: 'spring', stiffness: 500, damping: 30 },
                          rotate: { duration: 0.6 },
                          opacity: { duration: 0.1 }
                        }}
                      />
                    </motion.div>
                  ) : (
                    <motion.div
                      key={selectedVideo?.url}
                      custom={direction}
                      variants={imageVariants}
                      initial="enter"
                      animate="center"
                      exit="exit"
                      transition={{
                        x: { type: 'spring', stiffness: 500, damping: 30 },
                        rotate: { duration: 0.6 },
                        opacity: { duration: 0.1 }
                      }}
                      className="w-full h-full relative"
                    >
                      {selectedVideo?.url.includes('youtube.com') || selectedVideo?.url.includes('youtu.be') ? (
                        <iframe
                          className="w-full h-full rounded-xl"
                          src={`https://www.youtube.com/embed/${extractYouTubeVideoId(selectedVideo.url)}?autoplay=1`}
                          title="YouTube video"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        ></iframe>
                      ) : selectedVideo?.url.includes('drive.google.com') ? (
                        <iframe
                          className="w-full h-full rounded-xl"
                          src={`https://drive.google.com/file/d/${extractGoogleDriveFileId(selectedVideo.url)}/preview`}
                          allow="autoplay"
                          allowFullScreen
                          title="Google Drive video"
                        ></iframe>
                      ) : (
                        <video
                          ref={modalVideoRef}
                          src={selectedVideo?.url}
                          className="w-full h-full object-contain"
                          controls
                          autoPlay={isModalVideoPlaying}
                          playsInline
                          onPlay={() => setIsModalVideoPlaying(true)}
                          onPause={() => setIsModalVideoPlaying(false)}
                        />
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Navigation - Bottom */}
              <div className="flex justify-between items-center mt-2 md:mt-4 bg-orange-200 rounded-lg p-1 md:p-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate('prev');
                  }}
                  className="p-1 md:p-2 text-orange-600 hover:text-orange-400 transition-colors"
                  aria-label="Previous"
                >
                  <ChevronLeftIcon className="h-6 w-6 md:h-8 md:w-8" />
                </button>

                <span className="text-orange-600 text-sm md:text-xl font-medium">
                  {currentIndex + 1} / {activeTab === 'images' ? currentImages.length : currentVideos.length}
                </span>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate('next');
                  }}
                  className="p-1 md:p-2 text-orange-600 hover:text-orange-400 transition-colors"
                  aria-label="Next"
                >
                  <ChevronRightIcon className="h-6 w-6 md:h-8 md:w-8" />
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div >
  );
}