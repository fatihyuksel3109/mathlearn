'use client';

import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import NavigationBar from '@/components/NavigationBar';
import { BADGE_DEFINITIONS } from '@/lib/badgeDefinitions';

export default function BadgesPage() {
  const t = useTranslations();

  const allBadges = Object.values(BADGE_DEFINITIONS);

  return (
    <div className="min-h-screen bg-gradient-to-br from-pastel-purple via-pastel-pink to-pastel-blue">
      <NavigationBar />
      
      <div className="max-w-6xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Page Header */}
          <div className="bg-white cute-border cute-shadow rounded-2xl p-8 text-center">
            <h1 className="text-5xl font-bold text-cute-primary mb-4">
              🏅 {t('pages.badges.title')} 🏅
            </h1>
            <p className="text-xl text-gray-600">
              {t('pages.badges.subtitle')}
            </p>
          </div>

          {/* Badges Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {allBadges.map((badge, index) => (
              <motion.div
                key={badge.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.05, y: -5 }}
                className="bg-white cute-border border-4 border-cute-primary rounded-2xl p-6 text-center cute-shadow relative"
              >
                <div className="text-6xl mb-4">{badge.emoji}</div>
                <h3 className="text-xl font-bold text-cute-primary mb-2">
                  {t(`badges.${badge.id}.name`, { defaultValue: badge.name })}
                </h3>
                <p className="text-gray-600 text-sm mb-4">
                  {t(`badges.${badge.id}.description`, { defaultValue: badge.description })}
                </p>
                <div className="bg-pastel-yellow rounded-lg px-4 py-2 mt-4">
                  <p className="text-sm font-semibold text-cute-primary">
                    {t('pages.badges.howToEarn')}
                  </p>
                  <p className="text-xs text-gray-700 mt-1">
                    {t(`badges.${badge.id}.howToEarn`, { defaultValue: badge.description })}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Info Section */}
          <div className="bg-white cute-border cute-shadow rounded-2xl p-6">
            <h2 className="text-2xl font-bold text-cute-primary mb-4">
              {t('pages.badges.infoTitle')}
            </h2>
            <p className="text-gray-600 mb-4">
              {t('pages.badges.infoDescription')}
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-600">
              <li>{t('pages.badges.infoPoint1')}</li>
              <li>{t('pages.badges.infoPoint2')}</li>
              <li>{t('pages.badges.infoPoint3')}</li>
            </ul>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

