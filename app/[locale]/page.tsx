'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useTranslations, useLocale } from 'next-intl';
import { useEffect } from 'react';
import NavigationBar from '@/components/NavigationBar';

export default function HomePage() {
  const { data: session } = useSession();
  const router = useRouter();
  const t = useTranslations();
  const locale = useLocale();

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.lang = locale;
    }
  }, [locale]);

  const handleGetStarted = () => {
    if (session) {
      router.push(`/${locale}/dashboard`);
    } else {
      router.push(`/${locale}/signup`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pastel-pink via-pastel-purple to-pastel-blue relative overflow-hidden">
      <NavigationBar />
      
      {/* Floating decorative elements */}
      <motion.div
        animate={{ y: [0, -30, 0], rotate: [0, 10, 0] }}
        transition={{ repeat: Infinity, duration: 4 }}
        className="absolute top-20 left-10 text-6xl opacity-30"
      >
        ☁️
      </motion.div>
      <motion.div
        animate={{ y: [0, -20, 0], rotate: [0, -10, 0] }}
        transition={{ repeat: Infinity, duration: 3, delay: 1 }}
        className="absolute top-40 right-20 text-5xl opacity-30"
      >
        ⭐
      </motion.div>
      <motion.div
        animate={{ y: [0, -25, 0] }}
        transition={{ repeat: Infinity, duration: 5, delay: 0.5 }}
        className="absolute bottom-40 left-20 text-5xl opacity-30"
      >
        🎈
      </motion.div>
      <motion.div
        animate={{ y: [0, -15, 0], rotate: [0, 15, 0] }}
        transition={{ repeat: Infinity, duration: 4, delay: 1.5 }}
        className="absolute bottom-20 right-10 text-6xl opacity-30"
      >
        🌈
      </motion.div>

      <div className="max-w-6xl mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <motion.div
            animate={{ y: [0, -20, 0], rotate: [0, -10, 10, 0] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="text-9xl mb-6"
          >
            🦊
          </motion.div>
          
          <h1 className="text-6xl md:text-8xl font-bold text-cute-primary mb-6">
            {t('pages.home.title')}
          </h1>
          
          <p className="text-2xl md:text-3xl text-gray-700 mb-8">
            {t('pages.home.subtitle')} 🎮
          </p>
          
          <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto">
            {t('pages.home.description')}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleGetStarted}
              className="bg-cute-primary text-white px-8 py-4 rounded-xl text-2xl font-bold cute-shadow"
            >
              {t('pages.home.getStarted')} 🚀
            </motion.button>
            {session && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => router.push(`/${locale}/dashboard`)}
                className="bg-cute-secondary text-white px-8 py-4 rounded-xl text-2xl font-bold cute-shadow"
              >
                {t('pages.home.goToDashboard')}
              </motion.button>
            )}
          </div>

          {/* Game preview cards */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mt-16">
            {[
              { name: t('games.quickRace.name'), icon: '⚡', color: 'bg-cute-primary' },
              { name: t('games.balloonPop.name'), icon: '🎈', color: 'bg-cute-secondary' },
              { name: t('games.adventure.name'), icon: '🗺️', color: 'bg-cute-accent' },
              { name: t('games.fractions.name'), icon: '🧩', color: 'bg-pastel-pink' },
              { name: t('games.geometry.name'), icon: '🔷', color: 'bg-pastel-purple' },
              { name: t('games.wordStories.name'), icon: '📖', color: 'bg-pastel-blue' },
            ].map((game, index) => (
              <motion.div
                key={game.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.05, y: -5 }}
                className={`${game.color} text-white cute-border border-4 border-white rounded-2xl p-6 text-center cute-shadow`}
              >
                <div className="text-5xl mb-2">{game.icon}</div>
                <div className="text-lg font-bold">{game.name}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

