'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Confetti from 'react-confetti';
import { useTranslations, useLocale } from 'next-intl';
import { useGameStore } from '@/lib/gameStore';
import { generateRaceQuestion } from '@/lib/gameUtils';
import GameTimer from '@/components/GameTimer';
import AnswerButtons from '@/components/AnswerButtons';
import NavigationBar from '@/components/NavigationBar';

export default function QuickRacePage() {
  const router = useRouter();
  const t = useTranslations();
  const locale = useLocale();
  const { correct, wrong, reset, incrementCorrect, incrementWrong } = useGameStore();
  const [question, setQuestion] = useState(generateRaceQuestion(1));
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [startTime, setStartTime] = useState(0);
  const [questionAnswers, setQuestionAnswers] = useState<Array<{
    questionType: string;
    isCorrect: boolean;
    timeSpent: number;
    timestamp: Date;
  }>>([]);
  const [questionStartTime, setQuestionStartTime] = useState(0);

  useEffect(() => {
    reset();
  }, [reset]);

  const startGame = async () => {
    try {
      const res = await fetch('/api/game/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gameType: 'quick-race', difficulty: 1 }),
      });
      const data = await res.json();
      setSessionId(data.sessionId);
      setGameStarted(true);
      setStartTime(Date.now());
      setQuestionStartTime(Date.now());
      setQuestionAnswers([]);
    } catch (error) {
      console.error('Failed to start game:', error);
    }
  };

  const handleAnswer = (answer: number) => {
    if (gameOver) return;

    const answerTime = Date.now();
    const timeSpent = (answerTime - questionStartTime) / 1000; // Convert to seconds
    const isCorrect = answer === question.result;

    // Track question answer
    const questionAnswer = {
      questionType: question.op,
      isCorrect,
      timeSpent,
      timestamp: new Date(answerTime),
    };

    setQuestionAnswers((prev) => [...prev, questionAnswer]);

    if (isCorrect) {
      incrementCorrect();
      setQuestion(generateRaceQuestion(correct + 1));
    } else {
      incrementWrong();
      setQuestion(generateRaceQuestion(correct + 1));
    }

    // Start timer for next question
    setQuestionStartTime(answerTime);
  };

  const handleTimerComplete = async () => {
    setGameOver(true);
    setShowConfetti(true);

    if (sessionId) {
      const timeSpent = Math.floor((Date.now() - startTime) / 1000);
      try {
        const response = await fetch('/api/game/submit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sessionId,
            correct,
            wrong,
            timeSpent,
            questionAnswers,
          }),
        });
        const data = await response.json();
        if (data.newlyEarnedBadges && data.newlyEarnedBadges.length > 0) {
          // Could show a notification here for new badges
          console.log('New badges earned:', data.newlyEarnedBadges);
        }
      } catch (error) {
        console.error('Failed to submit game:', error);
      }
    }

    setTimeout(() => setShowConfetti(false), 5000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pastel-pink via-pastel-purple to-pastel-blue relative overflow-hidden">
      <NavigationBar />
      {/* Floating decorative elements */}
      <motion.div
        animate={{ y: [0, -20, 0], rotate: [0, 10, 0] }}
        transition={{ repeat: Infinity, duration: 3 }}
        className="absolute top-20 right-10 text-5xl opacity-20"
      >
        ⭐
      </motion.div>
      <motion.div
        animate={{ y: [0, -15, 0] }}
        transition={{ repeat: Infinity, duration: 4, delay: 1 }}
        className="absolute bottom-20 left-10 text-4xl opacity-20"
      >
        🎈
      </motion.div>
      {typeof window !== 'undefined' && showConfetti && (
        <Confetti width={window.innerWidth} height={window.innerHeight} />
      )}
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white cute-border cute-shadow rounded-2xl p-8"
        >
          <h1 className="text-4xl font-bold text-cute-primary text-center mb-8">
            {t('games.quickRace.title')}
          </h1>

          {!gameStarted ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center"
            >
              <motion.div
                animate={{ y: [0, -20, 0] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="text-8xl mb-6"
              >
                🏃
              </motion.div>
              <p className="text-xl mb-6 text-gray-700">
                {t('games.quickRace.startInstructions')}
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={startGame}
                className="bg-cute-primary text-white px-8 py-4 rounded-xl text-2xl font-bold cute-shadow"
              >
                {t('games.quickRace.startRace')}
              </motion.button>
            </motion.div>
          ) : gameOver ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center"
            >
              <div className="text-6xl mb-6">🎉</div>
              <h2 className="text-3xl font-bold text-cute-primary mb-4">{t('games.quickRace.gameOver')}</h2>
              <div className="space-y-2 text-xl mb-6">
                <p>{t('games.quickRace.correctAnswers')}: {correct}</p>
                <p>{t('games.quickRace.wrongAnswers')}: {wrong}</p>
                <p>{t('games.quickRace.xpEarned')}: {correct * 10}</p>
              </div>
              <div className="flex gap-4 justify-center">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    reset();
                    setGameStarted(false);
                    setGameOver(false);
                    setQuestion(generateRaceQuestion(1));
                    setQuestionAnswers([]);
                  }}
                  className="bg-cute-primary text-white px-6 py-3 rounded-xl font-bold"
                >
                  {t('games.quickRace.playAgain')}
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => router.push(`/${locale}/dashboard`)}
                  className="bg-cute-secondary text-white px-6 py-3 rounded-xl font-bold"
                >
                  {t('games.quickRace.dashboard')}
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

