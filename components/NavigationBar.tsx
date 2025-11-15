'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePathname, useRouter } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';

export default function NavigationBar() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { href: `/${locale}/dashboard`, label: t('navigation.dashboard'), icon: '🏠' },
    { href: `/${locale}/games`, label: t('navigation.games'), icon: '🎮' },
    { href: `/${locale}/leaderboard`, label: t('navigation.leaderboard'), icon: '🏆' },
    { href: `/${locale}/rozet`, label: t('navigation.badges'), icon: '🏅' },
    { href: `/${locale}/profile`, label: t('navigation.profile'), icon: '👤' },
  ];

  const switchLocale = (newLocale: string) => {
    const pathWithoutLocale = pathname.replace(`/${locale}`, '') || '/';
    router.push(`/${newLocale}${pathWithoutLocale}`);
  };

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuOpen]);

  return (
    <>
      <nav className="bg-white cute-border border-b-4 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <Link href={`/${locale}`} className="flex items-center space-x-3">
              <motion.div
                whileHover={{ 
                  rotate: [0, 20, -20, 20, 0],
                  scale: 1.15,
                  y: [0, -5, 0]
                }}
                transition={{ duration: 0.6, ease: "easeInOut" }}
                className="text-4xl cursor-pointer"
              >
                🦊
              </motion.div>
              <span className="text-xl md:text-2xl font-bold text-cute-primary">MathLearn</span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-4">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-4 py-2 rounded-xl font-medium transition-colors ${
                    pathname === item.href
                      ? 'bg-cute-primary text-white'
                      : 'text-gray-700 hover:bg-pastel-pink'
                  }`}
                >
                  <span className="mr-2">{item.icon}</span>
                  {item.label}
                </Link>
              ))}

              {/* Language Switcher */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => switchLocale('en')}
                  className={`px-3 py-1 rounded-lg font-medium transition-colors ${
                    locale === 'en'
                      ? 'bg-cute-primary text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  EN
                </button>
                <button
                  onClick={() => switchLocale('tr')}
                  className={`px-3 py-1 rounded-lg font-medium transition-colors ${
                    locale === 'tr'
                      ? 'bg-cute-primary text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  TR
                </button>
              </div>

              {session ? (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => signOut({ callbackUrl: `/${locale}/login` })}
                  className="px-4 py-2 bg-red-400 text-white rounded-xl font-medium hover:bg-red-500"
                >
                  {t('navigation.logout')}
                </motion.button>
              ) : (
                <Link
                  href={`/${locale}/login`}
                  className="px-4 py-2 bg-cute-primary text-white rounded-xl font-medium hover:bg-cute-secondary"
                >
                  {t('navigation.login')}
                </Link>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-xl text-cute-primary hover:bg-pastel-pink transition-colors"
              aria-label="Toggle menu"
            >
              <motion.div
                animate={isMobileMenuOpen ? { rotate: 90 } : { rotate: 0 }}
                transition={{ duration: 0.3 }}
                className="text-3xl"
              >
                {isMobileMenuOpen ? '✕' : '☰'}
              </motion.div>
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
            />

            {/* Sidebar */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed left-0 top-0 h-full w-64 bg-white cute-border border-r-4 z-50 md:hidden overflow-y-auto"
            >
              <div className="p-6">
                {/* Logo in sidebar */}
                <div className="flex items-center space-x-3 mb-8">
                  <div className="text-4xl">🦊</div>
                  <span className="text-2xl font-bold text-cute-primary">MathLearn</span>
                </div>

                {/* Navigation Items */}
                <div className="space-y-2">
                  {navItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`flex items-center px-4 py-3 rounded-xl font-medium transition-colors ${
                        pathname === item.href
                          ? 'bg-cute-primary text-white'
                          : 'text-gray-700 hover:bg-pastel-pink'
                      }`}
                    >
                      <span className="text-2xl mr-3">{item.icon}</span>
                      <span className="text-lg">{item.label}</span>
                    </Link>
                  ))}
                </div>

                {/* Language Switcher */}
                <div className="mt-8 pt-8 border-t-4 border-cute-primary">
                  <div className="mb-4">
                    <div className="text-sm font-medium text-gray-700 mb-2">{t('navigation.language')}</div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => switchLocale('en')}
                        className={`flex-1 px-3 py-2 rounded-lg font-medium transition-colors ${
                          locale === 'en'
                            ? 'bg-cute-primary text-white'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                      >
                        EN
                      </button>
                      <button
                        onClick={() => switchLocale('tr')}
                        className={`flex-1 px-3 py-2 rounded-lg font-medium transition-colors ${
                          locale === 'tr'
                            ? 'bg-cute-primary text-white'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                      >
                        TR
                      </button>
                    </div>
                  </div>
                </div>

                {/* Auth Button */}
                <div className="mt-4 pt-4 border-t-4 border-cute-primary">
                  {session ? (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        signOut({ callbackUrl: `/${locale}/login` });
                      }}
                      className="w-full px-4 py-3 bg-red-400 text-white rounded-xl font-medium hover:bg-red-500"
                    >
                      {t('navigation.logout')}
                    </motion.button>
                  ) : (
                    <Link
                      href={`/${locale}/login`}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="block w-full text-center px-4 py-3 bg-cute-primary text-white rounded-xl font-medium hover:bg-cute-secondary"
                    >
                      {t('navigation.login')}
                    </Link>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

