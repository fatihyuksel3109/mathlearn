'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useTranslations, useLocale } from 'next-intl';
import NavigationBar from '@/components/NavigationBar';
import CuteAvatar from '@/components/CuteAvatar';

interface LeaderboardUser {
  _id: string;
  name: string;
  email: string;
  avatar: string;
  xp: number;
  badges: string[];
}

interface Champion {
  userId: string;
  userName: string;
  userAvatar: string;
  xp: number;
  period: string;
}

interface ChampionsData {
  current: {
    daily: Champion | null;
    weekly: Champion | null;
    monthly: Champion | null;
  };
  historical: {
    daily: Champion[];
    weekly: Champion[];
    monthly: Champion[];
  };
}

type PeriodType = 'all-time' | 'daily' | 'weekly' | 'monthly';

export default function LeaderboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const t = useTranslations();
  const locale = useLocale();
  const [users, setUsers] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodType>('all-time');
  const [champions, setChampions] = useState<ChampionsData | null>(null);
  const [currentChampion, setCurrentChampion] = useState<Champion | null>(null);

  const fetchLeaderboard = useCallback(async (period: PeriodType = 'all-time') => {
    try {
      setLoading(true);
      const res = await fetch(`/api/leaderboard?period=${period}`, { cache: 'no-store' });
      const data = await res.json();
      setUsers(data.users || []);
      setCurrentChampion(data.currentChampion || null);
    } catch (error) {
      console.error('Failed to fetch leaderboard:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchChampions = useCallback(async () => {
    try {
      const res = await fetch('/api/champions', { cache: 'no-store' });
      const data = await res.json();
      setChampions(data);
    } catch (error) {
      console.error('Failed to fetch champions:', error);
    }
  }, []);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push(`/${locale}/login`);
      return;
    }

    if (status === 'authenticated') {
      fetchLeaderboard(selectedPeriod);
      fetchChampions();
    }
  }, [status, router, fetchLeaderboard, fetchChampions, selectedPeriod]);

  // Refresh leaderboard when page becomes visible (user returns from game)
  useEffect(() => {
    if (status !== 'authenticated') return;

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetchLeaderboard(selectedPeriod);
        fetchChampions();
      }
    };

    const handleFocus = () => {
      fetchLeaderboard(selectedPeriod);
      fetchChampions();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, [status, fetchLeaderboard, fetchChampions, selectedPeriod]);

  const handlePeriodChange = (period: PeriodType) => {
    setSelectedPeriod(period);
    fetchLeaderboard(period);
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-4xl">🦊</div>
      </div>
    );
  }

  const getRankEmoji = (index: number) => {
    if (index === 0) return '🥇';
    if (index === 1) return '🥈';
    if (index === 2) return '🥉';
    return `${index + 1}.`;
  };

  const getPeriodLabel = (period: PeriodType) => {
    switch (period) {
      case 'all-time':
        return t('pages.leaderboard.allTime');
      case 'daily':
        return t('pages.leaderboard.daily');
      case 'weekly':
        return t('pages.leaderboard.weekly');
      case 'monthly':
        return t('pages.leaderboard.monthly');
    }
  };

  const getChampionLabel = (period: PeriodType) => {
    switch (period) {
      case 'daily':
        return t('pages.leaderboard.dailyChampion');
      case 'weekly':
        return t('pages.leaderboard.weeklyChampion');
      case 'monthly':
        return t('pages.leaderboard.monthlyChampion');
      default:
        return '';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pastel-yellow via-pastel-peach to-pastel-pink">
      <NavigationBar />
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white cute-border cute-shadow rounded-2xl p-8"
        >
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-4xl font-bold text-cute-primary">
              🏆 {t('pages.leaderboard.title')} 🏆
            </h1>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                fetchLeaderboard(selectedPeriod);
                fetchChampions();
              }}
              className="bg-cute-primary text-white px-4 py-2 rounded-xl font-bold text-sm"
              disabled={loading}
            >
              🔄 {t('common.refresh')}
            </motion.button>
          </div>

          {/* Period Tabs */}
          <div className="flex flex-wrap gap-2 mb-6">
            {(['all-time', 'daily', 'weekly', 'monthly'] as PeriodType[]).map((period) => (
              <motion.button
                key={period}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handlePeriodChange(period)}
                className={`px-4 py-2 rounded-xl font-bold text-sm transition-colors ${
                  selectedPeriod === period
                    ? 'bg-cute-primary text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {getPeriodLabel(period)}
              </motion.button>
            ))}
          </div>

          {/* Current Champion Display */}
          {currentChampion && selectedPeriod !== 'all-time' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-6 p-6 bg-gradient-to-r from-yellow-200 via-yellow-300 to-yellow-200 rounded-2xl cute-border border-4 border-yellow-400"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="text-4xl">👑</div>
                  <div>
                    <div className="text-sm font-semibold text-gray-600 mb-1">
                      {getChampionLabel(selectedPeriod)}
                    </div>
                    <div className="flex items-center space-x-3">
                      <CuteAvatar avatar={currentChampion.userAvatar} size="md" />
                      <div>
                        <div className="text-2xl font-bold text-cute-primary">
                          {currentChampion.userName}
                        </div>
                        <div className="text-lg text-gray-600">
                          {currentChampion.xp} {t('common.xp')}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Historical Champions */}
          {champions && (
            <div className="mb-6 space-y-3">
              {selectedPeriod === 'daily' && champions.historical.daily.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="p-4 bg-gray-50 rounded-xl cute-border"
                >
                  <div className="text-sm font-semibold text-gray-600 mb-2">
                    {t('pages.leaderboard.lastDaysChampion')}
                  </div>
                  <div className="flex items-center space-x-3">
                    <CuteAvatar avatar={champions.historical.daily[0].userAvatar} size="sm" />
                    <div>
                      <div className="font-bold text-cute-primary">{champions.historical.daily[0].userName}</div>
                      <div className="text-sm text-gray-600">
                        {champions.historical.daily[0].xp} {t('common.xp')}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
              {selectedPeriod === 'weekly' && champions.historical.weekly.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="p-4 bg-gray-50 rounded-xl cute-border"
                >
                  <div className="text-sm font-semibold text-gray-600 mb-2">
                    {t('pages.leaderboard.lastWeeksChampion')}
                  </div>
                  <div className="flex items-center space-x-3">
                    <CuteAvatar avatar={champions.historical.weekly[0].userAvatar} size="sm" />
                    <div>
                      <div className="font-bold text-cute-primary">{champions.historical.weekly[0].userName}</div>
                      <div className="text-sm text-gray-600">
                        {champions.historical.weekly[0].xp} {t('common.xp')}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
              {selectedPeriod === 'monthly' && champions.historical.monthly.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="p-4 bg-gray-50 rounded-xl cute-border"
                >
                  <div className="text-sm font-semibold text-gray-600 mb-2">
                    {t('pages.leaderboard.lastMonthsChampion')}
                  </div>
                  <div className="flex items-center space-x-3">
                    <CuteAvatar avatar={champions.historical.monthly[0].userAvatar} size="sm" />
                    <div>
                      <div className="font-bold text-cute-primary">{champions.historical.monthly[0].userName}</div>
                      <div className="text-sm text-gray-600">
                        {champions.historical.monthly[0].xp} {t('common.xp')}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          )}

          {users.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📊</div>
              <p className="text-xl text-gray-600">{t('common.noPlayers')}</p>
            </div>
          ) : (
            <div className="space-y-4">
              {users.map((user, index) => (
                <motion.div
                  key={user._id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.02 }}
                  className={`flex items-center justify-between p-2 sm:p-6 rounded-2xl cute-border border-4 ${
                    index < 3
                      ? 'bg-gradient-to-r from-pastel-yellow to-pastel-peach'
                      : 'bg-white'
                  }`}
                >
                  <div className="flex items-center space-x-4">
                    <div className="text-3xl font-bold text-cute-primary w-12 text-center">
                      {getRankEmoji(index)}
                    </div>
                    <CuteAvatar avatar={user.avatar} size="md" />
                    <div>
                      <div className="text-xl font-bold text-cute-primary">{user.name}</div>
                      <div className="text-sm text-gray-600">{user.badges.length} {t('common.badges')}</div>
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-cute-primary">{user.xp} {t('common.xp')}</div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}

