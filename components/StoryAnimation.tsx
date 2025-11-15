'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';

interface StoryAnimationProps {
  story: string;
  onComplete: () => void;
}

export default function StoryAnimation({ story, onComplete }: StoryAnimationProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const words = story.split(' ');

  useEffect(() => {
    if (currentIndex < words.length) {
      const timer = setTimeout(() => {
        setCurrentIndex((prev) => prev + 1);
      }, 300); // Increased from 200ms to 300ms per word

      return () => clearTimeout(timer);
    } else {
      setTimeout(onComplete, 6000); // 6 seconds (1 second + 5 seconds extra) before showing question
    }
  }, [currentIndex, words.length, onComplete]);

  return (
    <div className="bg-gradient-to-br from-pastel-yellow to-pastel-peach rounded-2xl p-8 cute-border border-4 border-cute-primary min-h-[200px] flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <motion.div
          animate={{ y: [0, -10, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="text-6xl mb-4"
        >
          📖
        </motion.div>
        <div className="text-xl font-medium text-gray-800 max-w-2xl">
          {words.slice(0, currentIndex).join(' ')}
          <motion.span
            animate={{ opacity: [1, 0] }}
            transition={{ repeat: Infinity, duration: 0.8 }}
            className="inline-block w-2 h-6 bg-cute-primary ml-1"
          />
        </div>
      </motion.div>
    </div>
  );
}

