'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations, useLocale } from 'next-intl';
import { DndContext, DragEndEvent, useDroppable } from '@dnd-kit/core';
import ShapeCard from '@/components/ShapeCard';
import { generateGeometryQuestion } from '@/lib/gameUtils';
import NavigationBar from '@/components/NavigationBar';

function DroppableTarget({ id, label }: { id: string; label: string }) {
  const { setNodeRef, isOver } = useDroppable({ id });

  return (
    <div
      ref={setNodeRef}
      className={`bg-white cute-border border-4 rounded-2xl p-6 text-center min-h-[150px] flex items-center justify-center ${
        isOver ? 'bg-pastel-green border-cute-accent' : 'border-cute-primary'
      } transition-colors`}
    >
      <div className="text-xl font-bold text-cute-primary">{label}</div>
    </div>
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
  const [completed, setCompleted] = useState(false);
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

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) return;

    const shapeId = active.id as string;
    const targetId = over.id as string;

    const shape = shapeData.find((s) => s.id === shapeId);
    if (!shape) return;

    const newTargets = targets.map((target) => {
      if (target.id === targetId) {
        // Check if correct match
        const isCorrect =
          (target.id === 'target-3' && shape.sides === 3) ||
          (target.id === 'target-4' && shape.sides === 4) ||
          (target.id === 'target-0' && shape.sides === 0);

        if (isCorrect) {
          setCorrectCount(correctCount + 1);
          return { ...target, shapeId };
        } else {
          setWrongCount(wrongCount + 1);
        }
      }
      return target;
    });

    setTargets(newTargets);

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
    setCompleted(false);
  };

  const handleDashboard = async () => {
    await submitGameResults();
    router.push(`/${locale}/dashboard`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pastel-green via-pastel-blue to-pastel-yellow">
      <NavigationBar />
      
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

          <DndContext onDragEnd={handleDragEnd}>
            <div className="space-y-8">
              <div>
                <h3 className="text-2xl font-bold text-cute-primary mb-4">{t('games.geometry.shapes')}</h3>
                <div className="flex gap-4 flex-wrap">
                  {shapeData.map((shape) => {
                    const isPlaced = targets.some((t) => t.shapeId === shape.id);
                    if (isPlaced) return null;
                    return (
                      <ShapeCard key={shape.id} id={shape.id} name={shape.name} emoji={shape.emoji} />
                    );
                  })}
                </div>
              </div>

              <div>
                <h3 className="text-2xl font-bold text-cute-primary mb-4">{t('games.geometry.dropTargets')}</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {targets.map((target) => (
                    <DroppableTarget key={target.id} id={target.id} label={target.label} />
                  ))}
                </div>
              </div>
            </div>
          </DndContext>

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

