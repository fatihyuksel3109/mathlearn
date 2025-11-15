'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useTranslations, useLocale } from 'next-intl';
import NavigationBar from '@/components/NavigationBar';
import CuteAvatar from '@/components/CuteAvatar';
import BadgeDisplay from '@/components/BadgeDisplay';

interface UserData {
  name: string;
  email: string;
  avatar: string;
  xp: number;
  streak: number;
  badges: string[];
}

interface GameProgress {
  gameType: string;
  progress: number;
  gamesPlayed: number;
  totalXP: number;
  totalCorrect: number;
  totalWrong: number;
}

const availableAvatars = ['fox', 'panda', 'cat', 'dog', 'bunny', 'bear'];

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const t = useTranslations();
  const locale = useLocale();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedAvatar, setSelectedAvatar] = useState('fox');
  const [gameProgress, setGameProgress] = useState<GameProgress[]>([]);

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
      setSelectedAvatar(data.user.avatar || 'fox');
      setGameProgress(data.gameProgress || []);
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
      setSelectedAvatar((session?.user as any)?.avatar || 'fox');
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarChange = async (avatar: string) => {
    setSelectedAvatar(avatar);
    try {
      const res = await fetch('/api/user/avatar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ avatar }),
      });
      if (res.ok) {
        const data = await res.json();
        if (userData) {
          setUserData({ ...userData, avatar: data.avatar });
        }
      }
    } catch (error) {
      console.error('Failed to update avatar:', error);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-4xl">🦊</div>
      </div>
    );
  }

  // Map game types to display names and colors
  const gameTypeMap: Record<string, { name: string; color: string }> = {
    'quick-race': { name: t('games.quickRace.name'), color: 'bg-cute-primary' },
    'balloon-pop': { name: t('games.balloonPop.name'), color: 'bg-cute-secondary' },
    'adventure': { name: t('games.adventure.name'), color: 'bg-cute-accent' },
    'fractions': { name: t('games.fractions.name'), color: 'bg-pastel-pink' },
    'geometry': { name: t('games.geometry.name'), color: 'bg-pastel-purple' },
    'word-stories': { name: t('games.wordStories.name'), color: 'bg-pastel-blue' },
  };

  // Use real game progress data, fallback to empty if not available
  const displayGameProgress = gameProgress.length > 0
    ? gameProgress.map((gp) => ({
        game: gameTypeMap[gp.gameType]?.name || gp.gameType,
        progress: gp.progress,
        color: gameTypeMap[gp.gameType]?.color || 'bg-gray-400',
        gamesPlayed: gp.gamesPlayed,
      }))
    : [
        { game: t('games.quickRace.name'), progress: 0, color: 'bg-cute-primary', gamesPlayed: 0 },
        { game: t('games.balloonPop.name'), progress: 0, color: 'bg-cute-secondary', gamesPlayed: 0 },
        { game: t('games.adventure.name'), progress: 0, color: 'bg-cute-accent', gamesPlayed: 0 },
        { game: t('games.fractions.name'), progress: 0, color: 'bg-pastel-pink', gamesPlayed: 0 },
        { game: t('games.geometry.name'), progress: 0, color: 'bg-pastel-purple', gamesPlayed: 0 },
        { game: t('games.wordStories.name'), progress: 0, color: 'bg-pastel-blue', gamesPlayed: 0 },
      ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-pastel-purple via-pastel-pink to-pastel-blue">
      <NavigationBar />
      
      <div className="max-w-6xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Profile Header */}
          <div className="bg-white cute-border cute-shadow rounded-2xl p-8">
            <div className="flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-8">
              <CuteAvatar avatar={selectedAvatar} size="lg" />
              <div className="flex-1 text-center md:text-left">
                <h1 className="text-4xl font-bold text-cute-primary mb-2">
                  {userData?.name || 'Player'}
                </h1>
                <p className="text-gray-600 mb-4">{userData?.email}</p>
                <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                  <div className="bg-pastel-pink rounded-xl px-4 py-2">
                    <div className="text-2xl font-bold text-cute-primary">{userData?.xp || 0}</div>
                    <div className="text-sm text-gray-600">{t('common.totalXP')}</div>
                  </div>
                  <div className="bg-pastel-yellow rounded-xl px-4 py-2">
                    <div className="text-2xl font-bold text-cute-primary">{userData?.streak || 0}</div>
                    <div className="text-sm text-gray-600">{t('common.streak')}</div>
                  </div>
                  <div className="bg-pastel-blue rounded-xl px-4 py-2">
                    <div className="text-2xl font-bold text-cute-primary">{userData?.badges?.length || 0}</div>
                    <div className="text-sm text-gray-600">{t('common.badges')}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Avatar Selection */}
          <div className="bg-white cute-border cute-shadow rounded-2xl p-6">
            <h2 className="text-2xl font-bold text-cute-primary mb-4">{t('pages.profile.chooseAvatar')}</h2>
            <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
              {availableAvatars.map((avatar) => (
                <motion.button
                  key={avatar}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => handleAvatarChange(avatar)}
                  className={`p-4 rounded-2xl cute-border border-4 ${
                    selectedAvatar === avatar
                      ? 'border-cute-primary bg-pastel-pink'
                      : 'border-gray-300 bg-white'
                  }`}
                >
                  <CuteAvatar avatar={avatar} size="md" />
                </motion.button>
              ))}
            </div>
          </div>

          {/* Badges */}
          <div className="bg-white cute-border cute-shadow rounded-2xl p-6">
            <h2 className="text-2xl font-bold text-cute-primary mb-4">{t('pages.profile.yourBadges')}</h2>
            <BadgeDisplay badges={userData?.badges || []} />
          </div>

          {/* Game Progress */}
          <div className="bg-white cute-border cute-shadow rounded-2xl p-6">
            <h2 className="text-2xl font-bold text-cute-primary mb-4">{t('pages.profile.gameProgress')}</h2>
            <div className="space-y-4">
              {displayGameProgress.map((game) => (
                <div key={game.game}>
                  <div className="flex justify-between mb-2">
                    <div>
                      <span className="font-bold text-cute-primary">{game.game}</span>
                      {game.gamesPlayed !== undefined && (
                        <span className="text-sm text-gray-500 ml-2">
                          ({game.gamesPlayed} {t('common.games')})
                        </span>
                      )}
                    </div>
                    <span className="text-gray-600">{game.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden border-2 border-gray-400">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${game.progress}%` }}
                      transition={{ duration: 1 }}
                      className={`h-full ${game.color}`}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

