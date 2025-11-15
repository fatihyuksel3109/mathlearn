'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations, useLocale } from 'next-intl';
import LevelMap from '@/components/LevelMap';
import NavigationBar from '@/components/NavigationBar';
import GameTimer from '@/components/GameTimer';
import AnswerButtons from '@/components/AnswerButtons';
import { generateRaceQuestion } from '@/lib/gameUtils';
import { useGameStore } from '@/lib/gameStore';
import Confetti from 'react-confetti';

interface Level {
  id: string;
  name: string;
  difficulty: number;
  stars: number;
  completed: boolean;
  icon: string;
  position: { x: number; y: number };
}

function AdventureContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const t = useTranslations();
  const locale = useLocale();
  const levelParam = searchParams.get('level');
  const { correct, wrong, reset, incrementCorrect, incrementWrong } = useGameStore();
  
  const [levels, setLevels] = useState<Level[]>([
    { id: '1', name: 'Island Start', difficulty: 1, stars: 0, completed: false, icon: '🏝️', position: { x: 10, y: 20 } },
    { id: '2', name: 'Desert Oasis', difficulty: 2, stars: 0, completed: false, icon: '🏜️', position: { x: 30, y: 40 } },
    { id: '3', name: 'Mountain Peak', difficulty: 3, stars: 0, completed: false, icon: '⛰️', position: { x: 50, y: 20 } },
    { id: '4', name: 'Forest Path', difficulty: 2, stars: 0, completed: false, icon: '🌲', position: { x: 70, y: 50 } },
    { id: '5', name: 'Crystal Cave', difficulty: 4, stars: 0, completed: false, icon: '💎', position: { x: 20, y: 70 } },
    { id: '6', name: 'Sky Castle', difficulty: 5, stars: 0, completed: false, icon: '🏰', position: { x: 80, y: 10 } },
  ]);

  const [currentLevel, setCurrentLevel] = useState<Level | null>(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [question, setQuestion] = useState(generateRaceQuestion(1));
  const [showConfetti, setShowConfetti] = useState(false);
  const [startTime, setStartTime] = useState(0);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [earnedStars, setEarnedStars] = useState(0);

  useEffect(() => {
    if (levelParam) {
      const level = levels.find((l) => l.id === levelParam);
      if (level) {
        // Level 1 is always unlocked, others need previous level completed
        const isUnlocked = level.id === '1' || 
          (parseInt(level.id) > 1 && levels.find((l) => l.id === String(parseInt(level.id) - 1))?.completed);
        
        if (isUnlocked) {
          setCurrentLevel(level);
        } else {
          // Level locked, go back to map
          router.replace(`/${locale}/games/adventure`);
        }
      } else {
        // Level not found, go back to map
        router.replace(`/${locale}/games/adventure`);
      }
    } else {
      fetchLevelProgress();
    }
  }, [levelParam, levels]);

  useEffect(() => {
    reset();
  }, [reset]);

  const fetchLevelProgress = async () => {
    try {
      // In a real app, fetch from API
      // For now, we'll use the default state
    } catch (error) {
      console.error('Failed to fetch level progress:', error);
    }
  };

  const startGame = async () => {
    if (!currentLevel) return;
    
    try {
      const res = await fetch('/api/game/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gameType: 'adventure', difficulty: currentLevel.difficulty }),
      });
      const data = await res.json();
      setSessionId(data.sessionId);
      setGameStarted(true);
      setStartTime(Date.now());
      setQuestion(generateRaceQuestion(currentLevel.difficulty));
    } catch (error) {
      console.error('Failed to start game:', error);
    }
  };

  const handleAnswer = (answer: number) => {
    if (gameOver || !currentLevel) return;

    if (answer === question.result) {
      incrementCorrect();
      setQuestion(generateRaceQuestion(currentLevel.difficulty));
    } else {
      incrementWrong();
      setQuestion(generateRaceQuestion(currentLevel.difficulty));
    }
  };

  const handleTimerComplete = async () => {
    if (!currentLevel || !sessionId) return;
    
    setGameOver(true);
    setShowConfetti(true);

    const timeSpent = Math.floor((Date.now() - startTime) / 1000);
    
    try {
      // Submit game results
      await fetch('/api/game/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          correct,
          wrong,
          timeSpent,
        }),
      });

      // Calculate stars based on performance
      const totalQuestions = correct + wrong;
      const accuracy = totalQuestions > 0 ? correct / totalQuestions : 0;
      let stars = 0;
      if (accuracy >= 0.9 && correct >= 10) stars = 3;
      else if (accuracy >= 0.7 && correct >= 7) stars = 2;
      else if (correct >= 5) stars = 1;
      
      setEarnedStars(stars);

      // Mark level as completed
      await fetch('/api/level/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          levelId: currentLevel.id,
          stars,
        }),
      });

      // Update local state - mark current level as completed and unlock next level
      setLevels((prev) =>
        prev.map((l) => {
          if (l.id === currentLevel.id) {
            return { ...l, completed: true, stars };
          }
          // Unlock next level if current level is completed
          const nextLevelId = String(parseInt(currentLevel.id) + 1);
          if (l.id === nextLevelId) {
            // Next level is now unlocked (but not completed yet)
            return l;
          }
          return l;
        })
      );
    } catch (error) {
      console.error('Failed to submit game:', error);
    }

    setTimeout(() => setShowConfetti(false), 5000);
  };

  const backToMap = () => {
    setCurrentLevel(null);
    setGameStarted(false);
    setGameOver(false);
    setEarnedStars(0);
    reset();
    router.replace(`/${locale}/games/adventure`);
  };

  // Show game screen if level is selected
  if (currentLevel) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pastel-yellow via-pastel-peach to-pastel-pink relative overflow-hidden">
        <NavigationBar />
        {typeof window !== 'undefined' && showConfetti && (
          <Confetti width={window.innerWidth} height={window.innerHeight} />
        )}
        
        <div className="max-w-4xl mx-auto px-4 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white cute-border cute-shadow rounded-2xl p-8"
          >
            <div className="text-center mb-6">
              <div className="text-6xl mb-4">{currentLevel.icon}</div>
              <h1 className="text-4xl font-bold text-cute-primary mb-2">
                {currentLevel.name}
              </h1>
              <p className="text-gray-600">{t('games.adventure.difficulty')}: {currentLevel.difficulty} ⭐</p>
            </div>

            {!gameStarted ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center"
              >
                <p className="text-xl mb-6 text-gray-700">
                  {t('games.adventure.startInstructions')}
                </p>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={startGame}
                  className="bg-cute-primary text-white px-8 py-4 rounded-xl text-2xl font-bold cute-shadow"
                >
                  {t('games.adventure.startLevel')}
                </motion.button>
                <div className="mt-4">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={backToMap}
                    className="bg-gray-400 text-white px-6 py-3 rounded-xl font-bold"
                  >
                    {t('games.adventure.backToMap')}
                  </motion.button>
                </div>
              </motion.div>
            ) : gameOver ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center"
              >
                <div className="text-6xl mb-6">🎉</div>
                <h2 className="text-3xl font-bold text-cute-primary mb-4">{t('games.adventure.levelComplete')}</h2>
                <div className="space-y-2 text-xl mb-6">
                  <p>✅ {t('games.quickRace.correctAnswers')}: {correct}</p>
                  <p>❌ {t('games.quickRace.wrongAnswers')}: {wrong}</p>
                  <p>{t('games.adventure.xpEarned')}: {correct * 10}</p>
                  <div className="flex justify-center gap-2 mt-4">
                    {[...Array(3)].map((_, i) => (
                      <span
                        key={i}
                        className={`text-4xl ${i < earnedStars ? 'text-yellow-400' : 'text-gray-300'}`}
                      >
                        ⭐
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex gap-4 justify-center">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={backToMap}
                    className="bg-cute-primary text-white px-6 py-3 rounded-xl font-bold"
                  >
                    {t('games.adventure.backToMap')}
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => router.push(`/${locale}/dashboard`)}
                    className="bg-cute-secondary text-white px-6 py-3 rounded-xl font-bold"
                  >
                    {t('games.adventure.backToDashboard')}
                  </motion.button>
                </div>
              </motion.div>
            ) : (
              <>
                <div className="flex justify-center mb-8">
                  <GameTimer duration={60} onComplete={handleTimerComplete} />
                </div>

                <div className="text-center mb-8">
                  <div className="text-6xl font-bold text-cute-primary mb-4">
                    {question.a} {question.op === '×' ? '×' : question.op} {question.b} = ?
                  </div>
                  <div className="text-2xl text-gray-600">
                    {t('common.score')}: {correct} ✅ | {wrong} ❌
                  </div>
                </div>

                <AnswerButtons options={question.options} onAnswer={handleAnswer} />
              </>
            )}
          </motion.div>
        </div>
      </div>
    );
  }

  // Show map view
  return (
    <div className="min-h-screen bg-gradient-to-br from-pastel-yellow via-pastel-peach to-pastel-pink">
      <NavigationBar />
      
      <div className="max-w-6xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white cute-border cute-shadow rounded-2xl p-8"
        >
          <h1 className="text-4xl font-bold text-cute-primary text-center mb-8">
            {t('games.adventure.title')}
          </h1>

          <p className="text-center text-gray-700 mb-6">
            {t('games.adventure.mapDescription')}
          </p>

          <LevelMap levels={levels} />

          <div className="flex justify-center mt-6">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => router.push(`/${locale}/dashboard`)}
              className="bg-cute-primary text-white px-6 py-3 rounded-xl font-bold"
            >
              {t('games.adventure.backToDashboard')}
            </motion.button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default function AdventurePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-pastel-yellow via-pastel-peach to-pastel-pink flex items-center justify-center">
        <div className="text-2xl text-cute-primary">Loading...</div>
      </div>
    }>
      <AdventureContent />
    </Suspense>
  );
}

