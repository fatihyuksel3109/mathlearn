'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useTranslations, useLocale } from 'next-intl';
import NavigationBar from '@/components/NavigationBar';
import ProgressChart from '@/components/ProgressChart';
import CuteAvatar from '@/components/CuteAvatar';

interface UserData {
  name: string;
  email: string;
  avatar: string;
  xp: number;
  streak: number;
  badges: string[];
}

interface GameSession {
  gameType: string;
  correct: number;
  wrong: number;
  xpEarned: number;
  date: string;
}

interface ChartData {
  date: string;
  xp: number;
}

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const t = useTranslations();
  const locale = useLocale();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [recentGames, setRecentGames] = useState<GameSession[]>([]);
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push(`/${locale}/login`);
      return;
    }

    if (status === 'authenticated') {
      fetchUserData();
    }
  }, [status, router]);

  const fetchUserData = async () => {
    try {
      const res = await fetch('/api/user');
      if (!res.ok) {
        throw new Error('Failed to fetch user data');
      }
      const data = await res.json();
      setUserData(data.user);
      setRecentGames(data.recentGames || []);
      setChartData(data.chartData || []);
    } catch (error) {
      console.error('Failed to fetch user data:', error);
      // Fallback to session data
      setUserData({
        name: session?.user?.name || 'Player',
        email: session?.user?.email || '',
        avatar: (session?.user as any)?.avatar || 'fox',
        xp: 0,
        streak: 0,
        badges: [],
      });
      setRecentGames([]);
    } finally {
      setLoading(false);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-4xl">🦊</div>
      </div>
    );
  }

  const gameTypes = [
    { name: t('games.quickRace.name'), href: `/${locale}/games/quick-race`, icon: '⚡', color: 'bg-cute-primary' },
    { name: t('games.balloonPop.name'), href: `/${locale}/games/balloon-pop`, icon: '🎈', color: 'bg-cute-secondary' },
    { name: t('games.adventure.name'), href: `/${locale}/games/adventure`, icon: '🗺️', color: 'bg-cute-accent' },
    { name: t('games.fractions.name'), href: `/${locale}/games/fractions`, icon: '🧩', color: 'bg-pastel-pink' },
    { name: t('games.geometry.name'), href: `/${locale}/games/geometry`, icon: '🔷', color: 'bg-pastel-purple' },
    { name: t('games.wordStories.name'), href: `/${locale}/games/word-stories`, icon: '📖', color: 'bg-pastel-blue' },
  ];

  // Use chart data from API, fallback to empty if not available
  const displayChartData = chartData.length > 0 ? chartData : [
    { date: 'Mon', xp: 0 },
    { date: 'Tue', xp: 0 },
    { date: 'Wed', xp: 0 },
    { date: 'Thu', xp: 0 },
    { date: 'Fri', xp: 0 },
    { date: 'Sat', xp: 0 },
    { date: 'Sun', xp: 0 },
  ];

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
          <div className="bg-white cute-border cute-shadow rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <CuteAvatar avatar={userData?.avatar || 'fox'} size="lg" />
                <div>
                  <h1 className="text-3xl font-bold text-cute-primary">
                    {t('pages.dashboard.welcome', { name: userData?.name || 'Player' })} 🎉
                  </h1>
                  <p className="text-gray-600">{t('pages.dashboard.keepLearning')}</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-4xl font-bold text-cute-primary">{userData?.xp || 0} {t('common.xp')}</div>
                <div className="text-xl text-gray-600">🔥 {userData?.streak || 0} {t('common.streak')}</div>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="bg-white cute-border cute-shadow rounded-2xl p-6 text-center"
            >
              <div className="text-5xl mb-2">⭐</div>
              <div className="text-3xl font-bold text-cute-primary">{userData?.xp || 0}</div>
              <div className="text-gray-600">{t('common.totalXP')}</div>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="bg-white cute-border cute-shadow rounded-2xl p-6 text-center"
            >
              <div className="text-5xl mb-2">🔥</div>
              <div className="text-3xl font-bold text-cute-primary">{userData?.streak || 0}</div>
              <div className="text-gray-600">{t('common.streak')}</div>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="bg-white cute-border cute-shadow rounded-2xl p-6 text-center"
            >
              <div className="text-5xl mb-2">🏅</div>
              <div className="text-3xl font-bold text-cute-primary">{userData?.badges?.length || 0}</div>
              <div className="text-gray-600">{t('common.badges')}</div>
            </motion.div>
          </div>

          {/* Games Grid */}
          <div>
            <h2 className="text-3xl font-bold text-cute-primary mb-4">{t('pages.dashboard.chooseGame')} 🎮</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {gameTypes.map((game) => (
                <Link key={game.href} href={game.href}>
                  <motion.div
                    whileHover={{ scale: 1.05, y: -5 }}
                    whileTap={{ scale: 0.95 }}
                    className={`${game.color} text-white cute-border border-4 border-white rounded-2xl p-6 text-center cute-shadow`}
                  >
                    <div className="text-5xl mb-2">{game.icon}</div>
                    <div className="text-xl font-bold">{game.name}</div>
                  </motion.div>
                </Link>
              ))}
            </div>
          </div>

          {/* Progress Chart */}
          <div>
            <ProgressChart data={displayChartData} />
          </div>

          {/* Recent Games */}
          <div className="bg-white cute-border cute-shadow rounded-2xl p-6">
            <h2 className="text-2xl font-bold text-cute-primary mb-4">{t('pages.dashboard.recentGames')}</h2>
            {recentGames.length === 0 ? (
              <p className="text-gray-600 text-center py-8">
                {t('common.noGames')} 🎮
              </p>
            ) : (
              <div className="space-y-2">
                {recentGames.map((game, index) => {
                  // Map game type to translation key
                  const getGameName = (gameType: string) => {
                    const gameTypeMap: Record<string, string> = {
                      'word-stories': 'games.wordStories.name',
                      'balloon-pop': 'games.balloonPop.name',
                      'quick-race': 'games.quickRace.name',
                      'adventure': 'games.adventure.name',
                      'geometry': 'games.geometry.name',
                      'fractions': 'games.fractions.name',
                    };
                    return t(gameTypeMap[gameType] || gameType);
                  };
                  
                  return (
                    <div key={index} className="flex justify-between items-center p-4 bg-pastel-pink rounded-xl">
                      <div>
                        <div className="font-bold text-cute-primary">{getGameName(game.gameType)}</div>
                        <div className="text-sm text-gray-600">
                          {game.correct} {t('pages.dashboard.correct')}, {game.wrong} {t('pages.dashboard.wrong')}
                        </div>
                      </div>
                      <div className="text-lg font-bold text-cute-primary">+{game.xpEarned} {t('common.xp')}</div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

