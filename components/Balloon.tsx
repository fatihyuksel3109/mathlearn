'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';

interface BalloonProps {
  id: number;
  question: string;
  answer: number;
  correctAnswer: number;
  onPop: (id: number, correct: boolean) => void;
  x: number;
  delay: number;
}

export default function Balloon({ id, question, answer, correctAnswer, onPop, x, delay }: BalloonProps) {
  const [popped, setPopped] = useState(false);

  const handleClick = () => {
    if (popped) return;
    setPopped(true);
    const isCorrect = answer === correctAnswer;
    onPop(id, isCorrect);
  };

  if (popped) {
    return (
      <motion.div
        initial={{ scale: 1, opacity: 1 }}
        animate={{ scale: 2, opacity: 0 }}
        transition={{ duration: 0.5 }}
        className="absolute"
        style={{ left: `${x}%`, top: '100%' }}
      >
        <div className="text-4xl">🎉</div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ y: '100vh', opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{
        delay,
        duration: 7,
        repeat: Infinity,
        repeatType: 'loop',
        ease: 'linear',
      }}
      whileHover={{ scale: 1.1 }}
      onClick={handleClick}
      className="absolute cursor-pointer"
      style={{ left: `${x}%` }}
    >
      <motion.div
        animate={{ y: [0, -10, 0] }}
        transition={{ repeat: Infinity, duration: 2 }}
        className="bg-pastel-pink cute-border border-4 border-cute-primary rounded-full px-6 py-4 cute-shadow"
      >
        <div className="text-center">
          <div className="text-2xl mb-2">🎈</div>
          <div className="text-lg font-bold text-cute-primary">{question}</div>
          <div className="text-xl font-bold text-cute-secondary mt-1">{answer}</div>
        </div>
      </motion.div>
    </motion.div>
  );
}

