'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useLocale } from 'next-intl';

interface Level {
  id: string;
  name: string;
  difficulty: number;
  stars: number;
  completed: boolean;
  icon: string;
  position: { x: number; y: number };
}

interface LevelMapProps {
  levels: Level[];
  correctAnswersByLevel?: Record<string, number>;
  getMinCorrectAnswers?: (levelId: string) => number;
  checkLevelUnlocked?: (levelId: string) => boolean;
}

export default function LevelMap({ 
  levels, 
  correctAnswersByLevel = {}, 
  getMinCorrectAnswers,
  checkLevelUnlocked 
}: LevelMapProps) {
  const locale = useLocale();
  
  const isLevelUnlocked = (levelId: string): boolean => {
    if (checkLevelUnlocked) {
      return checkLevelUnlocked(levelId);
    }
    // Fallback to old logic
    if (levelId === '1') return true;
    if (parseInt(levelId) > 1) {
      const prevLevel = levels.find((l) => l.id === String(parseInt(levelId) - 1));
      return prevLevel?.completed === true;
    }
    return false;
  };

  return (
    <div className="relative bg-gradient-to-br from-pastel-blue via-pastel-green to-pastel-yellow rounded-2xl p-8 cute-border border-4 border-cute-primary min-h-[500px]">
      {levels.map((level, index) => {
        const unlocked = isLevelUnlocked(level.id);
        // For locked levels, show progress from previous level
        const levelId = parseInt(level.id);
        const prevLevelId = levelId > 1 ? String(levelId - 1) : level.id;
        const correctAnswers = correctAnswersByLevel[prevLevelId] || 0;
        const minCorrect = getMinCorrectAnswers ? getMinCorrectAnswers(level.id) : 0;
        const progress = minCorrect > 0 ? Math.min(100, (correctAnswers / minCorrect) * 100) : 0;

        return (
          <motion.div
            key={level.id}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            className="absolute"
            style={{ left: `${level.position.x}%`, top: `${level.position.y}%` }}
          >
            <Link
              href={unlocked ? `/${locale}/games/adventure?level=${level.id}` : '#'}
              className={`block ${unlocked ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'}`}
            >
              <motion.div
                whileHover={unlocked ? { scale: 1.2, y: -10 } : {}}
                className="bg-white cute-border border-4 border-cute-primary rounded-2xl p-4 cute-shadow text-center min-w-[120px]"
              >
                <div className="text-4xl mb-2">{level.icon}</div>
                <div className="font-bold text-cute-primary text-sm">{level.name}</div>
                <div className="flex justify-center mt-2">
                  {[...Array(3)].map((_, i) => (
                    <span
                      key={i}
                      className={i < level.stars ? 'text-yellow-400' : 'text-gray-300'}
                    >
                      ⭐
                    </span>
                  ))}
                </div>
                {!unlocked && (
                  <div className="mt-2">
                    <div className="text-2xl mb-1">🔒</div>
                    {getMinCorrectAnswers && minCorrect > 0 && (
                      <div className="text-xs text-gray-600">
                        {correctAnswers}/{minCorrect} ✅
                      </div>
                    )}
                  </div>
                )}
                {unlocked && !level.completed && getMinCorrectAnswers && minCorrect > 0 && correctAnswers < minCorrect && (
                  <div className="text-xs text-gray-600 mt-1">
                    {correctAnswers}/{minCorrect} ✅
                  </div>
                )}
              </motion.div>
            </Link>
          </motion.div>
        );
      })}
    </div>
  );
}

