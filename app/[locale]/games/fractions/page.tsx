'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations, useLocale } from 'next-intl';
import { DndContext, DragEndEvent, useDroppable } from '@dnd-kit/core';
import FractionBlock from '@/components/FractionBlock';
import { generateFractionQuestion } from '@/lib/gameUtils';
import NavigationBar from '@/components/NavigationBar';

function DroppableSlot({ id, filled }: { id: string; filled: boolean }) {
  const { setNodeRef, isOver } = useDroppable({ id });

  return (
    <div
      ref={setNodeRef}
      className={`w-16 h-16 rounded-xl border-4 ${
        isOver
          ? 'bg-cute-accent border-cute-primary'
          : filled
          ? 'bg-cute-accent border-cute-primary'
          : 'bg-gray-200 border-gray-400'
      } transition-colors`}
    />
  );
}

export default function FractionsPage() {
  const router = useRouter();
  const t = useTranslations();
  const locale = useLocale();
  const [target, setTarget] = useState(generateFractionQuestion());
  const [slots, setSlots] = useState<Array<{ id: string; filled: boolean }>>(
    Array(target.denominator).fill(null).map((_, i) => ({ id: `slot-${i}`, filled: false }))
  );
  const [blocks, setBlocks] = useState<Array<{ id: string; filled: boolean }>>(
    Array(target.numerator).fill(null).map((_, i) => ({ id: `block-${i}`, filled: true }))
  );
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
          body: JSON.stringify({ gameType: 'fractions', difficulty: 1 }),
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

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) return;

    const blockId = active.id as string;
    const slotId = over.id as string;

    if (slotId.startsWith('slot-')) {
      const slotIndex = parseInt(slotId.split('-')[1]);
      const newSlots = [...slots];
      newSlots[slotIndex].filled = true;
      setSlots(newSlots);

      const newBlocks = blocks.filter((b) => b.id !== blockId);
      setBlocks(newBlocks);

      // Check if complete
      const filledCount = newSlots.filter((s) => s.filled).length;
      if (filledCount === target.numerator) {
        setCompleted(true);
        setCorrectCount(correctCount + 1);
      }
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
    const newTarget = generateFractionQuestion();
    setTarget(newTarget);
    setSlots(
      Array(newTarget.denominator)
        .fill(null)
        .map((_, i) => ({ id: `slot-${i}`, filled: false }))
    );
    setBlocks(
      Array(newTarget.numerator)
        .fill(null)
        .map((_, i) => ({ id: `block-${i}`, filled: true }))
    );
    setCompleted(false);
  };

  const handleDashboard = async () => {
    await submitGameResults();
    router.push(`/${locale}/dashboard`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pastel-purple via-pastel-pink to-pastel-blue">
      <NavigationBar />
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white cute-border cute-shadow rounded-2xl p-8"
        >
          <h1 className="text-4xl font-bold text-cute-primary text-center mb-8">
            {t('games.fractions.title')}
          </h1>

          <div className="text-center mb-8">
            <div className="text-5xl font-bold text-cute-primary mb-4">
              {target.numerator}/{target.denominator}
            </div>
            <p className="text-xl text-gray-700">
              {t('games.fractions.instructions', { numerator: target.numerator, denominator: target.denominator })}
            </p>
          </div>

          <DndContext onDragEnd={handleDragEnd}>
            <div className="space-y-8">
              <div>
                <h3 className="text-2xl font-bold text-cute-primary mb-4">{t('games.fractions.dragBlocks')}</h3>
                <div className="flex gap-4 flex-wrap">
                  {blocks.map((block) => (
                    <FractionBlock
                      key={block.id}
                      id={block.id}
                      filled={block.filled}
                      total={target.denominator}
                    />
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-2xl font-bold text-cute-primary mb-4">{t('games.fractions.dropHere')}</h3>
                <div className="flex gap-4 flex-wrap">
                  {slots.map((slot) => (
                    <DroppableSlot key={slot.id} id={slot.id} filled={slot.filled} />
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
                <h2 className="text-3xl font-bold text-cute-primary mb-4">{t('games.fractions.perfect')}</h2>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={resetGame}
                  className="bg-cute-primary text-white px-6 py-3 rounded-xl font-bold"
                >
                  {t('games.fractions.tryAnotherFraction')}
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
              {t('games.fractions.reset')}
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleDashboard}
              className="bg-cute-accent text-white px-6 py-3 rounded-xl font-bold"
            >
              {t('games.fractions.dashboard')}
            </motion.button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

