'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations, useLocale } from 'next-intl';
import { generateGeometryQuestion } from '@/lib/gameUtils';
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
  const [shapes] = useState(generateGeometryQuestion());
  const [targets, setTargets] = useState([
    { id: 'target-3', label: '3 sides', shapeId: null as string | null },
    { id: 'target-4', label: '4 equal sides', shapeId: null as string | null },
    { id: 'target-0', label: 'Round shape', shapeId: null as string | null },
  ]);
  const [selectedShape, setSelectedShape] = useState<string | null>(null);
  const [completed, setCompleted] = useState(false);
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
    // Start game session on mount
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

  const shapeData = [
    { id: 'triangle', name: 'Triangle', emoji: '🔺', sides: 3 },
    { id: 'square', name: 'Square', emoji: '⬜', sides: 4 },
    { id: 'circle', name: 'Circle', emoji: '⭕', sides: 0 },
  ];

  const handleShapeClick = (shapeId: string) => {
    if (gameOver) return;
    // If clicking the same shape, deselect it
    if (selectedShape === shapeId) {
      setSelectedShape(null);
    } else {
      setSelectedShape(shapeId);
    }
  };

  const handleTargetClick = (targetId: string) => {
    if (!selectedShape || gameOver) return;

    const shape = shapeData.find((s) => s.id === selectedShape);
    if (!shape) return;

    const target = targets.find((t) => t.id === targetId);
    if (!target || target.shapeId !== null) return;

    // Check if correct match
    const isCorrect =
      (targetId === 'target-3' && shape.sides === 3) ||
      (targetId === 'target-4' && shape.sides === 4) ||
      (targetId === 'target-0' && shape.sides === 0);

    const newTargets = targets.map((target) => {
      if (target.id === targetId) {
        if (isCorrect) {
          setCorrectCount(correctCount + 1);
          return { ...target, shapeId: selectedShape };
        } else {
          setWrongCount(wrongCount + 1);
          setShowWrongFeedback(true);
          // End game on wrong answer
          setTimeout(() => {
            setGameOver(true);
            submitGameResults();
          }, 2000);
        }
      }
      return target;
    });

    setTargets(newTargets);
    setSelectedShape(null);

    // Check if all matched
    if (newTargets.every((t) => t.shapeId !== null)) {
      setCompleted(true);
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
    setTargets([
      { id: 'target-3', label: '3 sides', shapeId: null },
      { id: 'target-4', label: '4 equal sides', shapeId: null },
      { id: 'target-0', label: 'Round shape', shapeId: null },
    ]);
    setSelectedShape(null);
    setCompleted(false);
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

          <p className="text-center text-xl text-gray-700 mb-8">
            {t('games.geometry.instructions')}
          </p>
          {selectedShape && (
            <div className="text-center mb-4 text-lg text-cute-primary font-bold">
              {t('games.geometry.selectedShape', { 
                shape: shapeData.find(s => s.id === selectedShape)?.name || 'Shape' 
              })}
            </div>
          )}

          <div className="space-y-8">
            <div>
              <h3 className="text-2xl font-bold text-cute-primary mb-4">{t('games.geometry.shapes')}</h3>
              <div className="flex gap-4 flex-wrap">
                {shapeData.map((shape) => {
                  const isPlaced = targets.some((t) => t.shapeId === shape.id);
                  if (isPlaced) return null;
                  return (
                    <motion.button
                      key={shape.id}
                      onClick={() => handleShapeClick(shape.id)}
                      disabled={gameOver}
                      whileHover={!gameOver ? { scale: 1.05 } : {}}
                      whileTap={!gameOver ? { scale: 0.95 } : {}}
                      className={`bg-white cute-border border-4 rounded-2xl p-6 cursor-pointer cute-shadow transition-colors touch-manipulation ${
                        gameOver
                          ? 'opacity-50 cursor-not-allowed'
                          : selectedShape === shape.id
                          ? 'bg-pastel-blue border-cute-accent'
                          : 'border-cute-primary hover:bg-pastel-pink'
                      }`}
                      style={{ WebkitTapHighlightColor: 'transparent' }}
                    >
                      <div className="text-5xl mb-2">{shape.emoji}</div>
                      <div className="text-lg font-bold text-cute-primary">{shape.name}</div>
                    </motion.button>
                  );
                })}
              </div>
            </div>

            {!gameOver && (
              <div>
                <h3 className="text-2xl font-bold text-cute-primary mb-4">{t('games.geometry.dropTargets')}</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {targets.map((target) => (
                    <TargetBox
                      key={target.id}
                      id={target.id}
                      label={target.label}
                      shapeId={target.shapeId}
                      selectedShape={selectedShape}
                      onClick={() => handleTargetClick(target.id)}
                      disabled={gameOver}
                    />
                  ))}
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

          <AnimatePresence>
            {completed && (
              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0 }}
                className="mt-8 text-center"
              >
                <div className="text-6xl mb-4">🎉</div>
                <h2 className="text-3xl font-bold text-cute-primary mb-4">{t('games.geometry.excellent')}</h2>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={resetGame}
                  className="bg-cute-primary text-white px-6 py-3 rounded-xl font-bold"
                >
                  {t('games.geometry.playAgain')}
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>

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

