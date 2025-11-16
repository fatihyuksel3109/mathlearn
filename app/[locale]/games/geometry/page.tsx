'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations, useLocale } from 'next-intl';
import { generateGeometryQuestion } from '@/lib/geometryQuestions';
import NavigationBar from '@/components/NavigationBar';
import WrongAnswerFeedback from '@/components/WrongAnswerFeedback';

function TargetBox({ 
  id, 
  label, 
  shapeId, 
  selectedShape, 
  onClick,
  disabled
}: { 
  id: string; 
  label: string; 
  shapeId: string | null;
  selectedShape: string | null;
  onClick: () => void;
  disabled?: boolean;
}) {
  const isSelected = selectedShape !== null && shapeId === null;
  const hasShape = shapeId !== null;

  return (
    <motion.button
      onClick={onClick}
      disabled={hasShape || disabled}
      whileHover={!hasShape && !disabled ? { scale: 1.05 } : {}}
      whileTap={!hasShape && !disabled ? { scale: 0.95 } : {}}
      className={`bg-white cute-border border-4 rounded-2xl p-6 text-center min-h-[150px] flex flex-col items-center justify-center transition-colors touch-manipulation ${
        disabled
          ? 'opacity-50 cursor-not-allowed'
          : hasShape
          ? 'bg-pastel-green border-cute-accent cursor-default'
          : isSelected
          ? 'bg-pastel-blue border-cute-accent'
          : 'border-cute-primary hover:bg-pastel-pink'
      }`}
      style={{ WebkitTapHighlightColor: 'transparent' }}
    >
      {hasShape ? (
        <div className="text-5xl mb-2">
          {shapeId === 'triangle' ? '🔺' : shapeId === 'square' ? '⬜' : '⭕'}
        </div>
      ) : null}
      <div className="text-xl font-bold text-cute-primary">{label}</div>
    </motion.button>
  );
}

export default function GeometryPage() {
  const router = useRouter();
  const t = useTranslations();
  const locale = useLocale();
  // Geometry quiz question; initialized on client to avoid SSR/client mismatch
  const [geometryQuestion, setGeometryQuestion] = useState<
    ReturnType<typeof generateGeometryQuestion> | null
  >(null);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isOptionCorrect, setIsOptionCorrect] = useState<boolean | null>(null);
  const [gameOver, setGameOver] = useState(false);
  const [showWrongFeedback, setShowWrongFeedback] = useState(false);
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
    // Start game session and generate initial question on mount (client-only)
    const startSession = async () => {
      try {
        const res = await fetch('/api/game/start', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ gameType: 'geometry', difficulty: 1 }),
        });
        const data = await res.json();
        setSessionId(data.sessionId);
        setStartTime(Date.now());
        sessionIdRef.current = data.sessionId;
        startTimeRef.current = Date.now();
      } catch (error) {
        console.error('Failed to start game session:', error);
      } finally {
        // Always ensure we have an initial question on the client
        setGeometryQuestion(generateGeometryQuestion(locale));
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
  const handleQuestionOptionClick = (option: string) => {
    if (gameOver || !geometryQuestion) return;

    setSelectedOption(option);
    const correct = option === geometryQuestion.correctAnswer;
    setIsOptionCorrect(correct);

    if (correct) {
      setCorrectCount((prev) => prev + 1);
    } else {
      setWrongCount((prev) => prev + 1);
      setShowWrongFeedback(true);
      // Yanlış cevapta oyunu bitirip sonuçları gönder
      setTimeout(() => {
        setGameOver(true);
        submitGameResults();
      }, 2000);
    }
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

  const resetGame = () => {
    // Yeni oyun: soru ve durumları sıfırla
    setGeometryQuestion(generateGeometryQuestion(locale));
    setSelectedOption(null);
    setIsOptionCorrect(null);
    setCorrectCount(0);
    setWrongCount(0);
    setGameOver(false);
    setShowWrongFeedback(false);
  };

  const handleDashboard = async () => {
    await submitGameResults();
    router.push(`/${locale}/dashboard`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pastel-green via-pastel-blue to-pastel-yellow">
      <NavigationBar />
      
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
            {t('games.geometry.title')}
          </h1>

          <div className="space-y-8">
            {/* Geometry quiz question using the rich generator only */}
            {geometryQuestion && !gameOver && (
              <div className="mt-8">
                <h3 className="text-2xl font-bold text-cute-primary mb-2">Geometri Sorusu</h3>
                <p className="text-lg text-gray-700 mb-4">{geometryQuestion.question}</p>

                {geometryQuestion.imageHint && (
                  <div className="flex justify-center mb-4">
                    {/* Image hints are optional; make sure the asset exists for best experience */}
                    <img
                      src={geometryQuestion.imageHint}
                      alt={geometryQuestion.type}
                      className="w-24 h-24 object-contain"
                    />
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {geometryQuestion.options.map((option) => {
                    const isSelected = selectedOption === option;
                    const isCorrectOption = option === geometryQuestion.correctAnswer;

                    let bgClass = 'bg-white';
                    if (isSelected && isOptionCorrect === true && isCorrectOption) {
                      bgClass = 'bg-pastel-green';
                    } else if (isSelected && isOptionCorrect === false) {
                      bgClass = 'bg-pastel-pink';
                    }

                    return (
                      <motion.button
                        key={option}
                        whileHover={!gameOver ? { scale: 1.03 } : {}}
                        whileTap={!gameOver ? { scale: 0.97 } : {}}
                        onClick={() => handleQuestionOptionClick(option)}
                        disabled={gameOver}
                        className={`${bgClass} cute-border rounded-xl px-4 py-3 text-center font-semibold text-cute-primary transition-colors`}
                        style={{ WebkitTapHighlightColor: 'transparent' }}
                      >
                        {option}
                      </motion.button>
                    );
                  })}
                </div>

                {selectedOption && (
                  <p
                    className={`mt-3 text-center font-bold ${
                      isOptionCorrect ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    {isOptionCorrect
                      ? 'Harika! Doğru cevap 🎉'
                      : `Doğru cevap: ${geometryQuestion.correctAnswer}`}
                  </p>
                )}

                <div className="flex justify-center mt-4">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      setGeometryQuestion(generateGeometryQuestion(locale));
                      setSelectedOption(null);
                      setIsOptionCorrect(null);
                    }}
                    className="bg-cute-primary text-white px-6 py-3 rounded-xl font-bold"
                  >
                    Yeni soru
                  </motion.button>
                </div>
              </div>
            )}
            
            {gameOver && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center mt-8"
              >
                <div className="text-6xl mb-4">😊</div>
                <h2 className="text-3xl font-bold text-cute-primary mb-4">
                  {t('games.geometry.gameOver')}
                </h2>
                <p className="text-xl text-gray-600 mb-4">
                  {t('games.geometry.wrongAnswerEndsGame')}
                </p>
                <div className="flex gap-4 justify-center">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={resetGame}
                    className="bg-cute-primary text-white px-6 py-3 rounded-xl font-bold"
                  >
                    {t('games.geometry.playAgain')}
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleDashboard}
                    className="bg-cute-accent text-white px-6 py-3 rounded-xl font-bold"
                  >
                    {t('games.geometry.dashboard')}
                  </motion.button>
                </div>
              </motion.div>
            )}
          </div>

          <div className="flex justify-center mt-6 gap-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={resetGame}
              className="bg-cute-secondary text-white px-6 py-3 rounded-xl font-bold"
            >
              {t('games.geometry.reset')}
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleDashboard}
              className="bg-cute-accent text-white px-6 py-3 rounded-xl font-bold"
            >
              {t('games.geometry.dashboard')}
            </motion.button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

