'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useTranslations, useLocale } from 'next-intl';
import NavigationBar from '@/components/NavigationBar';

export default function GamesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const t = useTranslations();
  const locale = useLocale();

  const gameTypes = [
    { 
      name: t('games.quickRace.name'), 
      href: `/${locale}/games/quick-race`, 
      icon: '⚡', 
      color: 'bg-cute-primary',
      description: t('games.quickRace.description')
    },
    { 
      name: t('games.balloonPop.name'), 
      href: `/${locale}/games/balloon-pop`, 
      icon: '🎈', 
      color: 'bg-cute-secondary',
      description: t('games.balloonPop.description')
    },
    { 
      name: t('games.adventure.name'), 
      href: `/${locale}/games/adventure`, 
      icon: '🗺️', 
      color: 'bg-cute-accent',
      description: t('games.adventure.description')
    },
    { 
      name: t('games.fractions.name'), 
      href: `/${locale}/games/fractions`, 
      icon: '🧩', 
      color: 'bg-pastel-pink',
      description: t('games.fractions.description')
    },
    { 
      name: t('games.geometry.name'), 
      href: `/${locale}/games/geometry`, 
      icon: '🔷', 
      color: 'bg-pastel-purple',
      description: t('games.geometry.description')
    },
    { 
      name: t('games.wordStories.name'), 
      href: `/${locale}/games/word-stories`, 
      icon: '📖', 
      color: 'bg-pastel-blue',
      description: t('games.wordStories.description')
    },
  ];

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-4xl">🦊</div>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    router.push(`/${locale}/login`);
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pastel-pink via-pastel-purple to-pastel-blue">
      <NavigationBar />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Header */}
          <div className="text-center mb-8">
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="text-8xl mb-4"
            >
              🎮
            </motion.div>
            <h1 className="text-5xl md:text-6xl font-bold text-cute-primary mb-4">
              {t('pages.games.title')}
            </h1>
            <p className="text-xl text-gray-700">
              {t('pages.games.subtitle')} 🚀
            </p>
          </div>

          {/* Games Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {gameTypes.map((game, index) => (
              <Link key={game.href} href={game.href}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.05, y: -10 }}
                  whileTap={{ scale: 0.95 }}
                  className={`${game.color} text-white cute-border border-4 border-white rounded-2xl p-6 cute-shadow h-full flex flex-col`}
                >
                  <div className="text-center mb-4">
                    <div className="text-7xl mb-4">{game.icon}</div>
                    <h2 className="text-3xl font-bold mb-2">{game.name}</h2>
                    <p className="text-white text-opacity-90 text-sm">
                      {game.description}
                    </p>
                  </div>
                  <motion.div
                    whileHover={{ x: 5 }}
                    className="mt-auto text-right text-lg font-bold"
                  >
                    {t('pages.games.playNow')}
                  </motion.div>
                </motion.div>
              </Link>
            ))}
          </div>

          {/* Back Button */}
          <div className="flex justify-center mt-8">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => router.push(`/${locale}/dashboard`)}
              className="bg-white cute-border border-4 border-cute-primary px-8 py-4 rounded-xl text-xl font-bold text-cute-primary cute-shadow hover:bg-pastel-pink"
            >
              {t('pages.games.backToDashboard')}
            </motion.button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

