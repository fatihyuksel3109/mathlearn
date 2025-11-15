'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations, useLocale, useMessages } from 'next-intl';
import { generateWordProblem } from '@/lib/gameUtils';
import StoryAnimation from '@/components/StoryAnimation';
import AnswerButtons from '@/components/AnswerButtons';
import NavigationBar from '@/components/NavigationBar';

export default function WordStoriesPage() {
  const router = useRouter();
  const t = useTranslations();
  const locale = useLocale();
  const messages = useMessages();
  const [problem, setProblem] = useState(() => generateWordProblem(t, messages, locale));
  const [storyComplete, setStoryComplete] = useState(false);
  const [answered, setAnswered] = useState(false);
  const [correct, setCorrect] = useState(false);
  const [score, setScore] = useState(0);
  const [showFeedback, setShowFeedback] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [startTime, setStartTime] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);
  const correctCountRef = useRef(0);
  const wrongCountRef = useRef(0);
  const sessionIdRef = useRef<string | null>(null);
  const startTimeRef = useRef(0);

  useEffect(() => {
    correctCountRef.current = correctCount;
    wrongCountRef.current = wrongCount;
    sessionIdRef.current = sessionId;
    startTimeRef.current = startTime;
  }, [correctCount, wrongCount, sessionId, startTime]);

  useEffect(() => {
    // Start game session on mount
    const startSession = async () => {
      try {
        const res = await fetch('/api/game/start', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ gameType: 'word-stories', difficulty: 1 }),
        });
        const data = await res.json();
        setSessionId(data.sessionId);
        setStartTime(Date.now());
        sessionIdRef.current = data.sessionId;
        startTimeRef.current = Date.now();
      } catch (error) {
        console.error('Failed to start game session:', error);
      }
    };
    startSession();

    // Submit results on unmount
    return () => {
      if (sessionIdRef.current) {
        const timeSpent = Math.floor((Date.now() - startTimeRef.current) / 1000);
        fetch('/api/game/submit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sessionId: sessionIdRef.current,
            correct: correctCountRef.current,
            wrong: wrongCountRef.current,
            timeSpent,
          }),
        }).catch(console.error);
      }
    };
  }, []);

  const handleStoryComplete = () => {
    setStoryComplete(true);
  };

  const handleAnswer = (answer: number) => {
    setAnswered(true);
    if (answer === problem.answer) {
      setCorrect(true);
      setScore(score + 10);
      setCorrectCount(correctCount + 1);
    } else {
      setCorrect(false);
      setWrongCount(wrongCount + 1);
    }
    setShowFeedback(true);
  };

  const submitGameResults = async () => {
    if (!sessionId) return;
    
    const timeSpent = Math.floor((Date.now() - startTime) / 1000);
    try {
      await fetch('/api/game/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          correct: correctCount,
          wrong: wrongCount,
          timeSpent,
        }),
      });
    } catch (error) {
      console.error('Failed to submit game:', error);
    }
  };

  const nextProblem = () => {
    setProblem(generateWordProblem(t, messages, locale));
    setStoryComplete(false);
    setAnswered(false);
    setCorrect(false);
    setShowFeedback(false);
  };

  const handleDashboard = async () => {
    await submitGameResults();
    router.push(`/${locale}/dashboard`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pastel-peach via-pastel-yellow to-pastel-pink">
      <NavigationBar />
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white cute-border cute-shadow rounded-2xl p-8"
        >
          <h1 className="text-4xl font-bold text-cute-primary text-center mb-8">
            📖 {t('games.wordStories.title')} 📖
          </h1>

          <div className="text-center mb-4">
            <div className="text-2xl font-bold text-cute-primary">
              {t('common.score')}: {score} ⭐
            </div>
          </div>

          {!storyComplete ? (
            <StoryAnimation story={problem.story} onComplete={handleStoryComplete} />
          ) : !answered ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="bg-gradient-to-br from-pastel-yellow to-pastel-peach rounded-2xl p-8 cute-border border-4 border-cute-primary mb-8">
                <div className="text-3xl font-bold text-cute-primary mb-4">
                  {problem.question}
                </div>
              </div>
              <AnswerButtons options={problem.options} onAnswer={handleAnswer} />
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center"
            >
              <AnimatePresence>
                {correct ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0 }}
                  >
                    <div className="text-8xl mb-4">🎉</div>
                    <h2 className="text-4xl font-bold text-cute-primary mb-4">{t('games.wordStories.correct')} 🎊</h2>
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0 }}
                  >
                    <div className="text-6xl mb-4">😊</div>
                    <h2 className="text-3xl font-bold text-cute-primary mb-2">
                      {t('games.wordStories.incorrect')}
                    </h2>
                    <p className="text-xl text-gray-600 mb-4">
                      {t('games.wordStories.correctAnswer', { answer: problem.answer })}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="flex justify-center gap-4 mt-6">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={nextProblem}
                  className="bg-cute-primary text-white px-6 py-3 rounded-xl font-bold"
                >
                  {t('games.wordStories.nextStory')}
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleDashboard}
                  className="bg-cute-secondary text-white px-6 py-3 rounded-xl font-bold"
                >
                  {t('games.wordStories.dashboard')}
                </motion.button>
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
}

