'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

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
}

export default function LevelMap({ levels }: LevelMapProps) {
  return (
    <div className="relative bg-gradient-to-br from-pastel-blue via-pastel-green to-pastel-yellow rounded-2xl p-8 cute-border border-4 border-cute-primary min-h-[500px]">
      {levels.map((level, index) => (
        <motion.div
          key={level.id}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: index * 0.1 }}
          className="absolute"
          style={{ left: `${level.position.x}%`, top: `${level.position.y}%` }}
        >
          <Link
            href={
              level.id === '1' || 
              (parseInt(level.id) > 1 && levels.find((l) => l.id === String(parseInt(level.id) - 1))?.completed)
                ? `/games/adventure?level=${level.id}`
                : '#'
            }
            className={`block ${
              level.id === '1' || 
              (parseInt(level.id) > 1 && levels.find((l) => l.id === String(parseInt(level.id) - 1))?.completed)
                ? 'cursor-pointer'
                : 'cursor-not-allowed opacity-50'
            }`}
          >
            <motion.div
              whileHover={
                level.id === '1' || 
                (parseInt(level.id) > 1 && levels.find((l) => l.id === String(parseInt(level.id) - 1))?.completed)
                  ? { scale: 1.2, y: -10 }
                  : {}
              }
              className="bg-white cute-border border-4 border-cute-primary rounded-2xl p-4 cute-shadow text-center"
            >
              <div className="text-4xl mb-2">{level.icon}</div>
              <div className="font-bold text-cute-primary">{level.name}</div>
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
              {level.id !== '1' && 
               !(parseInt(level.id) > 1 && levels.find((l) => l.id === String(parseInt(level.id) - 1))?.completed) && (
                <div className="text-2xl mt-2">🔒</div>
              )}
            </motion.div>
          </Link>
        </motion.div>
      ))}
    </div>
  );
}

