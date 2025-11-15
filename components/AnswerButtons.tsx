'use client';

import { motion } from 'framer-motion';

interface AnswerButtonsProps {
  options: number[];
  onAnswer: (answer: number) => void;
  disabled?: boolean;
}

export default function AnswerButtons({ options, onAnswer, disabled = false }: AnswerButtonsProps) {
  return (
    <div className="grid grid-cols-2 gap-4 mt-8">
      {options.map((option, index) => (
        <motion.button
          key={index}
          whileHover={{ scale: 1.05, y: -5 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => !disabled && onAnswer(option)}
          disabled={disabled}
          className="bg-white cute-border border-4 border-cute-primary px-8 py-6 rounded-2xl text-2xl font-bold text-cute-primary cute-shadow hover:bg-pastel-pink transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {option}
        </motion.button>
      ))}
    </div>
  );
}

