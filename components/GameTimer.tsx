'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface GameTimerProps {
  duration: number; // in seconds
  onComplete: () => void;
  className?: string;
}

export default function GameTimer({ duration, onComplete, className = '' }: GameTimerProps) {
  const [timeLeft, setTimeLeft] = useState(duration);

  useEffect(() => {
    if (timeLeft <= 0) {
      onComplete();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, onComplete]);

  const percentage = (timeLeft / duration) * 100;
  const isLowTime = timeLeft <= 10;

  return (
    <div className={`flex flex-col items-center ${className}`}>
      <motion.div
        animate={isLowTime ? { scale: [1, 1.2, 1] } : {}}
        transition={{ repeat: isLowTime ? Infinity : 0, duration: 0.5 }}
        className={`text-4xl font-bold ${
          isLowTime ? 'text-red-500' : 'text-cute-primary'
        }`}
      >
        ⏱️ {timeLeft}s
      </motion.div>
      <div className="w-48 h-4 bg-gray-200 rounded-full overflow-hidden mt-2 border-2 border-gray-400">
        <motion.div
          initial={{ width: '100%' }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1, ease: 'linear' }}
          className={`h-full ${
            isLowTime ? 'bg-red-500' : 'bg-cute-accent'
          }`}
        />
      </div>
    </div>
  );
}

