"use client";
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';

type Slide = {
  bgImage: string;         // Required
  title?: string;          // Optional
  subtitle?: string;       // Optional
  cta?: string;            // Optional
  ctaLink?: string;        // Optional
};

type HomeCarouselProps = {
  images: Slide[];
};

const HomeCarousel: React.FC<HomeCarouselProps> = ({ images }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  const slides = images;

  useEffect(() => {
    const interval = setInterval(() => {
      if (!isHovered) {
        setCurrentSlide((prev) => (prev + 1) % slides.length);
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [isHovered, slides.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  return (
    <div className="relative w-full h-[90vh] overflow-hidden">
      <div
        className="relative h-full w-full"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${slides[currentSlide].bgImage})` }}
          >
            <div className={`absolute inset-0 flex items-center justify-center ${slides[currentSlide].title ? 'bg-black/40' : ''}`}>
              {(slides[currentSlide].title || slides[currentSlide].subtitle || (slides[currentSlide].cta && slides[currentSlide].ctaLink)) && (
                <div className="text-center px-4 max-w-4xl mx-auto">
                  {slides[currentSlide].title && (
                    <motion.h1
                      className="text-3xl md:text-5xl lg:text-6xl font-bold text-white mb-4"
                      initial={{ y: 50, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.2, duration: 0.5 }}
                    >
                      {slides[currentSlide].title}
                    </motion.h1>
                  )}

                  {slides[currentSlide].subtitle && (
                    <motion.p
                      className="text-xl md:text-2xl text-white mb-8"
                      initial={{ y: 50, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.4, duration: 0.5 }}
                    >
                      {slides[currentSlide].subtitle}
                    </motion.p>
                  )}

                  {slides[currentSlide].cta && slides[currentSlide].ctaLink && (
                    <motion.a
                      href={slides[currentSlide].ctaLink}
                      className="inline-block px-8 py-3 bg-orange-600 text-white font-medium rounded-full shadow-lg hover:bg-orange-700 transition-colors"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 0.6, duration: 0.5 }}
                    >
                      {slides[currentSlide].cta}
                    </motion.a>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Navigation Arrows */}
        <motion.button
          onClick={prevSlide}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-white/30 hover:bg-white/50 backdrop-blur-md transition-all"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <ChevronLeft className="w-6 h-6 text-white" />
        </motion.button>
        <motion.button
          onClick={nextSlide}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-white/30 hover:bg-white/50 backdrop-blur-md transition-all"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <ChevronRight className="w-6 h-6 text-white" />
        </motion.button>

        {/* Indicators */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2 z-10">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-3 h-3 rounded-full transition-all ${currentSlide === index ? 'bg-white w-6' : 'bg-white/50'}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default HomeCarousel;
