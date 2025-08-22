"use client";

import { animate, stagger } from "motion";
import { splitText } from "motion-plus";
import { useEffect, useRef } from "react";

interface WavyTextProps {
  text: string;
  className?: string;
}

const WavyText: React.FC<WavyTextProps> = ({ text, className = "" }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.fonts.ready.then(() => {
      if (!containerRef.current) return;

      const wavyElement = containerRef.current.querySelector(".wavy");
      if (!wavyElement) return;

      const { chars } = splitText(wavyElement);
      (wavyElement as HTMLElement).style.visibility = "visible";

      const staggerDelay = 0.15;

      animate(
        chars,
        { y: [-20, 20] },
        {
          repeat: Infinity,
          repeatType: "mirror",
          ease: "easeInOut",
          duration: 2,
          delay: stagger(staggerDelay, {
            startDelay: -staggerDelay * chars.length,
          }),
        }
      );
    });
  }, []);

  return (
    <div  ref={containerRef}>
   
        <span className={`wavy ${className}`} >
          {text}
        </span>
    
      <Stylesheet />
    </div>
  );
};

const Stylesheet = () => (
  <style>{`
  

    .split-char {
      will-change: transform, opacity;
      color: inherit;
      background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
      -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
     
    }
  `}</style>
);

export default WavyText;
