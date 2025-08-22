'use client';

import React, { useEffect, useRef, useState } from 'react';

interface ScrollAnimationProps {
  children: React.ReactNode;
  animation?: 'fade' | 'slideUp' | 'slideLeft' | 'slideRight' | 'scale';
  delay?: number;
  className?: string;
}

const ScrollAnimation: React.FC<ScrollAnimationProps> = ({
  children,
  animation = 'fade',
  delay = 0,
  className = '',
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const currentRef = ref.current;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => {
            setIsVisible(true);
          }, delay);
        }
      },
      {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px',
      }
    );

    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [delay]);

  const getAnimationClass = () => {
    switch (animation) {
      case 'fade':
        return 'scroll-fade-up';
      case 'slideUp':
        return 'scroll-fade-up';
      case 'slideLeft':
        return 'scroll-fade-left';
      case 'slideRight':
        return 'scroll-fade-right';
      case 'scale':
        return 'scroll-scale';
      default:
        return 'scroll-fade-up';
    }
  };

  return (
    <div
      ref={ref}
      className={`${getAnimationClass()} ${isVisible ? 'is-visible' : ''} ${className}`}
    >
      {children}
    </div>
  );
};

export default ScrollAnimation; 