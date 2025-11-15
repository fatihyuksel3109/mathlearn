'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';

interface WrongAnswerFeedbackProps {
  show: boolean;
  onHide?: () => void;
  duration?: number;
}

export default function WrongAnswerFeedback({ 
  show, 
  onHide,
  duration = 2000 
}: WrongAnswerFeedbackProps) {
  const t = useTranslations();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (show) {
      setIsVisible(true);
      const timer = setTimeout(() => {
        setIsVisible(false);
        if (onHide) {
          setTimeout(onHide, 500); // Wait for animation to complete
        }
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [show, duration, onHide]);

  return (
    <AnimatePresence>
      {isVisible && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black bg-opacity-50"
          />
          {/* Feedback */}
          <motion.div
            initial={{ opacity: 0, scale: 0.5, y: -50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.5, y: -50 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none"
          >
          <div className="bg-red-500 bg-opacity-95 rounded-3xl p-12 shadow-2xl border-8 border-red-700">
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ 
                type: 'spring',
                stiffness: 200,
                damping: 15,
                delay: 0.1
              }}
              className="text-center"
            >
              <div className="text-9xl mb-6">❌</div>
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-5xl font-bold text-white mb-4"
              >
                {t('feedback.wrong')}
              </motion.h2>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-2xl text-red-100"
              >
                {t('feedback.tryAgain')}
              </motion.p>
            </motion.div>
          </div>
        </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

