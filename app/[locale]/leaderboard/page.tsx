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

export default function LeaderboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const t = useTranslations();
  const locale = useLocale();
  const [users, setUsers] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLeaderboard = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/leaderboard', { cache: 'no-store' });
      const data = await res.json();
      setUsers(data.users || []);
    } catch (error) {
      console.error('Failed to fetch leaderboard:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push(`/${locale}/login`);
      return;
    }

    if (status === 'authenticated') {
      fetchLeaderboard();
    }
  }, [status, router, fetchLeaderboard]);

  // Refresh leaderboard when page becomes visible (user returns from game)
  useEffect(() => {
    if (status !== 'authenticated') return;

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetchLeaderboard();
      }
    };

    const handleFocus = () => {
      fetchLeaderboard();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, [status, fetchLeaderboard]);

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
              onClick={() => fetchLeaderboard()}
              className="bg-cute-primary text-white px-4 py-2 rounded-xl font-bold text-sm"
              disabled={loading}
            >
              🔄 {t('common.refresh')}
            </motion.button>
          </div>

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
                  className={`flex items-center justify-between p-6 rounded-2xl cute-border border-4 ${
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

