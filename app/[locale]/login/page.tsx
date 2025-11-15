'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useTranslations, useLocale } from 'next-intl';

export default function LoginPage() {
  const router = useRouter();
  const t = useTranslations();
  const locale = useLocale();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        const errorKey = result.error;
        if (errorKey.startsWith('ERROR:')) {
          const key = errorKey.replace('ERROR:', '');
          setError(t(`pages.login.${key}`) || result.error);
        } else {
          setError(result.error);
        }
        setLoading(false);
      } else {
        router.push(`/${locale}/dashboard`);
        router.refresh();
      }
    } catch (err) {
      setError(t('pages.login.error'));
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pastel-pink via-pastel-purple to-pastel-blue p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white cute-border cute-shadow p-8 max-w-md w-full"
      >
        <motion.div
          animate={{ y: [0, -10, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="text-center mb-6"
        >
          <div className="text-6xl mb-4">🦊</div>
          <h1 className="text-3xl font-bold text-cute-primary">{t('pages.login.title')}</h1>
        </motion.div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('pages.login.email')}
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2 border-4 border-cute-primary rounded-xl focus:outline-none focus:ring-2 focus:ring-cute-accent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('pages.login.password')}
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-2 border-4 border-cute-primary rounded-xl focus:outline-none focus:ring-2 focus:ring-cute-accent"
            />
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-red-100 border-4 border-red-400 rounded-xl p-3 text-red-700"
            >
              {error}
            </motion.div>
          )}

          <motion.button
            type="submit"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            disabled={loading}
            className="w-full bg-cute-primary text-white py-3 rounded-xl font-bold text-lg cute-shadow hover:bg-cute-secondary transition-colors disabled:opacity-50"
          >
            {loading ? t('pages.login.loggingIn') : t('pages.login.loginButton')} 🎮
          </motion.button>
        </form>

        <p className="text-center mt-4 text-gray-600">
          {t('pages.login.noAccount')}{' '}
          <Link href={`/${locale}/signup`} className="text-cute-primary font-bold hover:underline">
            {t('pages.login.signUp')}
          </Link>
        </p>
      </motion.div>
    </div>
  );
}

