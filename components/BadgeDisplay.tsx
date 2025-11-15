'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations } from 'next-intl';

interface BadgeDisplayProps {
  badges: string[];
}

const badgeEmojis: Record<string, string> = {
  first_game: '🎮',
  perfect_score: '⭐',
  streak_7: '🔥',
  streak_30: '💯',
  xp_1000: '🏆',
  xp_5000: '👑',
  all_levels: '🌟',
  // New badges
  ballon_ustasi: '🎈',
  hizli_refleks: '⚡',
  mukemmel_seri: '💎',
  toplama_kahramani: '🧮',
  carpma_ustasi: '🔢',
  gunun_sampiyonu: '🌟',
  balon_efsanesi: '🕹️',
};

export default function BadgeDisplay({ badges }: BadgeDisplayProps) {
  const t = useTranslations();
  const [hoveredBadge, setHoveredBadge] = useState<string | null>(null);
  const [touchedBadge, setTouchedBadge] = useState<string | null>(null);

  // Close tooltip when clicking outside
  const handleClickOutside = () => {
    if (touchedBadge) {
      setTouchedBadge(null);
    }
  };

  return (
    <div className="grid grid-cols-3 gap-4" onClick={handleClickOutside}>
      {badges.map((badge, index) => (
        <motion.div
          key={badge}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: index * 0.1 }}
          whileHover={{ scale: 1.1, rotate: [0, -5, 5, 0] }}
          className="bg-white cute-border border-4 border-cute-primary rounded-2xl p-6 text-center cute-shadow relative"
        >
          {/* Info Icon */}
          <div className="absolute top-2 right-2">
            <div className="relative">
              <motion.div
                className="w-6 h-6 rounded-full bg-cute-primary text-white flex items-center justify-center text-xs font-bold cursor-pointer"
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.9 }}
                onMouseEnter={() => setHoveredBadge(badge)}
                onMouseLeave={() => setHoveredBadge(null)}
                onTouchStart={(e) => {
                  e.stopPropagation();
                  setTouchedBadge(touchedBadge === badge ? null : badge);
                }}
              >
                i
              </motion.div>
              
              {/* Tooltip */}
              <AnimatePresence>
                {(hoveredBadge === badge || touchedBadge === badge) && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8, y: -10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.8, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="absolute top-8 right-0 z-50 w-48 bg-white cute-border border-2 border-cute-primary rounded-lg p-3 shadow-lg"
                    style={{ pointerEvents: 'auto' }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="text-xs font-bold text-cute-primary mb-1">
                      {t(`badges.${badge}.name`, { defaultValue: badge.replace(/_/g, ' ') })}
                    </div>
                    <div className="text-xs text-gray-600">
                      {t(`badges.${badge}.description`, { defaultValue: '' })}
                    </div>
                    <div className="absolute -top-2 right-4 w-0 h-0 border-l-4 border-r-4 border-b-4 border-transparent border-b-cute-primary"></div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          <div className="text-5xl mb-2">{badgeEmojis[badge] || '🏅'}</div>
          <div className="text-sm font-bold text-cute-primary">
            {t(`badges.${badge}.name`, { defaultValue: badge.replace(/_/g, ' ') })}
          </div>
        </motion.div>
      ))}
      {badges.length === 0 && (
        <div className="col-span-3 text-center text-gray-500 py-8">
          {t('common.noBadges')} 🎯
        </div>
      )}
    </div>
  );
}

