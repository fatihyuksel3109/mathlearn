'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Confetti from 'react-confetti';
import { useTranslations, useLocale } from 'next-intl';
import { useGameStore } from '@/lib/gameStore';
import { generateBalloonQuestion } from '@/lib/gameUtils';
import Balloon from '@/components/Balloon';
import NavigationBar from '@/components/NavigationBar';
import WrongAnswerFeedback from '@/components/WrongAnswerFeedback';

const TOTAL_BALLOONS = 10;

export default function BalloonPopPage() {
  const router = useRouter();
  const t = useTranslations();
  const locale = useLocale();
  const { correct, wrong, reset, incrementCorrect, incrementWrong } = useGameStore();
  const [balloons, setBalloons] = useState<Array<{ id: number; question: string; answer: number; correctAnswer: number; questionType: string; x: number; delay: number; popped: boolean }>>([]);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const [targetCorrect, setTargetCorrect] = useState(TOTAL_BALLOONS);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [startTime, setStartTime] = useState(0);
  const [showWrongFeedback, setShowWrongFeedback] = useState(false);
  const [questionAnswers, setQuestionAnswers] = useState<Array<{
    questionType: string;
    isCorrect: boolean;
    timeSpent: number;
    timestamp: Date;
  }>>([]);

  useEffect(() => {
    reset();
    if (!gameStarted) {
      generateBalloons();
    }
  }, []);

  const handleGameComplete = useCallback(async () => {
    if (!sessionId) return;
    
    setGameOver(true);
    setShowConfetti(true);

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

    setTimeout(() => setShowConfetti(false), 5000);
  }, [sessionId, correct, wrong, startTime, questionAnswers]);

  useEffect(() => {
    // Check if all correct answers are found
    if (gameStarted && !gameOver && correct === targetCorrect && sessionId) {
      handleGameComplete();
    }
  }, [correct, targetCorrect, gameStarted, gameOver, sessionId, handleGameComplete]);

  const generateBalloons = () => {
    const newBalloons = [];
    let correctCount = 0;
    
    // Generate unique questions for each balloon
    for (let i = 0; i < TOTAL_BALLOONS; i++) {
      const questionData = generateBalloonQuestion(1);
      const question = `${questionData.a} ${questionData.op === '×' ? '×' : questionData.op} ${questionData.b}`;
      
      // Generate wrong answers for this question
      const wrongAnswers = [
        questionData.result + Math.floor(Math.random() * 10) + 1,
        questionData.result - Math.floor(Math.random() * 10) - 1,
        questionData.result + Math.floor(Math.random() * 20) + 5,
      ].filter((opt) => opt !== questionData.result && opt > 0);
      
      // Randomly decide if this balloon shows correct or wrong answer
      // We want roughly 50-60% to be correct, but ensure at least 3 correct balloons
      const shouldBeCorrect = Math.random() > 0.4 || correctCount < 3;
      const displayedAnswer = shouldBeCorrect 
        ? questionData.result 
        : wrongAnswers[Math.floor(Math.random() * wrongAnswers.length)] || questionData.result + 5;
      
      if (shouldBeCorrect) {
        correctCount++;
      }
      
      newBalloons.push({
        id: i,
        question: question,
        answer: displayedAnswer, // Can be correct or wrong
        correctAnswer: questionData.result, // Always store the correct answer
        questionType: questionData.op, // Store operation type for badge tracking
        x: Math.random() * 80 + 10,
        delay: Math.random() * 5,
        popped: false,
      });
    }
    
    // Ensure we have at least 3 correct balloons
    if (correctCount < 3) {
      // Convert some wrong balloons to correct
      let needed = 3 - correctCount;
      for (let i = 0; i < newBalloons.length && needed > 0; i++) {
        if (newBalloons[i].answer !== newBalloons[i].correctAnswer) {
          newBalloons[i].answer = newBalloons[i].correctAnswer;
          needed--;
        }
      }
      correctCount = 3;
    }
    
    setBalloons(newBalloons);
    setTargetCorrect(correctCount);
  };

  const handlePop = (balloonId: number, correct: boolean) => {
    if (gameOver) return;
    
    // Find the balloon to get question type
    const balloon = balloons.find((b) => b.id === balloonId);
    if (!balloon) return;
    
    // Mark balloon as popped
    setBalloons((prev) =>
      prev.map((b) => (b.id === balloonId ? { ...b, popped: true } : b))
    );
    
    if (!correct) {
      incrementWrong(); // Track wrong answer before ending game
      setShowWrongFeedback(true);
      // End game on wrong answer
      setTimeout(() => {
        handleGameComplete();
      }, 2000);
      return; // Don't continue processing
    }
    
    // Track question answer (use operation type for badge tracking)
    const answerTime = Date.now();
    const timeSpent = (answerTime - startTime) / 1000; // Time from game start
    const questionAnswer = {
      questionType: balloon.questionType || 'balloon-pop', // Use operation type for badge tracking
      isCorrect: correct,
      timeSpent,
      timestamp: new Date(answerTime),
    };
    
    setQuestionAnswers((prev) => [...prev, questionAnswer]);
    
    if (correct) {
      incrementCorrect();
      setScore((prev) => prev + 10);
    } else {
      incrementWrong();
    }
  };

  const startGame = async () => {
    try {
      const res = await fetch('/api/game/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gameType: 'balloon-pop', difficulty: 1 }),
      });
      const data = await res.json();
      setSessionId(data.sessionId);
      setGameStarted(true);
      setGameOver(false);
      setShowConfetti(false);
      setStartTime(Date.now());
      reset();
      setScore(0);
      setQuestionAnswers([]);
      generateBalloons();
    } catch (error) {
      console.error('Failed to start game:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pastel-blue via-pastel-green to-pastel-yellow relative overflow-hidden">
      <NavigationBar />
      {typeof window !== 'undefined' && showConfetti && (
        <Confetti width={window.innerWidth} height={window.innerHeight} />
      )}
      
      <WrongAnswerFeedback 
        show={showWrongFeedback} 
        onHide={() => setShowWrongFeedback(false)}
      />
      
      <div className="max-w-6xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white cute-border cute-shadow rounded-2xl p-8"
        >
          <h1 className="text-4xl font-bold text-cute-primary text-center mb-8">
            {t('games.balloonPop.title')}
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
                🎈
              </motion.div>
              <p className="text-xl mb-6 text-gray-700">
                {t('games.balloonPop.instructions', { count: TOTAL_BALLOONS })}
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={startGame}
                className="bg-cute-primary text-white px-8 py-4 rounded-xl text-2xl font-bold cute-shadow"
              >
                {t('games.balloonPop.startPopping')}
              </motion.button>
            </motion.div>
          ) : gameOver ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center"
            >
              <div className="text-6xl mb-6">🎉</div>
              <h2 className="text-3xl font-bold text-cute-primary mb-4">{t('games.balloonPop.allBalloonsPopped')}</h2>
              <div className="space-y-2 text-xl mb-6">
                <p>{t('games.balloonPop.correct')}: {correct} / {targetCorrect}</p>
                <p>{t('games.balloonPop.wrong')}: {wrong}</p>
                <p>{t('common.score')}: {score}</p>
                <p>{t('games.balloonPop.xpEarned')}: {correct * 10}</p>
              </div>
              <div className="flex gap-4 justify-center">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    setGameStarted(false);
                    setGameOver(false);
                    reset();
                    setScore(0);
                  }}
                  className="bg-cute-primary text-white px-6 py-3 rounded-xl font-bold"
                >
                  {t('games.balloonPop.playAgain')}
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => router.push(`/${locale}/dashboard`)}
                  className="bg-cute-secondary text-white px-6 py-3 rounded-xl font-bold"
                >
                  {t('games.balloonPop.dashboard')}
                </motion.button>
              </div>
            </motion.div>
          ) : (
            <>
              <div className="text-center mb-4">
                <div className="text-3xl font-bold text-cute-primary">
                  {t('common.score')}: {score} ⭐
                </div>
                <div className="text-xl text-gray-600 mt-2">
                  {t('games.balloonPop.progress')}: {correct} / {targetCorrect} ✅ | {t('games.balloonPop.wrong')}: {wrong} ❌
                </div>
              </div>

              <div className="relative h-[600px] border-4 border-cute-primary rounded-2xl overflow-hidden bg-gradient-to-t from-pastel-blue to-pastel-green">
                {balloons
                  .filter((balloon) => !balloon.popped)
                  .map((balloon) => (
                    <Balloon
                      key={balloon.id}
                      id={balloon.id}
                      question={balloon.question}
                      answer={balloon.answer}
                      correctAnswer={balloon.correctAnswer}
                      onPop={handlePop}
                      x={balloon.x}
                      delay={balloon.delay}
                    />
                  ))}
              </div>

              <div className="flex justify-center mt-6 gap-4">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    setGameStarted(false);
                    setGameOver(false);
                    reset();
                    setScore(0);
                    setQuestionAnswers([]);
                  }}
                  className="bg-cute-secondary text-white px-6 py-3 rounded-xl font-bold"
                >
                  {t('games.balloonPop.backToMenu')}
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => router.push(`/${locale}/dashboard`)}
                  className="bg-cute-accent text-white px-6 py-3 rounded-xl font-bold"
                >
                  {t('games.balloonPop.dashboard')}
                </motion.button>
              </div>
            </>
          )}
        </motion.div>
      </div>
    </div>
  );
}

